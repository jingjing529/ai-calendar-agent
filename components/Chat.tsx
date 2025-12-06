"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
  event?: any;
  action?: "insert" | "edit" | "delete";
  eventId?: string;
}

interface ChatProps {
  onEventUpdated?: () => void;
}

export default function Chat({ onEventUpdated }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false); // show typing indicator
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const intro: Message = {
      role: "assistant",
      text: "👋 Hi! I'm your smart Calendar Assistant.\n\nI can create, update, or delete Google Calendar events for you automatically.\nJust tell me what you'd like to do!",
    };

    setMessages([intro]);
  }, []);

  const clearChat = () => {
    const intro: Message = {
      role: "assistant",
      text: "👋 Hi! I'm your smart Calendar Assistant.\n\nI can create, update, or delete Google Calendar events for you automatically.\nJust tell me what you'd like to do!",
    };
    setMessages([intro]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");

    try {
      setIsThinking(true);

      const timezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, timezone: timezone }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        text: data.message,
        event: data.event ?? undefined,
        action: data.action ?? undefined,
        eventId: data.eventId ?? undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Automatically handle the action (insert/edit/delete) via single POST
      await handleEventAction(assistantMessage);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error: Could not get a response." },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleEventAction = async (message: Message) => {
    if (!message.action) return;

    try {
      await fetch("/api/calendar", {
        method: "POST", // single endpoint handles insert/edit/delete
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: message.action,
          event: message.event ?? undefined,
          eventId: message.eventId ?? undefined,
        }),
      });

      onEventUpdated?.();
    } catch (err) {
      console.error(`Error handling ${message.action} event:`, err);
      // Optionally push an assistant error message:
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Error performing ${message.action} on calendar.`,
        },
      ]);
    }
  };

  // Auto-scroll to bottom on new messages / thinking status change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // small helper to format message text (keeps line breaks)
  const renderText = (t?: string) =>
    t ? t.split("\n").map((line, i) => <div key={i}>{line}</div>) : null;

  return (
    <div className="flex flex-col w-full max-w-md h-[95vh] bg-white rounded-2xl shadow-xl overflow-hidden">
<div className="flex items-center justify-between p-4 border-b">
  {/* Left side (avatar + title) */}
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
      AI
    </div>
    <div>
      <div className="font-semibold">Calendar Assistant</div>
      <div className="text-xs text-gray-500">Ask me to create, edit or delete events</div>
    </div>
  </div>

<button
  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
  onClick={clearChat}
>
  Clear Chat
</button>
</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="mr-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium">
                  A
                </div>
              </div>
            )}

            <div
              className={`max-w-[78%] break-words ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-2xl rounded-br-none px-4 py-2 shadow"
                  : "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{renderText(m.text)}</div>
              {/* small meta row if action present */}
              {m.action && (
                <div className="text-xs mt-2 text-gray-500">
                  <span className="font-medium capitalize">{m.action}</span>
                  {m.eventId ? ` — id: ${m.eventId}` : ""}
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="ml-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  U
                </div>
              </div>
            )}
          </div>
        ))}

        {/* typing indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="mr-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium">
                A
              </div>
            </div>

            <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm flex items-center">
              <div className="typing-dots flex items-center gap-1">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t flex items-center gap-2">
<textarea
  className="flex-1 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y min-h-[40px] max-h-[150px]"
  placeholder="Try: 'Schedule meeting tomorrow at 10am with Alice'"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
  aria-label="Message"
/>


  <button
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
    onClick={sendMessage}
    aria-label="Send"
  >
    Send
  </button>
</div>


      {/* scoped styles for typing animation */}
      <style jsx>{`
        .typing-dots .dot {
          width: 8px;
          height: 8px;
          background: #374151; /* gray-700 */
          border-radius: 50%;
          display: inline-block;
          opacity: 0.25;
          transform: translateY(0);
          animation: blink 1s infinite;
        }
        .typing-dots .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dots .dot:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dots .dot:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes blink {
          0% {
            opacity: 0.25;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
          60% {
            opacity: 0.5;
            transform: translateY(0);
          }
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
