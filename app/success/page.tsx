// app/success/page.tsx
import { cookies } from "next/headers";
import CalendarAndChatShell from "./CalendarAndChatShell";

export default async function SuccessPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-xl shadow-md bg-white px-8 py-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">No calendar connection</h1>
          <p className="text-gray-700 mb-6">
            Please go back to the homepage and connect your Google Calendar first.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-2xl font-bold mb-4">
          AI Calendar Assistant
        </h1>
        <p className="text-gray-600 mb-6">
          Chat with the assistant on the left, your Google Calendar updates live on the right.
        </p>

        <CalendarAndChatShell />
      </div>
    </main>
  );
}
