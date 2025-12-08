// app/page.tsx
"use client";

import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background decorations with Google Calendar colors */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-96 h-96 bg-[#4285F4] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-[#EA4335] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-[#FBBC04] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#34A853] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      </div> */}

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(#4285F4 1px, transparent 1px), linear-gradient(90deg, #4285F4 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 py-12 max-w-6xl mx-auto">
        {/* Left side - AI Agent Image */}
        <div className="relative flex-shrink-0">
          {/* Decorative ring behind image */}
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-[#4285F4] via-[#FBBC04] to-[#EA4335] opacity-20 blur-2xl"></div>
          <div className="relative">
            <Image
              src="/AI-Agent.png"
              alt="AI Calendar Agent"
              width={520}
              height={520}
              className="relative z-10 drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Right side - Text and CTA */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg">
          {/* Greeting */}
          <p className="text-gray-500 text-lg mb-2">Hey there! I&apos;m</p>
          
          {/* Gradient handwriting title */}
          <h1 className="mb-6 flex flex-col md:flex-row md:items-baseline md:gap-3">
            <span 
              className="text-5xl md:text-6xl font-bold font-mono tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #4285F4 0%, #5a9cf5 50%, #7bb3f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Cal-E
            </span>
            <span className="text-xl md:text-2xl font-medium text-gray-400">
              da Calendar Bot
            </span>
          </h1>

          {/* AI voice subtitle */}
          <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed">
            I can help you <span className="text-[#4285F4] font-medium">schedule meetings</span>, 
            {" "}<span className="text-[#EA4335] font-medium">set reminders</span>, 
            {" "}<span className="text-[#FBBC04] font-medium">find free time</span>, and 
            {" "}<span className="text-[#34A853] font-medium">organize your day</span> — 
            all through a simple chat! ✨
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20">
              Smart Scheduling
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20">
              AI Powered
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#FBBC04]/10 text-[#FBBC04] border border-[#FBBC04]/20">
              Auto Sync
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20">
              Free to Use
            </span>
          </div>

          {/* CTA Button */}
          <a
            href="/api/auth/google"
            className="group relative inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white text-gray-700 border-2 border-gray-300 hover:border-transparent"
            style={{
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #4285F4 0%, #34A853 33%, #FBBC04 66%, #EA4335 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            
            {/* Google colored G logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Get Started
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          {/* Trust indicator */}
          <p className="mt-4 text-sm text-gray-400">
            Secure Google OAuth · No password required
          </p>
        </div>
      </div>

      {/* CSS Animation for gradient button */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </main>
  );
}
