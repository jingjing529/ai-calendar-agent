// app/api/message/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildCalendarAgentPrompt } from "./prompt";

function extractJsonBlock(text: string) {
  const fenceMatch = text.match(/```json([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {}
  }
  return null;
}

export async function POST(req: Request) {
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
      const nowInUserTZ = new Date(
        new Date().toLocaleString("en-US", { timeZone: timezone })
      );
      const todayDate = nowInUserTZ.toISOString().split("T")[0];

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
      todayDate,
      eventsForContext,
      lastEventId,
      lastEventSummary,
      lastEventStart,
    });

    const resLLM = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await resLLM.json();

    let output =
      extractJsonBlock(data.reply) || {
        action: "unknown",
        message: data.reply,
        event: null,
        eventId: null,
      };

    return NextResponse.json(output);
  } catch (err) {
    console.error("message route error:", err);
    return NextResponse.json({
      action: "unknown",
      message: "Server error",
      error: String(err),
      event: null,
      eventId: null,
    });
  }
}
