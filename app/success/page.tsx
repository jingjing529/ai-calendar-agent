// app/success/page.tsx
import CalendarAndChatShell from "@/components/CalendarAndChatShell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SuccessPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Header with Robot */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Robot + Speech Bubble */}
              <div className="flex items-end gap-4">
                {/* Big Robot Emoji */}
                <div className="text-5xl md:text-6xl ">
                  🤖
                </div>
                
                {/* Speech Bubble */}
                <div className="relative bg-white rounded-2xl shadow-lg px-5 py-3 border border-gray-100 max-w-md">
                  {/* Bubble tail pointing to robot */}
                  <div className="absolute left-0 bottom-3 -translate-x-full">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-white"></div>
                  </div>
                  <div className="absolute left-0 bottom-3 -translate-x-full -ml-[1px]">
                    <div className="w-0 h-0 border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent border-r-[13px] border-r-gray-100"></div>
                  </div>
                  
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold text-indigo-600">Hi there!</span> I&apos;m your <span className="font-semibold">Calendar AI Agent</span>. 
                    <span className="hidden sm:inline"> Tell me what to schedule, edit, or delete!</span> 📅✨
                  </p>
                </div>
              </div>

              {/* Right: Status + Actions */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Connected
                </span>
                <a 
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Disconnect
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-6">
          <CalendarAndChatShell />
        </div>
      </div>
    </main>
  );
}
