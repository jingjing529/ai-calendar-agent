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

  // 1️⃣ 保留原来的非流式 /chat（给 planner 用）
  if (req.method === "POST" && url.pathname === "/chat") {
    const { message } = await req.json();

    const event$ = agent.runTask(message, "claude-sonnet-4-20250514");

    let fullText = "";

    for await (const event of eachValueFrom(event$)) {
      // ✅ 累积所有 text 事件的内容，得到完整回复
      if (event.type === "text") {
        fullText += event.content;
      }
    }

    return new Response(JSON.stringify({ reply: fullText }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2️⃣ 新增真正流式的 /chat-stream
  if (req.method === "POST" && url.pathname === "/chat-stream") {
    const { message } = await req.json();

    const event$ = agent.runTask(message, "claude-sonnet-4-20250514");
    const encoder = new TextEncoder();

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of eachValueFrom(event$)) {
            if (event.type === "text") {
              // 👇 每次有增量 text，就直接往 HTTP 响应里写一段
              controller.enqueue(encoder.encode(event.content));
            }
            // 你也可以在这里根据需要处理其他类型，例如 tool use 等
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

console.log("🌐 Zypher API running at http://localhost:8000/chat & /chat-stream …");
