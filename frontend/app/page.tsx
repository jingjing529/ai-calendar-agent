// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    // <main className="min-h-screen flex items-center justify-center bg-slate-50">
    //   <div className="rounded-xl shadow-md bg-white px-8 py-6 max-w-md w-full">
    //     <h1 className="text-2xl font-semibold mb-4">连接你的日历</h1>
    //     <p className="text-gray-600 mb-6">
    //       点下面这个按钮，授权我们访问你的 Google 日历，用来帮你管理日程。
    //     </p>

    //     {/* 直接跳到后端 /api/auth/google，这个接口会重定向到 Google 授权页 */}
    //     <Link
    //       href="/api/auth/google"
    //       className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition"
    //     >
    //       连接 Google 日历
    //     </Link>

    //     {/* 你自己可以在这里根据 URL 参数 ?connected=1 显示“已成功连接”等提示 */}
    //   </div>
    // </main>
          <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>
  
          <div className="relative z-10 flex flex-col items-center px-4">
            {/* Big Robot Emoji */}
            <div className="text-8xl md:text-9xl mb-6 animate-bounce" style={{ animationDuration: "2s" }}>
              🤖
            </div>
  
            {/* Speech bubble pointing up to robot */}
            <div className="relative bg-white rounded-2xl shadow-xl px-8 py-6 max-w-md w-full">
              {/* Speech bubble arrow pointing up */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[14px] border-b-white"></div>
              </div>
              <div className="absolute -top-[15px] left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[15px] border-b-gray-100"></div>
              </div>
              
              <div className="relative z-10">
                <h1 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                  Hey! I&apos;m your Calendar AI 👋
                </h1>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  I need access to your Google Calendar to help you manage your events. 
                  Connect now and let me handle your scheduling!
                </p>
                <a
                  href="/api/auth/google"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                  Connect Google Calendar
                </a>
              </div>
            </div>
          </div>
        </main>
  );
}
