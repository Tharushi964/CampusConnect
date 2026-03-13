import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, LogOut, RefreshCw, XCircle, HelpCircle, X } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   VARIANT CONFIG
   Each variant controls: icon, accent colour, confirm button style
───────────────────────────────────────────────────────────── */
const VARIANTS = {
  danger: {
    Icon:        Trash2,
    iconBg:      "bg-red-500/10",
    iconColor:   "text-red-500",
    ringColor:   "ring-red-500/20",
    confirmCls:  "bg-red-600 hover:bg-red-700 text-white",
    titleColor:  "text-red-600",
  },
  warning: {
    Icon:        AlertTriangle,
    iconBg:      "bg-amber-500/10",
    iconColor:   "text-amber-500",
    ringColor:   "ring-amber-500/20",
    confirmCls:  "bg-amber-500 hover:bg-amber-600 text-white",
    titleColor:  "text-amber-600",
  },
  info: {
    Icon:        HelpCircle,
    iconBg:      "bg-indigo-500/10",
    iconColor:   "text-indigo-500",
    ringColor:   "ring-indigo-500/20",
    confirmCls:  "bg-indigo-600 hover:bg-indigo-700 text-white",
    titleColor:  "text-indigo-600",
  },
  logout: {
    Icon:        LogOut,
    iconBg:      "bg-rose-500/10",
    iconColor:   "text-rose-500",
    ringColor:   "ring-rose-500/20",
    confirmCls:  "bg-rose-600 hover:bg-rose-700 text-white",
    titleColor:  "text-rose-600",
  },
  reset: {
    Icon:        RefreshCw,
    iconBg:      "bg-orange-500/10",
    iconColor:   "text-orange-500",
    ringColor:   "ring-orange-500/20",
    confirmCls:  "bg-orange-500 hover:bg-orange-600 text-white",
    titleColor:  "text-orange-600",
  },
};

/* ─────────────────────────────────────────────────────────────
   CONFIRM DIALOG
   Props:
     open          boolean          — show/hide
     onConfirm     () => void       — called on confirm
     onCancel      () => void       — called on cancel / close
     title         string           — dialog title
     message       string|ReactNode — body text
     confirmLabel  string           — confirm button label  (default "Confirm")
     cancelLabel   string           — cancel button label   (default "Cancel")
     variant       "danger"|"warning"|"info"|"logout"|"reset"  (default "danger")
     theme         object           — your project's theme object (colors.dark / colors.light)
───────────────────────────────────────────────────────────── */
const ConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title        = "Are you sure?",
  message      = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "danger",
  theme,
}) => {
  const confirmBtnRef = useRef(null);
  const cfg = VARIANTS[variant] ?? VARIANTS.danger;

  /* Focus confirm button on open for keyboard users */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => confirmBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  /* ── theme-aware classes ── */
  const cardBg   = theme?.statBg   ?? "bg-white dark:bg-gray-900";
  const border   = theme?.border   ?? "border-gray-200 dark:border-gray-700";
  const text     = theme?.text     ?? "text-gray-900 dark:text-white";
  const statText = theme?.statText ?? "text-gray-500 dark:text-gray-400";
  const innerBg  = theme?.cardBg  ?? "bg-gray-50 dark:bg-gray-800";

  const cancelCls = `border ${border} ${statText} hover:bg-red-500/10 hover:text-red-500 hover:border-red-400/50`;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* ── Dialog ── */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className={[
            "pointer-events-auto w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-150",
            cardBg,
            border,
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ring-2 ${cfg.iconBg} ${cfg.ringColor}`}>
                <cfg.Icon size={15} className={cfg.iconColor} />
              </div>
              <p id="confirm-title" className={`text-sm font-bold ${cfg.titleColor}`}>
                {title}
              </p>
            </div>
            <button
              onClick={onCancel}
              className={`p-1.5 rounded-xl transition-colors hover:bg-red-500/10 hover:text-red-500 ${statText}`}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-5 py-4">
            <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${innerBg} ${statText}`}>
              <p id="confirm-message">{message}</p>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className={`flex items-center justify-end gap-2 px-5 pb-5`}>
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${cancelCls}`}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${cfg.confirmCls}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;


/* ─────────────────────────────────────────────────────────────
   USAGE EXAMPLE
   ──────────────────────────────────────────────────────────
   import ConfirmDialog from "./ConfirmDialog";

   const [confirmOpen, setConfirmOpen] = useState(false);

   const handleDelete = () => setConfirmOpen(true);

   <button onClick={handleDelete}>Delete</button>

   <ConfirmDialog
     open={confirmOpen}
     onConfirm={() => { setConfirmOpen(false); doDelete(); }}
     onCancel={() => setConfirmOpen(false)}
     title="Delete Record"
     message="This will permanently delete the WFH record. This action cannot be undone."
     confirmLabel="Yes, Delete"
     variant="danger"
     theme={theme}
   />
───────────────────────────────────────────────────────────── */
