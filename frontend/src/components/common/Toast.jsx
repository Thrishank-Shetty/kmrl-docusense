import { useState } from "react";
import {CheckCircle,AlertCircle,X,Info,} from "lucide-react";
import { ToastContext } from "./ToastContext";

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {toast && (
        <div className="fixed right-5 top-5 z-[100]">
          <div
            className={`flex min-w-[280px] max-w-[380px] items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg ${
              toast.type === "error"
                ? "border-red-200"
                : toast.type === "info"
                ? "border-blue-200"
                : "border-green-200"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle
                size={18}
                className="shrink-0 text-red-500"
              />
            ) : toast.type === "info" ? (
              <Info
                size={18}
                className="shrink-0 text-blue-500"
              />
            ) : (
              <CheckCircle
                size={18}
                className="shrink-0 text-green-500"
              />
            )}

            <p className="flex-1 text-[11px] font-medium text-slate-700">
              {toast.message}
            </p>

            <button
              onClick={hideToast}
              className="text-slate-400 transition hover:text-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}