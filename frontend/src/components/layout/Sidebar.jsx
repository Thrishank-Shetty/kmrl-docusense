import { NavLink } from "react-router-dom";

const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Documents", href: "/documents" },
    { name: "Upload", href: "/upload" },
    { name: "AI Search", href: "/ai-search" },
    { name: "Compliance", href: "/compliance" },
    { name: "Analytics", href: "/analytics" },
    { name: "Activity", href: "/activity" },
    { name: "Settings", href: "/settings" }
];

export default function Sidebar() {
    return (
        <aside className="h-screen w-[182px] border-r border-gray-200 bg-white px-3 py-4">
            
            <ul className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <li key={item.href}>
                        <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center rounded-md px-3 py-2 text-[10px] ${
                                    isActive
                                        ? "bg-[#6398F2] text-[#08264A]"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    </li>
                ))}
            </ul>

        </aside>
    );
}