import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FileText,
  Plus,
  X,
  Settings,
  LayoutDashboard,
  Upload,
  FileBarChart,
  Gavel,
  BarChart3,
  Activity,
} from "lucide-react";

const navItems = [
  ["Dashboard", LayoutDashboard, "/dashboard"],
  ["Documents", FileText, "/documents"],
  ["Upload", Upload, "/upload"],
  ["AI Search", FileBarChart, "/ai-search"],
  ["Compliance", Gavel, "/compliance"],
  ["Analytics", BarChart3, "/analytics"],
  ["Activity", Activity, "/activity"],
];

export default function Sidebar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-20
          w-[220px] bg-white border-r border-[#cbd2df]
          px-[13px] pt-[29px] pb-6
          flex flex-col
          max-[960px]:w-[200px]
          max-[720px]:w-[240px]
          max-[720px]:-translate-x-full
          transition-transform duration-200
          ${mobileNavOpen ? "max-[720px]:translate-x-0" : ""}
        `}
      >
        {/* LOGO / HEADER */}
        <div className="flex items-center gap-3 px-[7px] mb-[31px]">
          <div className="w-[34px] h-[34px] rounded bg-[#092d62] text-white grid place-items-center">
            <FileText size={22} />
          </div>

          <div>
            <div className="text-[16px] font-extrabold text-[#11274a]">
              KMRL Intelligence
            </div>

            <div className="text-[11px] text-[#4c5668] mt-[3px]">
              Infrastructure Ops
            </div>
          </div>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            className="hidden max-[720px]:grid ml-auto"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* NEW EXTRACTION */}
        <NavLink
          to="/upload"
          onClick={() => setMobileNavOpen(false)}
          className="
            flex items-center justify-center gap-2
            h-[35px] mb-[26px]
            rounded-[7px]
            bg-[#08274f]
            text-white
            text-[13px]
            font-bold
            hover:bg-[#124c90]
            transition-colors
          "
        >
          <Plus size={19} />
          New Extraction
        </NavLink>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-[3px]">
          {navItems.map(([label, Icon, path]) => (
            <NavLink
              key={label}
              to={path}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-[13px]
                px-[14px] py-[9px]
                rounded-[7px]
                text-left text-[14px]
                transition-colors
                ${
                  isActive
                    ? "bg-[#5d99f4] text-[#063372] font-bold"
                    : "text-[#475260] hover:bg-[#edf3ff] hover:text-[#0e4b9e]"
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* SETTINGS */}
        <NavLink
          to="/settings"
          onClick={() => setMobileNavOpen(false)}
          className={({ isActive }) => `
            mt-auto
            flex items-center gap-[13px]
            px-[15px] py-[10px]
            rounded-lg
            text-[14px]
            text-center
            font-bold
            transition-colors
            ${
              isActive
                ? "bg-[#5d99f4] text-[#063372] font-bold"
                : "text-[#475260] hover:bg-[#edf3ff] hover:text-[#0e4b9e]"
            }
          `}
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="
            fixed inset-0 z-[15]
            bg-[rgba(12,28,54,.25)]
            max-[720px]:block
          "
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </>
  );
}