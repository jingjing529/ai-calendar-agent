"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  text: string;
  event?: any;
  action?: "insert" | "edit" | "delete";
  eventId?: string;
  timestamp?: Date;
}

interface ChatProps {
  onEventUpdated?: () => void;
}

const QUICK_ACTIONS = [
  "📅 Schedule a meeting with John Doe tomorrow 2-3pm",
  "🗑️ Delete my next event",
  "✏️ Reschedule my 3pm meeting",
];

export default function Chat({ onEventUpdated }: ChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const intro: Message = {
      role: "assistant",
      text: "Hi! I'm Cal-E,your AI Calendar Assistant. I can help you manage your Google Calendar with natural language.\n\nTry saying things like:\n• \"Schedule a meeting tomorrow at 2pm\"\n• \"What's on my calendar this week?\"\n• \"Move my 3pm meeting to 4pm\"",
      timestamp: new Date(),
    };
    setMessages([intro]);
  }, []);

  const clearChat = () => {
    const intro: Message = {
      role: "assistant",
      text: "Hi! I'm your AI Calendar Assistant. I can help you manage your Google Calendar with natural language.\n\nTry saying things like:\n• \"Schedule a meeting tomorrow at 2pm\"\n• \"What's on my calendar this week?\"\n• \"Move my 3pm meeting to 4pm\"",
      timestamp: new Date(),
    };
    setMessages([intro]);
    setStreamingText("");
  };

  const handleDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const confirmDisconnect = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  const JSON_META_SEPARATOR = "---JSON_META---";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");

    try {
      setIsThinking(true);
      setStreamingText(""); 
      const controller = new AbortController();
      controllerRef.current = controller;
      
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, timezone }),
        signal: controller.signal,
      });

      if (!res.body) {
        throw new Error("No body in streaming response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        const separatorIndex = fullText.indexOf(JSON_META_SEPARATOR);
        if (separatorIndex !== -1) {
          setStreamingText(fullText.slice(0, separatorIndex).trim());
        } else {
          setStreamingText(fullText);
        }
      }

      let messageText = fullText;
      let action: "insert" | "edit" | "delete" | undefined;
      let event: any;
      let eventId: string | undefined;

      const separatorIndex = fullText.indexOf(JSON_META_SEPARATOR);
      if (separatorIndex !== -1) {
        messageText = fullText.slice(0, separatorIndex).trim();
        const jsonPart = fullText.slice(separatorIndex + JSON_META_SEPARATOR.length).trim();

        try {
          const metadata = JSON.parse(jsonPart);
          if (metadata.action && metadata.action !== "unknown") {
            action = metadata.action;
            event = metadata.event;
            eventId = metadata.eventId;
          }
        } catch (parseErr) {
          console.error("Failed to parse JSON metadata:", parseErr);
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        text: messageText,
        timestamp: new Date(),
        ...(action && { action }),
        ...(event && { event }),
        ...(eventId && { eventId }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingText("");

      if (action) {
        await handleEventAction(assistantMessage);
      }
    } catch (err) {
      if (err.name === "AbortError") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "[Stopped]", timestamp: new Date() },
      ]);
    } else {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I encountered an error. Please try again.", timestamp: new Date() },
      ]);
    }
      setStreamingText("");
    } finally {
      setIsThinking(false);
      controllerRef.current = null;
    }
  };

  const handleEventAction = async (message: Message) => {
    if (!message.action) return;

    setIsExecuting(true);
    try {
      await fetch("/api/calendar", {
        method: "POST",
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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Failed to ${message.action} the event. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action.replace(/^[^\s]+\s/, "")); 
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "insert":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Created
          </span>
        );
      case "edit":
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Updated
          </span>
        );
      case "delete":
        return (
          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deleted
          </span>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, streamingText]);

  const renderText = (t?: string) =>
    t ? t.split("\n").map((line, i) => <div key={i}>{line || <br />}</div>) : null;

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col w-full max-w-md h-[95vh] bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      <div 
        className="p-4"
        style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h1 className="font-semibold text-white text-lg">Cal-E</h1>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Online • Ready to help
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              onClick={clearChat}
              title="Clear chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              onClick={handleDisconnect}
              title="Disconnect"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isExecuting && (
        <div className="bg-[#4285F4]/10 border-b border-[#4285F4]/20 px-4 py-2 flex items-center gap-2 text-[#4285F4] text-sm">
          <div className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
          Updating your calendar...
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
          >
            {m.role === "assistant" && (
              <div className="mr-2 shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                  style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            )}

            <div className={`max-w-[80%] ${m.role === "user" ? "order-1" : ""}`}>
              <div
                className={`${
                  m.role === "user"
                    ? "bg-[#4285F4] text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-md"
                    : "bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-100"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {renderText(m.text)}
                </div>
                {m.action && (
                  <div className="mt-2 pt-2 border-t border-gray-100/50">
                    {getActionIcon(m.action)}
                  </div>
                )}
              </div>
              <div className={`text-[10px] text-gray-400 mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {formatTime(m.timestamp)}
              </div>
            </div>

            {m.role === "user" && (
              <div className="ml-2 shrink-0 order-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {streamingText && (
          <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="mr-2 shrink-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-100 max-w-[80%]">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {renderText(streamingText)}
              </div>
            </div>
          </div>
        )}

        {isThinking && !streamingText && (
          <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="mr-2 shrink-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
              >
                <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#4285F4] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-[#4285F4] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-[#4285F4] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {messages.length === 1 && !isThinking && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-[#4285F4]/10 hover:text-[#4285F4] text-gray-600 rounded-full transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-transparent resize-none text-sm bg-gray-50 placeholder-gray-400 transition-all text-black"
              placeholder="Ask me anything about your calendar..."
              disabled={isThinking}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                !isThinking &&
                (e.preventDefault(), sendMessage())
              }
              rows={1}
              style={{ minHeight: "48px", maxHeight: "120px" }}
              aria-label="Message"
            />
          </div>
          <button
            className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              !isThinking && input.trim()
                ? "bg-[#4285F4] text-white shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-red-500 text-white shadow hover:bg-red-600"
            }`}
            onClick={
              !isThinking && input.trim()
                ? sendMessage
                : () => controllerRef.current?.abort()
            }
            aria-label={!isThinking && input.trim() ? "Send" : "Stop"}
          >
            {!isThinking && input.trim() ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
              </svg>
            )}
          </button>

        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>

      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-lg w-full">
            <div 
              className="absolute top-0 left-0 right-0 h-32 rounded-t-3xl opacity-10"
              style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
            ></div>

            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4] to-[#34A853] rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-24 h-24 md:w-28 md:h-28">
                    <Image
                      src="/AI-Avatar.png"
                      alt="Cal-E Avatar"
                      width={112}
                      height={112}
                      className="drop-shadow-lg"
                      priority
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
                Disconnect?
              </h2>

              <p className="text-gray-600 text-center mb-8 leading-relaxed text-base">
                Are you sure you want to disconnect? You&apos;ll need to log in again to use Cal-E.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={confirmDisconnect}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)'
                  }}
                >
                  Yes
                </button>

                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold transition-all duration-300 hover:bg-gray-200 hover:scale-105 border border-gray-200"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
