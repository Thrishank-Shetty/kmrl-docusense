// import { NavLink } from "react-router-dom";
import { useState } from "react";
import { FileText, Plus, X, Settings, LayoutDashboard, Upload, FileBarChart, Gavel, BarChart3, Activity } from "lucide-react";

const navItems = [
    ["Dashboard", LayoutDashboard],
    ["Documents", FileText],
    ["Upload", Upload],
    ["AI Search", FileBarChart],
    ["Compliance", Gavel],
    ["Analytics", BarChart3],
    ["Activity", Activity],
];

export default function Sidebar() {
    const [activeNav, setActiveNav] = useState('Analytics');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        // <aside className="h-screen w-[182px] border-r border-gray-200 bg-white px-3 py-4">
            
        //     <ul className="flex flex-col gap-2">
        //         {navItems.map((item) => (
        //             <li key={item.href}>
        //                 <NavLink
        //                     to={item.href}
        //                     className={({ isActive }) =>
        //                         `flex items-center rounded-md px-3 py-2 text-[10px] ${
        //                             isActive
        //                                 ? "bg-[#6398F2] text-[#08264A]"
        //                                 : "text-gray-600 hover:bg-gray-100"
        //                         }`
        //                     }
        //                 >
        //                     {item.name}
        //                 </NavLink>
        //             </li>
        //         ))}
        //     </ul>

        // </aside>
    <>
    {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-20 w-[220px] bg-white border-r border-[#cbd2df]
        px-[13px] pt-[29px] pb-6 flex flex-col
        max-[960px]:w-[200px]
        max-[720px]:w-[240px] max-[720px]:-translate-x-full
        ${mobileNavOpen ? 'max-[720px]:translate-x-0' : ''}
      `}>
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

          <button
            className="hidden max-[720px]:grid ml-auto"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <button className="flex items-center justify-center gap-2 h-[35px] mb-[26px] rounded-[7px] bg-[#08274f] text-white text-[13px] font-bold hover:bg-[#124c90]">
          <Plus size={19} /> New Extraction
        </button>

        <nav className="flex flex-col gap-[3px]">
          {navItems.map(([label, Icon]) => {
            const active = activeNav === label;

            return (
              <button
                key={label}
                onClick={() => {
                  setActiveNav(label);
                  setMobileNavOpen(false);
                }}
                className={`
                  flex items-center gap-[13px] px-[14px] py-[9px] rounded-[7px]
                  text-left text-[11.5px]
                  ${active
                    ? 'bg-[#5d99f4] text-[#063372] font-bold'
                    : 'text-[#475260] hover:bg-[#edf3ff] hover:text-[#0e4b9e]'
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>

        <button
          className="mt-auto flex items-center gap-[13px] px-[14px] py-[9px] text-[#475260] text-[11.5px]"
          onClick={() => setActiveNav('Settings')}
        >
          <Settings size={18} /> Settings
        </button>
      </aside>

      {mobileNavOpen && (
        <button
          className="fixed inset-0 z-[15] bg-[rgba(12,28,54,.25)] max-[720px]:block"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      </>

    );
}
