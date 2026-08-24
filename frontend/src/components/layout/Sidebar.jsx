import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FileText,
  X,
  User,
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
  ["Manual Review", Activity, "/review"],
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
        <div className="mb-[31px] flex items-center gap-3 px-[7px]">
          <div className="grid h-[34px] w-[34px] place-items-center rounded">
            <img
              src="/blue logo.png"
              alt="KMRL DocuSense logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="text-[16px] font-extrabold text-[#11274a]">
              KMRL Intelligence
            </div>

            <div className="mt-[3px] text-[11px] text-[#4c5668]">
              Infrastructure Ops
            </div>
          </div>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            className="ml-auto hidden max-[720px]:grid"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

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

        {/* PROFILE */}
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
          <User size={18} />
          Profile
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