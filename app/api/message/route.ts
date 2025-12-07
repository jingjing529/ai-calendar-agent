// app/api/message/stream/route.ts
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { buildCalendarAgentPrompt } from "./prompt";

export const runtime = "nodejs";

const JSON_META_SEPARATOR = "---JSON_META---";

export async function POST(req: NextRequest) {
  try {
    const { message, timezone: clientTimezone } = await req.json();
    const cookieStore = await cookies();

    // 获取 last event cookies
    const lastEventId = cookieStore.get("last_event_id")?.value || null;
    const lastEventSummary = cookieStore.get("last_event_summary")?.value || null;
    const lastEventStart = cookieStore.get("last_event_start")?.value || null;

    const timezone =
      clientTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";
    
    // 获取用户时区的当前日期时间
    const now = new Date();
    const currentDateTime = now.toLocaleString("en-US", { 
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    // 例如: "Friday, December 6, 2024 at 7:53 PM"
    
    // 获取日历事件作为上下文
    const accessToken = cookieStore.get("google_access_token")?.value;
    let eventsForContext: any[] = [];

    if (accessToken) {
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
      });

      const resEvents = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (resEvents.ok) {
        const data = await resEvents.json();
        eventsForContext = (data.items || []).map((e: any) => ({
          id: e.id,
          summary: e.summary,
          description: e.description,
          start: e.start,
          end: e.end,
        }));
      } else {
        console.error(
          "Failed to fetch events for context:",
          resEvents.status,
          await resEvents.text()
        );
      }
    }

    // 🔥 使用完整的 prompt 构造
    const prompt = buildCalendarAgentPrompt({
      userMessage: message,
      timezone,
      currentDateTime,
      eventsForContext,
      lastEventId,
      lastEventSummary,
      lastEventStart,
    });

    // 调 Deno 后端的流式接口
    const upstreamRes = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    if (!upstreamRes.body) {
      return new Response("Upstream has no body", { status: 500 });
    }

    const encoder = new TextEncoder();

    // 用 ReadableStream 处理流式响应，只发送 message 部分
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let metaStarted = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // 检查是否包含分隔符
            const separatorIndex = buffer.indexOf(JSON_META_SEPARATOR);

            if (separatorIndex !== -1) {
              // 发送分隔符之前的 message 部分
              if (!metaStarted) {
                const messagePart = buffer.slice(0, separatorIndex).trim();
                if (messagePart) {
                  controller.enqueue(encoder.encode(messagePart));
                }
                metaStarted = true;
              }
              // 分隔符之后的部分是 JSON metadata，我们用 SSE 格式发送
              buffer = buffer.slice(separatorIndex + JSON_META_SEPARATOR.length);
            } else if (!metaStarted) {
              // 还没遇到分隔符，流式发送当前内容（保留一些 buffer 以防分隔符被截断）
              const safeLength = buffer.length - JSON_META_SEPARATOR.length;
              if (safeLength > 0) {
                const safeContent = buffer.slice(0, safeLength);
                controller.enqueue(encoder.encode(safeContent));
                buffer = buffer.slice(safeLength);
              }
            }
          }

          // 流结束，发送剩余的 message 部分（如果还没遇到分隔符）
          if (!metaStarted && buffer.trim()) {
            controller.enqueue(encoder.encode(buffer.trim()));
          }

          // 如果有 JSON metadata，用特殊标记发送给前端
          if (metaStarted && buffer.trim()) {
            const jsonMeta = buffer.trim();
            // 用特殊前缀发送 metadata，前端可以识别并解析
            controller.enqueue(encoder.encode(`\n${JSON_META_SEPARATOR}\n${jsonMeta}`));
          }
        } catch (err) {
          console.error("Proxy stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("stream route error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
