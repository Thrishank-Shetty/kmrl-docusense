import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6]">
      <Sidebar />

      {/* Main content */}
      <div
        className="
          min-h-screen
          ml-[220px]
          max-[960px]:ml-[200px]
          max-[720px]:ml-0
        "
      >
        <Header />

        <main className="min-h-[calc(100vh-64px)] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}