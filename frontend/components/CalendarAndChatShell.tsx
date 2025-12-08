// components/CalendarAndChatShell.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Chat from "@/components/Chat";
import CalendarView from "./CalendarView";

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
  const [activeTab, setActiveTab] = useState<"chat" | "calendar">("chat");

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
    <>
      {/* Mobile Tab Switcher - only visible on small screens */}
      <div className="lg:hidden flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
            ${activeTab === "chat" 
              ? "bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/20" 
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
            ${activeTab === "calendar" 
              ? "bg-[#FBBC04] text-white shadow-lg shadow-[#EA4335]/20" 
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-[420px_1fr] gap-6 h-[calc(100vh-180px)]">
        {/* Left: Chat */}
        <div className="h-full">
          <Chat onEventUpdated={reloadEvents} />
        </div>

        {/* Right: Calendar */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#EA4335] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 text-sm">Loading calendar...</span>
              </div>
            </div>
          ) : (
            <CalendarView events={events} />
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Chat View */}
        <div className={`${activeTab === "chat" ? "flex" : "hidden"} justify-center items-start`}>
          <Chat onEventUpdated={reloadEvents} />
        </div>

        {/* Calendar View */}
        <div className={`${activeTab === "calendar" ? "block" : "hidden"}`}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            {loading ? (
              <div className="h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-[#EA4335] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500 text-sm">Loading calendar...</span>
                </div>
              </div>
            ) : (
              <CalendarView events={events} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
