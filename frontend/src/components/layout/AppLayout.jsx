import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function AppLayout(){
    return(
        <>
            <div className="flex h-screen w-full overflow-hidden bg-[#F3F4F6]">
                {/* Sidebar */}
                <Sidebar />

                {/* Main application area */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Header */}
                    <Header />

                    {/* Page content */}
                    <main className="flex-1 min-h-0 overflow-auto">
                    <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}