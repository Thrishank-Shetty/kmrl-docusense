export default function Header() {
  return (
    <header className="h-16 w-full flex items-center bg-white border-b border-[#E5E7EB]">

      {/* Search */}
      <div className="ml-6 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>

        <input
          type="text"
          placeholder="Search ID or Filename..."
          className="
            w-[185px] h-8
            pl-8 pr-3
            rounded-md
            border border-[#E5E7EB]
            bg-[#F3F4F6]
            text-[10px] text-[#111827]
            placeholder:text-[#64748B]
            outline-none
            focus:border-[#0056B3]
            focus:ring-2 focus:ring-[#0056B3]/10
          "
        />
      </div>


      {/* Right Controls */}
      <div className="ml-auto flex items-center gap-6 mr-6">

        {/* Notification */}
        <button className="text-[#1E293B] hover:text-[#0056B3] transition">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
        </button>


        {/* Help */}
        <button className="text-[#1E293B] hover:text-[#0056B3] transition">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.1-1.6 2.6" />
            <path d="M12 17h.01" />
          </svg>
        </button>


        {/* Profile */}
        <button className="w-7 h-7 rounded-full overflow-hidden border border-[#E5E7EB]">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>

      </div>

    </header>
  );
}