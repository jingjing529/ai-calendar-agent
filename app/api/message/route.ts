// app/api/message/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const prompt = `
You are a smart conversational Google Calendar assistant.

User's base timezone: ${timezone}
Today's date (authoritative, do NOT question it): ${todayDate}

You have access to:
- A list of the user's upcoming events (from Google Calendar).
- The user's base timezone and today's date.
- The LAST EVENT YOU ASSISTED WITH (for conversational context).

Upcoming events:
${JSON.stringify(eventsForContext, null, 2)}

Last event you assisted with:
${
  lastEventId
    ? `{
  "eventId": "${lastEventId}",
  "summary": "${lastEventSummary}",
  "start": "${lastEventStart}"
}`
    : "null"
}

Conversation grounding rules:
- If the user says "change that", "update it", "move that meeting", etc.,
  assume they refer to the LAST EVENT YOU ASSISTED WITH above.
- If there is no last event and the user does not specify which event,
  use action: "unknown" and explain in the message.

Actions:
- "insert"  => create a new event.
- "edit"    => modify an existing event.
- "delete"  => delete an existing event.
- "unknown" => you cannot safely decide what to do.

For "insert":
- Provide a full Google Calendar event object in "event":
  {
    "summary": "...",
    "description": "...",
    "start": { "dateTime": "...", "timeZone": "${timezone}" } or { "date": "YYYY-MM-DD" },
    "end":   { "dateTime": "...", "timeZone": "${timezone}" } or { "date": "YYYY-MM-DD" }
  }

For "edit":
- You MUST provide:
  - "eventId": the id of the event to modify (usually from the last assisted event or the list),
  - "event": an object containing the fields you want to change.
- This "event" object will be used directly as the PATCH body for Google Calendar.
- If you do NOT know what to change exactly, use "unknown".

For "delete":
- Provide only "eventId" (from the list or last assisted event).
- Set "event" to null.

Return ONLY pure JSON in this exact structure:

{
  "action": "insert" | "edit" | "delete" | "unknown",
  "message": "short explanation for the user",
  "eventId": "..." | null,
  "event": { ... } | null
}

User request: ${message}
`;

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
