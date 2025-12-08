"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeaderWithAvatar() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove cookies directly
    document.cookie = "google_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "google_oauth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Left: Avatar + Speech Bubble */}
          <div className="flex items-end gap-3 flex-1 min-w-0 mr-4">
            {/* AI Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/AI-Avatar.png"
                  alt="Cal-E"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#34A853] border-2 border-white rounded-full"></span>
            </div>
            
            {/* Speech Bubble */}
            <div className="relative bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-gray-200 shadow-sm">
              {/* Arrow pointing to avatar */}
              <div className="absolute left-0 bottom-3 -translate-x-full">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-gray-100"></div>
              </div>
              <div className="absolute left-0 bottom-3 -translate-x-full -ml-[1px]">
                <div className="w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[11px] border-r-gray-200"></div>
              </div>
              
              <p className="text-gray-700 text-sm">
                Hi! I&apos;m <span className="font-semibold text-[#4285F4]">Cal-E</span>, your calendar AI Agent. Ready to help! ✨
              </p>
            </div>
          </div>

          {/* Right: Status + Actions */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#34A853] bg-[#34A853]/10 px-3 py-1.5 rounded-full font-medium">
              <span className="w-2 h-2 bg-[#34A853] rounded-full animate-pulse"></span>
              Connected
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

