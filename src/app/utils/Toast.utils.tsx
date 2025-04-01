import { CheckCircle, Info, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warn"
) => {
  toast((t) => (
    <div
      className={`flex items-center gap-3 w-max max-w-xs p-4 rounded-xl shadow-md transition-all duration-300
        ${type === "success" ? "bg-success text-white" : ""}
        ${type === "error" ? "bg-error text-white" : ""}
        ${type === "info" ? "bg-primary text-white" : ""}
        ${type === "warn" ? "bg-warning text-white" : ""}
        ${t.visible ? "animate-fade-in" : "animate-fade-out"}
      `}
    >
      {type === "success" && <CheckCircle className="w-6 h-6 text-white" />}
      {type === "error" && <XCircle className="w-6 h-6 text-white" />}
      {type === "info" && <Info className="w-6 h-6 text-white" />}

      <span className="flex-1 text-sm font-semibold ">{message}</span>

      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-white hover:opacity-80 transition-opacity"
      >
        ✖
      </button>
    </div>
  ));
};
