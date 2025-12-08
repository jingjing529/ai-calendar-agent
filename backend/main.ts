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

const port = Number(Deno.env.get("PORT") ?? "8000");

const FRONTEND_ORIGIN = Deno.env.get("FRONTEND_ORIGIN") ?? "*";

function withCors(body: BodyInit | null, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  return new Response(body, { ...init, headers });
}

const zypherContext = await createZypherContext(Deno.cwd());

const agent = new ZypherAgent(
  zypherContext,
  new AnthropicModelProvider({
    apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
  })
);

await agent.mcp.registerServer({
  id: "firecrawl",
  type: "command",
  command: {
    command: "npx",
    args: ["-y", "firecrawl-mcp"],
    env: { FIRECRAWL_API_KEY: getRequiredEnv("FIRECRAWL_API_KEY") },
  },
});

console.log("Zypher Agent initialized.");
console.log(`Listening on port ${port}`);

Deno.serve({ port }, async (req) => {
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

    return withCors(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  }

  return withCors("Not found", { status: 404 });
});
