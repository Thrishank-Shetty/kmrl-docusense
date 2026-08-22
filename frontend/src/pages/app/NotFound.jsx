import { FileQuestion, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="grid min-h-screen place-items-center bg-[#F3F4F6] p-5">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <FileQuestion size={28} className="text-[#0056B3]" />
        </div>

        <h1 className="mt-4 text-[28px] font-bold text-[#111827]">
          Page not found
        </h1>

        <p className="mt-2 text-[11px] text-slate-500">
          The page you're looking for doesn't exist.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#002D62] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#0056B3]"
        >
          <ArrowLeft size={13} />
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}