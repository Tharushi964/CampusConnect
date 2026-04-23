/**
 * SectionFeedbacks.jsx
 * Admin Portal — Feedback Module
 *
 * Flow:
 *  [Faculty Grid] → [Program Grid] → [Year Tabs + Semester Lists] → [Detail Modal]
 *
 * API base: /api/feedbacks
 * Theme: matches CampusConnect Admin Portal (T() tokens + isDark prop)
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  MessageSquare, ChevronRight, ChevronLeft,
  GraduationCap, BookOpen, Star, Calendar,
  Loader2, AlertCircle, Filter, Eye,
  X, User, Clock, Hash, Layers, Building2,
} from "lucide-react";

// ─── Re-use the same theme tokens as Admin.jsx ───────────────────
const T = (isDark) => ({
  pageBg:       isDark ? "bg-[#070C24]"       : "bg-slate-100",
  cardBg:       isDark ? "bg-[#111B3D]"       : "bg-white",
  cardBorder:   isDark ? "border-[#2B3E7A]"   : "border-gray-200",
  innerBg:      isDark ? "bg-[#0B1230]"       : "bg-slate-50",
  innerBorder:  isDark ? "border-[#1D2D68]"   : "border-gray-200",
  rowHover:     isDark ? "hover:bg-[#1C2C5A]" : "hover:bg-blue-50",
  rowAlt:       isDark ? "bg-[#0D1535]"       : "bg-slate-50/70",
  textPrimary:  isDark ? "text-white"         : "text-gray-900",
  textSecondary:isDark ? "text-slate-200"     : "text-gray-600",
  textMuted:    isDark ? "text-slate-400"     : "text-gray-400",
  textAccent:   isDark ? "text-sky-300"       : "text-blue-600",
  inputBg:      isDark
    ? "bg-[#0B1230] border-[#2B3E7A] text-white placeholder-slate-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  divider:      isDark ? "border-[#1D2D68]"   : "border-gray-200",
  headerBg:     isDark ? "bg-[#111B3D]/95"    : "bg-white/95",
  tableHead:    isDark ? "bg-[#0B1230] text-sky-300" : "bg-slate-50 text-gray-600",
  modalBg:      isDark ? "bg-[#111B3D] border-[#2B3E7A]" : "bg-white border-gray-200",
  modalHeader:  isDark ? "border-[#2B3E7A]"   : "border-gray-200",
  modalClose:   isDark
    ? "text-sky-300 hover:text-white hover:bg-[#1C2C5A]"
    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
});

// ─── Faculty catalogue (mirrors backend data) ───────────────────
const FACULTIES = [
  {
    name: "Faculty of Computing",
    icon: "💻",
    colorKey: "blue",
    programs: [
      "Computer Science",
      "Information Technology",
      "Data Science",
      "Network Engineering",
      "Cyber Security",
      "Software Engineering",
    ],
  },
  {
    name: "Faculty of Business",
    icon: "📊",
    colorKey: "amber",
    programs: [
      "Business Administration",
      "Accounting & Finance",
      "Marketing Management",
      "Human Resource Management",
    ],
  },
  {
    name: "Faculty of Engineering",
    icon: "⚙️",
    colorKey: "teal",
    programs: [
      "Civil Engineering",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Electronic & Telecommunication",
    ],
  },
  {
    name: "Faculty of Humanities & Sciences",
    icon: "🔬",
    colorKey: "purple",
    programs: [
      "Psychology",
      "Media Studies",
      "English & Communication",
      "Applied Mathematics",
    ],
  },
  {
    name: "Faculty of Architecture",
    icon: "🏛️",
    colorKey: "green",
    programs: [
      "Architecture",
      "Interior Design",
      "Urban Planning",
    ],
  },
];

// ─── Color palettes per faculty key (dark & light) ───────────────
const PALETTE = {
  blue:   { dark: { border:"border-blue-500/40",   bg:"bg-blue-500/10",   icon:"text-blue-400",   val:"text-blue-300",   badge:"bg-blue-500/20 text-blue-300 border-blue-500/40"   }, light: { border:"border-blue-200",   bg:"bg-blue-50",   icon:"text-blue-600",   val:"text-blue-700",   badge:"bg-blue-100 text-blue-700 border-blue-200"   } },
  amber:  { dark: { border:"border-amber-500/40",  bg:"bg-amber-500/10",  icon:"text-amber-400",  val:"text-amber-300",  badge:"bg-amber-500/20 text-amber-300 border-amber-500/40"  }, light: { border:"border-amber-200",  bg:"bg-amber-50",  icon:"text-amber-600",  val:"text-amber-700",  badge:"bg-amber-100 text-amber-700 border-amber-200"  } },
  teal:   { dark: { border:"border-teal-500/40",   bg:"bg-teal-500/10",   icon:"text-teal-400",   val:"text-teal-300",   badge:"bg-teal-500/20 text-teal-300 border-teal-500/40"   }, light: { border:"border-teal-200",   bg:"bg-teal-50",   icon:"text-teal-600",   val:"text-teal-700",   badge:"bg-teal-100 text-teal-700 border-teal-200"   } },
  purple: { dark: { border:"border-purple-500/40", bg:"bg-purple-500/10", icon:"text-purple-400", val:"text-purple-300", badge:"bg-purple-500/20 text-purple-300 border-purple-500/40" }, light: { border:"border-purple-200", bg:"bg-purple-50", icon:"text-purple-600", val:"text-purple-700", badge:"bg-purple-100 text-purple-700 border-purple-200" } },
  green:  { dark: { border:"border-emerald-500/40",bg:"bg-emerald-500/10",icon:"text-emerald-400",val:"text-emerald-300",badge:"bg-emerald-500/20 text-emerald-300 border-emerald-500/40"}, light: { border:"border-emerald-200",bg:"bg-emerald-50",icon:"text-emerald-600",val:"text-emerald-700",badge:"bg-emerald-100 text-emerald-700 border-emerald-200"} },
};
const pc = (isDark, key) => PALETTE[key]?.[isDark ? "dark" : "light"] ?? PALETTE.blue[isDark ? "dark" : "light"];

// ─── Star rating display ─────────────────────────────────────────
const StarRating = ({ rating = 0, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        size={13}
        className={i < rating ? "text-[#FFDE42] fill-[#FFDE42]" : "text-slate-600"}
      />
    ))}
  </div>
);

// ─── Breadcrumb ──────────────────────────────────────────────────
const Breadcrumb = ({ items, onNavigate, isDark }) => {
  const t = T(isDark);
  return (
    <nav className="flex items-center gap-1.5 flex-wrap mb-5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className={t.textMuted} />}
          {i < items.length - 1 ? (
            <button
              onClick={() => onNavigate(i)}
              className="text-[#5478FF] hover:text-sky-400 text-xs font-semibold transition-colors"
            >
              {item}
            </button>
          ) : (
            <span className={`text-xs font-bold ${t.textPrimary}`}>{item}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

// ─── Loading spinner ─────────────────────────────────────────────
const Loader = ({ isDark }) => {
  const t = T(isDark);
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={28} className="text-[#5478FF] animate-spin" />
      <p className={`text-xs font-semibold ${t.textMuted}`}>Loading…</p>
    </div>
  );
};

// ─── Error state ─────────────────────────────────────────────────
const ErrorState = ({ message, isDark }) => {
  const t = T(isDark);
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle size={28} className="text-rose-400" />
      <p className={`text-sm font-semibold ${t.textPrimary}`}>Something went wrong</p>
      <p className={`text-xs ${t.textMuted}`}>{message}</p>
    </div>
  );
};

// ─── Empty state ─────────────────────────────────────────────────
const EmptyState = ({ label, isDark }) => {
  const t = T(isDark);
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <MessageSquare size={32} className={t.textMuted} />
      <p className={`text-sm ${t.textMuted}`}>{label ?? "No feedbacks found"}</p>
    </div>
  );
};

// ─── Feedback Detail Modal ───────────────────────────────────────
const FeedbackDetailModal = ({ feedback, onClose, isDark }) => {
  const t = T(isDark);
  if (!feedback) return null;

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const Row = ({ icon: Icon, label, value }) => (
    <div className={`flex items-start gap-3 py-2.5 border-b ${t.divider} last:border-0`}>
      <div className="h-7 w-7 rounded-lg bg-[#5478FF]/15 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-[#5478FF]" />
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${t.textPrimary}`}>{value ?? "—"}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`pointer-events-auto w-full max-w-lg ${t.modalBg} rounded-2xl shadow-2xl overflow-hidden border`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${t.modalHeader} bg-gradient-to-r from-[#5478FF]/10 to-sky-500/10`}>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#5478FF] flex items-center justify-center">
                <MessageSquare size={14} className="text-white" />
              </div>
              <div>
                <p className={`font-bold text-sm ${t.textPrimary}`}>Feedback Detail</p>
                <p className={`text-[10px] ${t.textMuted}`}>ID #{feedback.id}</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${t.modalClose}`}>
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-1 max-h-[75vh] overflow-y-auto">
            {/* Rating */}
            <div className={`flex items-center justify-between p-3 rounded-xl ${t.innerBg} border ${t.innerBorder} mb-4`}>
              <span className={`text-xs font-semibold ${t.textSecondary}`}>Rating</span>
              <StarRating rating={feedback.rating ?? 0} />
            </div>

            <Row icon={User}      label="Student / Author"  value={feedback.studentName ?? feedback.userId ?? "Anonymous"} />
            <Row icon={Building2} label="Faculty"            value={feedback.faculty} />
            <Row icon={BookOpen}  label="Program"            value={feedback.program} />
            <Row icon={Layers}    label="Year & Semester"    value={`Year ${feedback.year} · Semester ${feedback.semester}`} />
            <Row icon={Calendar}  label="Submitted"          value={feedback.submittedAt ? new Date(feedback.submittedAt).toLocaleString() : "—"} />
            <Row icon={Hash}      label="Category"           value={feedback.category} />

            {/* Comment */}
            {feedback.comment && (
              <div className={`mt-4 p-4 rounded-xl ${t.innerBg} border ${t.innerBorder}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.textMuted}`}>Comment</p>
                <p className={`text-sm leading-relaxed ${t.textSecondary}`}>{feedback.comment}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Feedback Card (row in list) ─────────────────────────────────
const FeedbackCard = ({ fb, onView, isDark }) => {
  const t = T(isDark);
  return (
    <div
      onClick={() => onView(fb)}
      className={`group flex items-start gap-4 p-4 rounded-xl border ${t.cardBorder} ${t.cardBg} ${t.rowHover} transition-all cursor-pointer hover:border-[#5478FF]/50 hover:shadow-md`}
    >
      <div className="h-10 w-10 rounded-xl bg-[#5478FF]/15 border border-[#5478FF]/30 flex items-center justify-center shrink-0">
        <MessageSquare size={16} className="text-[#5478FF]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <p className={`text-sm font-bold ${t.textPrimary} truncate`}>
            {fb.studentName ?? fb.userId ?? `Feedback #${fb.id}`}
          </p>
          <StarRating rating={fb.rating ?? 0} />
        </div>
        {fb.comment && (
          <p className={`text-xs line-clamp-2 ${t.textSecondary}`}>{fb.comment}</p>
        )}
        <div className={`flex items-center gap-3 mt-2 flex-wrap`}>
          {fb.category && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-400 border-sky-500/30`}>
              {fb.category}
            </span>
          )}
          {fb.submittedAt && (
            <span className={`text-[10px] flex items-center gap-1 ${t.textMuted}`}>
              <Clock size={9} />
              {new Date(fb.submittedAt).toLocaleDateString()}
            </span>
          )}
          <span className={`text-[10px] font-mono ${t.textMuted}`}>#{fb.id}</span>
        </div>
      </div>
      <Eye size={14} className={`${t.textMuted} group-hover:text-[#5478FF] transition-colors shrink-0 mt-1`} />
    </div>
  );
};

// ─── Semester Panel ──────────────────────────────────────────────
const SemesterPanel = ({ semester, feedbacks, onView, isDark }) => {
  const t = T(isDark);
  return (
    <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
      <div className={`px-5 py-3.5 border-b ${t.divider} flex items-center gap-3 bg-gradient-to-r from-[#5478FF]/8 to-transparent`}>
        <div className="h-7 w-7 rounded-lg bg-[#5478FF] flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] font-black">S{semester}</span>
        </div>
        <div>
          <p className={`font-bold text-sm ${t.textPrimary}`}>Semester {semester}</p>
          <p className={`text-[10px] ${t.textMuted}`}>{feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {feedbacks.length === 0 ? (
          <p className={`text-xs text-center py-6 ${t.textMuted}`}>No feedbacks for Semester {semester}</p>
        ) : (
          feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} fb={fb} onView={onView} isDark={isDark} />
          ))
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VIEW 1 — Faculty Grid
// ═══════════════════════════════════════════════════════════════════
const ViewFaculties = ({ onSelect, isDark }) => {
  const t = T(isDark);
  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-base font-black flex items-center gap-2 ${t.textPrimary}`}>
          <MessageSquare size={18} className="text-[#5478FF]" />
          Feedbacks
        </h2>
        <p className={`text-xs mt-0.5 ${t.textSecondary}`}>
          Select a faculty to browse student feedback
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FACULTIES.map((fac) => {
          const c = pc(isDark, fac.colorKey);
          return (
            <button
              key={fac.name}
              onClick={() => onSelect(fac)}
              className={`group text-left ${t.cardBg} rounded-2xl border ${c.border} shadow-sm p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl ${c.bg} border ${c.border} shrink-0`}>
                  {fac.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm leading-snug ${t.textPrimary}`}>{fac.name}</p>
                  <p className={`text-[10px] mt-1 ${t.textMuted}`}>
                    {fac.programs.length} programs
                  </p>
                </div>
                <ChevronRight size={16} className={`${t.textMuted} group-hover:text-[#5478FF] transition-colors shrink-0 mt-1`} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fac.programs.slice(0, 3).map((p) => (
                  <span key={p} className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${c.badge}`}>
                    {p}
                  </span>
                ))}
                {fac.programs.length > 3 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${c.badge} opacity-60`}>
                    +{fac.programs.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VIEW 2 — Program Grid for a Faculty
// ═══════════════════════════════════════════════════════════════════
const ViewPrograms = ({ faculty, onSelect, onBack, isDark }) => {
  const t = T(isDark);
  const c = pc(isDark, faculty.colorKey);

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 text-xs font-semibold ${t.textSecondary} hover:text-[#5478FF] transition-colors mb-5`}
      >
        <ChevronLeft size={15} />
        Back to Faculties
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className={`h-11 w-11 rounded-2xl text-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
          {faculty.icon}
        </div>
        <div>
          <h2 className={`text-base font-black ${t.textPrimary}`}>{faculty.name}</h2>
          <p className={`text-xs ${t.textMuted}`}>Select a program to view feedbacks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {faculty.programs.map((prog, i) => (
          <button
            key={prog}
            onClick={() => onSelect(prog)}
            className={`group text-left ${t.cardBg} rounded-xl border ${t.cardBorder} p-4 hover:border-[#5478FF]/60 hover:shadow-md hover:bg-[#5478FF]/5 transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black ${c.bg} ${c.icon} border ${c.border} shrink-0`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${t.textPrimary} group-hover:text-[#5478FF] transition-colors`}>
                  {prog}
                </p>
                <p className={`text-[10px] ${t.textMuted} mt-0.5`}>{faculty.name}</p>
              </div>
              <ChevronRight size={14} className={`${t.textMuted} group-hover:text-[#5478FF] transition-colors shrink-0`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// VIEW 3 — Year tabs → Semester panels for a Program
// ═══════════════════════════════════════════════════════════════════
const YEARS = [
  { num: 1, label: "1st Year" },
  { num: 2, label: "2nd Year" },
  { num: 3, label: "3rd Year" },
  { num: 4, label: "4th Year" },
];

const ViewFeedbacks = ({ faculty, program, onBack, isDark }) => {
  const t = T(isDark);
  const c = pc(isDark, faculty.colorKey);

  const [selectedYear, setSelectedYear] = useState(1);

  // feedbacksByYear[year][semester] = []
  const [feedbacksByYear, setFeedbacksByYear] = useState({});
  const [loadingYear, setLoadingYear]         = useState(false);
  const [errorYear, setErrorYear]             = useState(null);
  const [detailFb, setDetailFb]               = useState(null);

  const loadYear = useCallback(async (year) => {
    // If already loaded, skip
    if (feedbacksByYear[year]) return;
    setLoadingYear(true);
    setErrorYear(null);
    try {
      // Fetch semester 1 and semester 2 in parallel
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const base = "http://localhost:8080";

      const [r1, r2] = await Promise.all([
        axios.get(
          `${base}/api/feedbacks/program/${encodeURIComponent(program)}/year/${year}/semester/1`,
          { headers }
        ),
        axios.get(
          `${base}/api/feedbacks/program/${encodeURIComponent(program)}/year/${year}/semester/2`,
          { headers }
        ),
      ]);

      setFeedbacksByYear((prev) => ({
        ...prev,
        [year]: {
          1: Array.isArray(r1.data) ? r1.data : [],
          2: Array.isArray(r2.data) ? r2.data : [],
        },
      }));
    } catch (err) {
      setErrorYear(err.response?.data?.message ?? "Failed to load feedbacks");
    } finally {
      setLoadingYear(false);
    }
  }, [feedbacksByYear, program]);

  // Load on mount & when year changes
  useEffect(() => { loadYear(selectedYear); }, [selectedYear]);

  const yearData = feedbacksByYear[selectedYear];
  const sem1 = yearData?.[1] ?? [];
  const sem2 = yearData?.[2] ?? [];
  const total = sem1.length + sem2.length;

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 text-xs font-semibold ${t.textSecondary} hover:text-[#5478FF] transition-colors mb-5`}
      >
        <ChevronLeft size={15} />
        Back to Programs
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-2xl text-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
            {faculty.icon}
          </div>
          <div>
            <h2 className={`text-base font-black ${t.textPrimary}`}>{program}</h2>
            <p className={`text-xs ${t.textMuted}`}>{faculty.name}</p>
          </div>
        </div>
        {!loadingYear && yearData && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${c.border} ${c.bg}`}>
            <MessageSquare size={13} className={c.icon} />
            <span className={`text-xs font-bold ${c.icon}`}>{total} feedback{total !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Year tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {YEARS.map((y) => (
          <button
            key={y.num}
            onClick={() => setSelectedYear(y.num)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedYear === y.num
                ? "bg-[#5478FF] text-white border-[#5478FF] shadow-lg shadow-[#5478FF]/30"
                : isDark
                  ? "bg-[#0B1230] border-[#2B3E7A] text-slate-300 hover:border-[#5478FF]/50 hover:text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            {y.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loadingYear ? (
        <Loader isDark={isDark} />
      ) : errorYear ? (
        <ErrorState message={errorYear} isDark={isDark} />
      ) : !yearData ? (
        <Loader isDark={isDark} />
      ) : total === 0 ? (
        <EmptyState label={`No feedbacks for Year ${selectedYear}`} isDark={isDark} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <SemesterPanel semester={1} feedbacks={sem1} onView={setDetailFb} isDark={isDark} />
          <SemesterPanel semester={2} feedbacks={sem2} onView={setDetailFb} isDark={isDark} />
        </div>
      )}

      {/* Detail modal */}
      <FeedbackDetailModal
        feedback={detailFb}
        onClose={() => setDetailFb(null)}
        isDark={isDark}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ROOT EXPORT — SectionFeedbacks
// ═══════════════════════════════════════════════════════════════════
export default function SectionFeedbacks({ isDark }) {
  const t = T(isDark);

  // Step: "faculty" | "program" | "feedbacks"
  const [step, setStep]       = useState("faculty");
  const [faculty, setFaculty] = useState(null);   // full faculty object
  const [program, setProgram] = useState(null);   // string

  const breadcrumbItems = () => {
    const items = ["Feedbacks"];
    if (faculty) items.push(faculty.name);
    if (program) items.push(program);
    return items;
  };

  const handleBreadcrumb = (index) => {
    if (index === 0) { setStep("faculty"); setFaculty(null); setProgram(null); }
    if (index === 1 && faculty) { setStep("program"); setProgram(null); }
  };

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      {/* Breadcrumb — only show when deeper than root */}
      {step !== "faculty" && (
        <Breadcrumb
          items={breadcrumbItems()}
          onNavigate={handleBreadcrumb}
          isDark={isDark}
        />
      )}

      {step === "faculty" && (
        <ViewFaculties
          onSelect={(fac) => { setFaculty(fac); setStep("program"); }}
          isDark={isDark}
        />
      )}

      {step === "program" && faculty && (
        <ViewPrograms
          faculty={faculty}
          onSelect={(prog) => { setProgram(prog); setStep("feedbacks"); }}
          onBack={() => { setStep("faculty"); setFaculty(null); }}
          isDark={isDark}
        />
      )}

      {step === "feedbacks" && faculty && program && (
        <ViewFeedbacks
          faculty={faculty}
          program={program}
          onBack={() => { setStep("program"); setProgram(null); }}
          isDark={isDark}
        />
      )}
    </div>
  );
}