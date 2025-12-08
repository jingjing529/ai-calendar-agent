"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import Chat from "@/components/Chat";

type CalendarEventInput = {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps?: {
    description?: string;
    htmlLink?: string;
  };
};

type Props = {
  events: CalendarEventInput[];
};

type TooltipState = {
  left: number;
  top: number;
  eventId: string;
  title: string;
  start?: Date | null;
  end?: Date | null;
  description?: string;
  htmlLink?: string;
};

export default function CalendarView({ events }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleEditInApp = () => {
    if (!tooltip?.htmlLink) return;
    window.open(tooltip.htmlLink, "_blank", "noopener,noreferrer");
  };

  const handleDelete = () => {
    if (!tooltip?.eventId) return;
    console.log("Delete event:", tooltip.eventId);
  };

  const handleReschedule = () => {
    if (!tooltip?.eventId) return;
    console.log("Reschedule event:", tooltip.eventId);
  };
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventInserted = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return (
    <div ref={containerRef} className="relative">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        height="80vh"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventMouseEnter={(info) => {
          const container = containerRef.current;
          if (!container) return;

          const containerRect = container.getBoundingClientRect();
          const eventRect = info.el.getBoundingClientRect();
          const ext = info.event.extendedProps as any;

          const eventCenterX = eventRect.left + eventRect.width / 2 - containerRect.left;
          const eventTop = eventRect.top - containerRect.top;
          
          const tooltipWidth = 280; 
          const tooltipHeight = 150; 
          const padding = 10;

          let left = eventCenterX;
          let top = eventTop - padding;
          
          if (left + tooltipWidth / 2 > containerRect.width) {
            left = containerRect.width - tooltipWidth / 2 - padding;
          }
          if (left - tooltipWidth / 2 < padding) {
            left = tooltipWidth / 2 + padding;
          }
          
          if (top - tooltipHeight < 0) {
            top = eventRect.bottom - containerRect.top + padding;
          }

          setTooltip({
            left,
            top,
            eventId: info.event.id,
            title: info.event.title,
            start: info.event.start,
            end: info.event.end,
            description: ext?.description || "",
            htmlLink: ext?.htmlLink || "",
          });

          (info.el as HTMLElement).style.cursor = "pointer";
        }}
        eventMouseLeave={() => {
        }}
      />

      {tooltip && (
        <div
          className="
            absolute z-50
            bg-white 
            border border-gray-200 
            shadow-lg 
            rounded-lg 
            px-4 py-3 
            text-sm 
            w-72
            max-h-64
            overflow-y-auto
          "
          style={{
            left: tooltip.left,
            top: tooltip.top,
            transform: "translate(-50%, -100%)",
          }}
          onMouseLeave={() => setTooltip(null)}
          onMouseEnter={() => {}}
        >
          <button
            type="button"
            onClick={() => setTooltip(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="font-semibold mb-2 pr-6 text-black">{tooltip.title}</div>

          <div className="text-xs text-gray-500 mb-2">
            {formatEventTime(tooltip.start, tooltip.end)}
          </div>

          {tooltip.description ? (
            <div className="text-xs text-gray-700 whitespace-pre-wrap mb-3 max-h-32 overflow-y-auto">
              {tooltip.description}
            </div>
          ) : (
            <div className="text-xs text-gray-400 mb-3">No description</div>
          )}

          <div className="mt-1 flex gap-2 justify-end">
            {tooltip.htmlLink && (
              <button
                type="button"
                onClick={handleEditInApp}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Edit in app
              </button>
            )}

            {/* <button
              type="button"
              onClick={handleReschedule}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-[#EA4335] hover:bg-[#d33b2c] text-white"
            >
              Reschedule
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </button> */}
          </div>

         
        </div>
      )}
    </div>
  );
}

function formatEventTime(start?: Date | null, end?: Date | null): string {
    if (!start) return "Unknown time";
  
    const datePart = start.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  
    const timePart = start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  
    if (!end) return `${datePart} · ${timePart}`;
  
    const endTime = end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  
    return `${datePart} · ${timePart} - ${endTime}`;
  }
  
