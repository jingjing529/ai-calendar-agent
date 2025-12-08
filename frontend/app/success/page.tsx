import CalendarAndChatShell from "@/components/CalendarAndChatShell";
import TokenExpiredModal from "@/components/TokenExpiredModal";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import { cookies } from "next/headers";

export default async function SuccessPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken) {
    return (
      <main className="min-h-screen bg-white">
        <TokenExpiredModal />
      </main>
    );
  }

  return (
    <main className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4285F4]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#34A853]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <CalendarAndChatShell />
          </div>
        </div>
      </div>
    </main>
  );
}
