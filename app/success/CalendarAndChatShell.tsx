// app/success/CalendarAndChatShell.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import CalendarView from "./CalendarView";
import Chat from "@/components/Chat";

type CalendarEventInput = {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
};

export default function CalendarAndChatShell() {
  const [events, setEvents] = useState<CalendarEventInput[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/calendar-events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      } else {
        console.error("Failed to load events:", data.error);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadEvents();
  }, [reloadEvents]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6">
      {/* 左边：Chat */}
      <Chat onEventUpdated={reloadEvents} />

      {/* 右边：Calendar */}
      <div className="bg-white rounded-2xl shadow p-4">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading calendar...</div>
        ) : (
          <CalendarView events={events} />
        )}
      </div>
    </div>
  );
}
