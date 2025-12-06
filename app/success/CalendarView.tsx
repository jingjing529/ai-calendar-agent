// app/success/CalendarView.tsx
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
    // TODO: 这里之后接你自己的删除接口
    console.log("Delete event:", tooltip.eventId);
    alert(`(示例) 删除事件：${tooltip.title}`);
  };

  const handleReschedule = () => {
    if (!tooltip?.eventId) return;
    // TODO: 这里之后接你自己的改时间逻辑
    console.log("Reschedule event:", tooltip.eventId);
    alert(`(示例) Reschedule 事件：${tooltip.title}`);
  };
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventInserted = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return (
    <div ref={containerRef} className="relative">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
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

          const left =
            eventRect.left +
            eventRect.width / 2 -
            containerRect.left;
          const top =
            eventRect.top - containerRect.top - 10; // 在 event 上方一点

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
        // 不在这里立即清空 tooltip，避免移到 tooltip 上就消失
        eventMouseLeave={() => {
          // 交给 tooltip 自己的 onMouseLeave 处理
        }}
      />

      {/* 悬浮小卡片（tooltip） */}
      {tooltip && (
        <div
          className="
            absolute z-50
            bg-white 
            border border-gray-200 
            shadow-lg 
            rounded-lg 
            px-3 py-2 
            text-sm 
            max-w-xs
          "
          style={{
            left: tooltip.left,
            top: tooltip.top,
            transform: "translate(-50%, -100%)",
          }}
          // 鼠标离开 tooltip 区域时才关闭
          onMouseLeave={() => setTooltip(null)}
          onMouseEnter={() => {}} // 进入时不做事，保证不闪
        >
          <div className="font-semibold mb-1">{tooltip.title}</div>

          <div className="text-xs text-gray-500 mb-1">
            {formatEventTime(tooltip.start, tooltip.end)}
          </div>

          {tooltip.description ? (
            <div className="text-xs text-gray-700 whitespace-pre-wrap mb-2">
              {tooltip.description}
            </div>
          ) : (
            <div className="text-xs text-gray-400 mb-2">没有描述内容。</div>
          )}

          {/* 三个按钮区域 */}
          <div className="mt-1 flex gap-2 justify-end">
            {/* Edit in app: 实际上是打开 Google Calendar */}
            {tooltip.htmlLink && (
              <button
                type="button"
                onClick={handleEditInApp}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Edit in app
              </button>
            )}

            <button
              type="button"
              onClick={handleReschedule}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Reschedule
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </button>
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
  