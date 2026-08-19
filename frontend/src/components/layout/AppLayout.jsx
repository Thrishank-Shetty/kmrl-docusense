import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function AppLayout(){
    return(
        <>
            <div className="flex min-h-screen bg-slate-50">
                {/* Sidebar */}
                <Sidebar />

                {/* Main application area */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Header */}
                    <Header />

                    {/* Page content */}
                    <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}