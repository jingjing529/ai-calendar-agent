import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { buildCalendarAgentPrompt } from "./prompt";

export const runtime = "nodejs";

const JSON_META_SEPARATOR = "---JSON_META---";

export async function POST(req: NextRequest) {
  try {
    const { message, timezone: clientTimezone } = await req.json();
    const cookieStore = await cookies();

    const lastEventId = cookieStore.get("last_event_id")?.value || null;
    const lastEventSummary = cookieStore.get("last_event_summary")?.value || null;
    const lastEventStart = cookieStore.get("last_event_start")?.value || null;

    const timezone =
      clientTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";
    
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

    const prompt = buildCalendarAgentPrompt({
      userMessage: message,
      timezone,
      currentDateTime,
      eventsForContext,
      lastEventId,
      lastEventSummary,
      lastEventStart,
    });
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;

    const upstreamRes = await fetch(`${base}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    if (!upstreamRes.body) {
      return new Response("Upstream has no body", { status: 500 });
    }

    const encoder = new TextEncoder();

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

            const separatorIndex = buffer.indexOf(JSON_META_SEPARATOR);

            if (separatorIndex !== -1) {
              if (!metaStarted) {
                const messagePart = buffer.slice(0, separatorIndex);
                if (messagePart) {
                  controller.enqueue(encoder.encode(messagePart));
                }
                metaStarted = true;
                buffer = buffer.slice(separatorIndex + JSON_META_SEPARATOR.length);
              }
            } else if (!metaStarted) {
              if (buffer.length > 0) {
                controller.enqueue(encoder.encode(buffer));
                buffer = ""; 
              }
            }
          }

          if (!metaStarted && buffer.trim()) {
            controller.enqueue(encoder.encode(buffer.trim()));
          }

          if (metaStarted && buffer.trim()) {
            const jsonMeta = buffer.trim();
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
