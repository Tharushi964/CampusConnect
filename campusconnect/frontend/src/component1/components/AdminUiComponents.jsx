import { useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

export const T = (isDark) => ({
  pageBg:      isDark ? "bg-[#070C24]"         : "bg-slate-100",
  cardBg:      isDark ? "bg-[#111B3D]"         : "bg-white",
  cardBorder:  isDark ? "border-[#2B3E7A]"     : "border-gray-200",
  innerBg:     isDark ? "bg-[#0B1230]"         : "bg-slate-50",
  innerBorder: isDark ? "border-[#1D2D68]"     : "border-gray-200",
  rowHover:    isDark ? "hover:bg-[#1C2C5A]"   : "hover:bg-blue-50",
  rowAlt:      isDark ? "bg-[#0D1535]"         : "bg-slate-50/70",
  // Text — MAXIMUM contrast
  textPrimary:   isDark ? "text-white"          : "text-gray-900",
  textSecondary: isDark ? "text-slate-200"      : "text-gray-600",
  textMuted:     isDark ? "text-slate-400"      : "text-gray-400",
  textAccent:    isDark ? "text-sky-300"        : "text-blue-600",
  // Inputs — clearly readable in both modes
  inputBg:     isDark
    ? "bg-[#0B1230] border-[#2B3E7A] text-white placeholder-slate-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  selectBg:    isDark
    ? "bg-[#0B1230] border-[#2B3E7A] text-white"
    : "bg-white border-gray-300 text-gray-900",
  divider:     isDark ? "border-[#1D2D68]"     : "border-gray-200",
  headerBg:    isDark ? "bg-[#111B3D]/95"      : "bg-white/95",
  headerBorder:isDark ? "border-[#2B3E7A]"     : "border-gray-200",
  sidebarBg:   isDark ? "bg-[#111B3D]"         : "bg-white",
  sidebarBorder:isDark ? "border-[#2B3E7A]"   : "border-gray-200",
  sidebarGroup:isDark ? "text-slate-500"       : "text-gray-400",
  sidebarItem: isDark
    ? "text-slate-300 hover:text-white hover:bg-[#1C2C5A]"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  sidebarActive:isDark
    ? "bg-[#5478FF] text-white shadow-lg shadow-[#5478FF]/40"
    : "bg-[#5478FF] text-white shadow-md shadow-[#5478FF]/30",
  sidebarFooterBorder: isDark ? "border-[#2B3E7A]" : "border-gray-200",
  tableHead:   isDark ? "bg-[#0B1230] text-sky-300" : "bg-slate-50 text-gray-600",
  searchBg:    isDark
    ? "bg-[#0B1230] border-[#2B3E7A] text-white placeholder-slate-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  modalBg:     isDark ? "bg-[#111B3D] border-[#2B3E7A]" : "bg-white border-gray-200",
  modalHeader: isDark ? "border-[#2B3E7A]"    : "border-gray-200",
  modalClose:  isDark ? "text-sky-300 hover:text-white hover:bg-[#1C2C5A]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  confirmBg:   isDark ? "bg-[#111B3D]"        : "bg-white",
});

// ─── Stat card colors that work in BOTH modes ─────────────────────
const SC = {
  blue:   { border:"border-blue-500/40",   iconBg:"bg-blue-500/15",   iconText:"text-blue-400",   value:"text-blue-400"   },
  green:  { border:"border-emerald-500/40",iconBg:"bg-emerald-500/15",iconText:"text-emerald-400",value:"text-emerald-400"},
  red:    { border:"border-red-500/40",    iconBg:"bg-red-500/15",    iconText:"text-red-400",    value:"text-red-400"    },
  amber:  { border:"border-amber-500/40",  iconBg:"bg-amber-500/15",  iconText:"text-amber-400",  value:"text-amber-400"  },
  purple: { border:"border-purple-500/40", iconBg:"bg-purple-500/15", iconText:"text-purple-400", value:"text-purple-400" },
  teal:   { border:"border-teal-500/40",   iconBg:"bg-teal-500/15",   iconText:"text-teal-400",   value:"text-teal-400"   },
  sky:    { border:"border-sky-500/40",    iconBg:"bg-sky-500/15",    iconText:"text-sky-400",    value:"text-sky-400"    },
  gray:   { border:"border-slate-500/30",  iconBg:"bg-slate-500/10",  iconText:"text-slate-400",  value:"text-slate-400"  },
};

// Light-mode overrides — use solid colors instead of /15 transparencies
const SCL = {
  blue:   { border:"border-blue-200",   iconBg:"bg-blue-50",   iconText:"text-blue-600",   value:"text-blue-700"   },
  green:  { border:"border-emerald-200",iconBg:"bg-emerald-50",iconText:"text-emerald-600",value:"text-emerald-700"},
  red:    { border:"border-red-200",    iconBg:"bg-red-50",    iconText:"text-red-500",    value:"text-red-600"    },
  amber:  { border:"border-amber-200",  iconBg:"bg-amber-50",  iconText:"text-amber-600",  value:"text-amber-700"  },
  purple: { border:"border-purple-200", iconBg:"bg-purple-50", iconText:"text-purple-600", value:"text-purple-700" },
  teal:   { border:"border-teal-200",   iconBg:"bg-teal-50",   iconText:"text-teal-600",   value:"text-teal-700"   },
  sky:    { border:"border-sky-200",    iconBg:"bg-sky-50",    iconText:"text-sky-600",    value:"text-sky-700"    },
  gray:   { border:"border-slate-200",  iconBg:"bg-slate-100", iconText:"text-slate-500",  value:"text-slate-600"  },
};

export const getColor = (isDark, key) => isDark ? SC[key] : SCL[key];

// ============================
// 📊 STAT CARD
// ============================
export const StatCard = ({ label, value, icon: Icon, colorKey, sub, isDark }) => {
  const c = getColor(isDark, colorKey);
  const t = T(isDark);

  return (
    <div className={`rounded-2xl p-5 border flex items-center gap-4 shadow-sm ${t.cardBg} ${c.border}`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
        <Icon size={22} className={c.iconText} />
      </div>
      <div>
        <p className={`text-xs font-semibold ${t.textMuted}`}>{label}</p>
        <p className={`text-2xl font-black ${c.value}`}>{value}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>{sub}</p>}
      </div>
    </div>
  );
};


// ============================
// 🔍 SEARCH INPUT
// ============================
export const ThemedSearch = ({ value, onChange, placeholder, isDark }) => {
  const t = T(isDark);

  return (
    <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm w-64 ${t.searchBg}`}>
      <Search size={14} className={`${t.textMuted} shrink-0`} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-sm focus:outline-none flex-1"
      />
    </div>
  );
};


// ============================
// ⬇️ SELECT DROPDOWN
// ============================
export const ThemedSelect = ({ value, onChange, options, placeholder = "Select…", isDark }) => {
  const t = T(isDark);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none border text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 shadow-sm cursor-pointer font-medium ${t.selectBg}`}
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}
      />
    </div>
  );
};


// ============================
// 🪟 MODAL
// ============================
export const ThemedModal = ({ open, onClose, title, children, wide = false, isDark }) => {
  const t = T(isDark);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`pointer-events-auto w-full ${wide ? "max-w-2xl" : "max-w-lg"} ${t.modalBg} rounded-2xl shadow-2xl overflow-hidden border`}>

          <div className={`flex items-center justify-between px-6 py-4 border-b ${t.modalHeader}`}>
            <p className={`font-bold text-sm ${t.textPrimary}`}>{title}</p>
            <button onClick={onClose} className={`p-1 rounded-lg ${t.modalClose}`}>
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};


// ============================
// 🧾 FORM FIELD
// ============================
export const ThemedField = ({
  label, name, value, onChange,
  type = "text", options, required = false,
  placeholder = "", isDark
}) => {
  const t = T(isDark);

  return (
    <div className="mb-4">
      <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}
        >
          <option value="">Select…</option>
          {options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}
        />
      )}
    </div>
  );
};


// ============================
// 🎭 ROLE BADGE
// ============================
export const RoleBadge = ({ role }) => {
  const map = {
    Admin: "bg-purple-100 text-purple-800 border-purple-300",
    "Batch Rep": "bg-amber-100 text-amber-800 border-amber-300",
    Student: "bg-sky-100 text-sky-800 border-sky-300",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[role] ?? "bg-slate-100 text-slate-600 border-slate-300"}`}>
      {role}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    PENDING:  "bg-amber-100 text-amber-800 border-amber-300",
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
    DELETED:  "bg-slate-200 text-slate-600 border-slate-300",
    ACTIVE:   "bg-emerald-100 text-emerald-800 border-emerald-300",
    INACTIVE: "bg-red-100 text-red-800 border-red-300",
    SENT:     "bg-blue-100 text-blue-800 border-blue-300",
  };
  const dot = {
    PENDING:"bg-amber-500",APPROVED:"bg-emerald-500",REJECTED:"bg-red-500",
    DELETED:"bg-slate-400",ACTIVE:"bg-emerald-500",INACTIVE:"bg-red-500",SENT:"bg-blue-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status]??"bg-slate-100 text-slate-500 border-slate-300"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]??"bg-slate-400"}`}/>{status}
    </span>
  );
};