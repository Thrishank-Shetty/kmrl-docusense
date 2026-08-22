import { useState } from "react";
import {Bell, Menu, Search, CircleHelp, X} from 'lucide-react';

export default function Header() {
const [query, setQuery] = useState('');
return (
    // <header className="h-16 w-full flex items-center bg-white border-b border-[#E5E7EB]">

    //   {/* Search */}
    //   <div className="ml-6 relative">
    //     <svg
    //       className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]"
    //       fill="none"
    //       viewBox="0 0 24 24"
    //       stroke="currentColor"
    //       strokeWidth="2"
    //     >
    //       <circle cx="11" cy="11" r="7" />
    //       <path d="m20 20-4-4" />
    //     </svg>

    //     <input
    //       type="text"
    //       placeholder="Search ID or Filename..."
    //       className="
    //         w-[185px] h-8
    //         pl-8 pr-3
    //         rounded-md
    //         border border-[#E5E7EB]
    //         bg-[#F3F4F6]
    //         text-[10px] text-[#111827]
    //         placeholder:text-[#64748B]
    //         outline-none
    //         focus:border-[#0056B3]
    //         focus:ring-2 focus:ring-[#0056B3]/10
    //       "
    //     />
    //   </div>


    //   {/* Right Controls */}
    //   <div className="ml-auto flex items-center gap-6 mr-6">

    //     {/* Notification */}
    //     <button className="text-[#1E293B] hover:text-[#0056B3] transition">
    //       <svg
    //         className="w-4 h-4"
    //         fill="none"
    //         viewBox="0 0 24 24"
    //         stroke="currentColor"
    //         strokeWidth="1.8"
    //       >
    //         <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    //         <path d="M10 21h4" />
    //       </svg>
    //     </button>


    //     {/* Help */}
    //     <button className="text-[#1E293B] hover:text-[#0056B3] transition">
    //       <svg
    //         className="w-4 h-4"
    //         fill="none"
    //         viewBox="0 0 24 24"
    //         stroke="currentColor"
    //         strokeWidth="1.8"
    //       >
    //         <circle cx="12" cy="12" r="9" />
    //         <path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.1-1.6 2.6" />
    //         <path d="M12 17h.01" />
    //       </svg>
    //     </button>


    //     {/* Profile */}
    //     <button className="w-7 h-7 rounded-full overflow-hidden border border-[#E5E7EB]">
    //       <img
    //         src="/profile.jpg"
    //         alt="Profile"
    //         className="w-full h-full object-cover"
    //       />
    //     </button>

    //   </div>

    // </header>
    <>
    {/* TOPBAR */}
        <header className="h-[56px] bg-white/85 border-b border-[#ccd3df] flex items-center justify-between px-[29px] sticky top-0 z-10 backdrop-blur-[12px] max-[720px]:px-4">
          <div className="flex items-center gap-3">
            <button
              className="hidden max-[720px]:grid"
              // onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={21} />
            </button>

            <label className="w-[218px] h-[34px] rounded-[18px] bg-[#dee8fb] flex items-center gap-[9px] px-[13px] focus-within:bg-white focus-within:shadow-[inset_0_0_0_1px_#6f8fbd,0_3px_10px_rgba(22,52,92,.06)] max-[720px]:w-[min(218px,calc(100vw-158px))]">
              <Search size={18} />

              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search analytics..."
                className="border-0 outline-none bg-transparent w-full text-[12px] placeholder:text-[#768195]"
              />

              {query && (
                <button onClick={() => setQuery('')}>
                  <X size={15} />
                </button>
              )}
            </label>
          </div>

          <div className="flex items-center gap-4 max-[720px]:gap-[7px]">
            <button title="Notifications coming soon" className="text-slate-500 transition hover:text-[#0056B3]">
              <Bell size={19} />
            </button>

            <button title="Help coming soon" className="text-slate-500 transition hover:text-[#0056B3]">
              <CircleHelp size={19} />
            </button>

            <button className="w-[27px] h-[27px] rounded-full border bg-gradient-to-br from-[#e7d9c9] to-[#7c9eb8] text-[9px] font-extrabold">
              AK
            </button>
          </div>
        </header>
    </>
  );
}