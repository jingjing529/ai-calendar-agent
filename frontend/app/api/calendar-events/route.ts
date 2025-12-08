import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink ?: string;
};

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "No Google access token" },
        { status: 401 }
      );
    }

    const now = new Date();
    const timeMin = now.toISOString();

    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const timeMax = oneMonthLater.toISOString();

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to fetch events:", res.status, text);
      return NextResponse.json(
        { success: false, error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    const data = await res.json();
    const items = (data.items as GoogleCalendarEvent[]) || [];

    const formatted = items.map((e) => ({
      id: e.id,
      title: e.summary || "(No title)",
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      description: e.description,
      htmlLink: e.htmlLink,
    }));

    return NextResponse.json({ success: true, events: formatted });
  } catch (err: any) {
    console.error("calendar-events error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
