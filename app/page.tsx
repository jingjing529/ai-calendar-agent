// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="rounded-xl shadow-md bg-white px-8 py-6 max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-4">连接你的日历</h1>
        <p className="text-gray-600 mb-6">
          点下面这个按钮，授权我们访问你的 Google 日历，用来帮你管理日程。
        </p>

        {/* 直接跳到后端 /api/auth/google，这个接口会重定向到 Google 授权页 */}
        <Link
          href="/api/auth/google"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          连接 Google 日历
        </Link>

        {/* 你自己可以在这里根据 URL 参数 ?connected=1 显示“已成功连接”等提示 */}
      </div>
    </main>
  );
}
