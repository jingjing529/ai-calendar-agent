// app/api/calendar/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { action, event, eventId } = await req.json();
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("google_access_token")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    if (action === "insert") {
      if (!event) {
        return NextResponse.json(
          { success: false, error: "No event provided for insert" },
          { status: 400 }
        );
      }

      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      const created = res.data;

      cookieStore.set("last_event_id", created.id || "");
      cookieStore.set("last_event_summary", created.summary || "");
      cookieStore.set(
        "last_event_start",
        created.start?.dateTime || created.start?.date || ""
      );

      return NextResponse.json({
        success: true,
        action,
        event: created,
        eventId: created.id,
      });
    }

    if (action === "edit") {
      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Missing eventId for edit" },
          { status: 400 }
        );
      }
      if (!event) {
        return NextResponse.json(
          { success: false, error: "No event object provided for edit" },
          { status: 400 }
        );
      }

      const res = await calendar.events.patch({
        calendarId: "primary",
        eventId,
        requestBody: event,
      });

      const updated = res.data;

      cookieStore.set("last_event_id", updated.id || "");
      cookieStore.set("last_event_summary", updated.summary || "");
      cookieStore.set(
        "last_event_start",
        updated.start?.dateTime || updated.start?.date || ""
      );

      return NextResponse.json({
        success: true,
        action,
        event: updated,
        eventId,
      });
    }

    if (action === "delete") {
      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Missing eventId for delete" },
          { status: 400 }
        );
      }

      await calendar.events.delete({
        calendarId: "primary",
        eventId,
      });

      return NextResponse.json({ success: true, action, eventId });
    }

    return NextResponse.json({
      success: false,
      error: "Unknown action",
    });
  } catch (err: any) {
    console.error("Calendar API Error:", err);
    return NextResponse.json({
      success: false,
      error: err.message ?? "Unknown error",
    });
  }
}
