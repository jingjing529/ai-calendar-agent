import {
  AnthropicModelProvider,
  createZypherContext,
  ZypherAgent,
} from "@corespeed/zypher";
import { eachValueFrom } from "rxjs-for-await";

function getRequiredEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

// Initialize Zypher
const zypherContext = await createZypherContext(Deno.cwd());

const agent = new ZypherAgent(
  zypherContext,
  new AnthropicModelProvider({
    apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
  })
);

// Register MCP server for web crawling
await agent.mcp.registerServer({
  id: "firecrawl",
  type: "command",
  command: {
    command: "npx",
    args: ["-y", "firecrawl-mcp"],
    env: { FIRECRAWL_API_KEY: getRequiredEnv("FIRECRAWL_API_KEY") },
  },
});

console.log("🔥 Zypher Agent initialized.");

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/chat") {
    const { message } = await req.json();

    const event$ = agent.runTask(message, "claude-sonnet-4-20250514");
    const encoder = new TextEncoder();

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of eachValueFrom(event$)) {
            if (event.type === "text") {
              controller.enqueue(encoder.encode(event.content));
            }
          }
        } catch (err) {
          console.error("streaming error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response("Not found", { status: 404 });
});

