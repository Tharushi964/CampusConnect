/**
 * SectionFeedbacks.jsx
 * Admin Portal — Feedback Module (Session-Based)
 *
 * Flow:
 *  [Sessions Grid] → click → [Feedback Side Panel / Modal]
 *
 * API: getAllSessions(), getFeedbackBySession(sessionId), getAllFeedbacks()
 */

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, ChevronRight, X,
  Star, Calendar, Clock, MapPin,
  Video, Loader2, AlertCircle,
  ThumbsUp, ThumbsDown, Minus,
  Hash, User, Search, Filter,
  CheckCircle2, XCircle, Radio,
} from "lucide-react";

import { T } from "../components/AdminUiComponents";
import { getAllFeedbacks, getFeedbackBySession } from "../utils/C1api";
import {getAllSessions} from "../../component3/utils/studyGroupApi"


// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
};

const fmt12h = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const getSessionTemporal = (dateStr) => {
  if (!dateStr) return "PAST";
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr > today) return "UPCOMING";
  if (dateStr < today) return "PAST";
  return "TODAY";
};

// ─── Feedback type config ────────────────────────────────────────────────────

const TYPE_CONFIG = {
  POSITIVE: {
    icon: ThumbsUp,
    label: "Positive",
    dark:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  NEGATIVE: {
    icon: ThumbsDown,
    label: "Negative",
    dark:  "bg-rose-500/10 text-rose-400 border-rose-500/30",
    light: "bg-rose-50 text-rose-700 border-rose-200",
  },
  NEUTRAL: {
    icon: Minus,
    label: "Neutral",
    dark:  "bg-slate-500/10 text-slate-400 border-slate-500/30",
    light: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

const typeConf = (type, isDark) => {
  const conf = TYPE_CONFIG[type] ?? TYPE_CONFIG.NEUTRAL;
  return { ...conf, cls: isDark ? conf.dark : conf.light };
};

// ─── Status badge ────────────────────────────────────────────────────────────

const SessionStatusBadge = ({ status, isDark }) => {
  const active = status === "ACTIVE";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
      active
        ? isDark
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
        : isDark
          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
          : "bg-rose-50 text-rose-700 border-rose-200"
    }`}>
      {active ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
      {active ? "Active" : "Inactive"}
    </span>
  );
};

const TemporalBadge = ({ date, isDark }) => {
  const temporal = getSessionTemporal(date);
  const conf = {
    TODAY:    { label: "Today",    cls: isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200" },
    UPCOMING: { label: "Upcoming", cls: isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/30"   : "bg-blue-50 text-blue-700 border-blue-200"   },
    PAST:     { label: "Past",     cls: isDark ? "bg-slate-500/10 text-slate-400 border-slate-500/30" : "bg-slate-100 text-slate-500 border-slate-200" },
  }[temporal];

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${conf.cls}`}>
      {conf.label}
    </span>
  );
};

// ─── Loading / Error / Empty ─────────────────────────────────────────────────

const Loader = ({ isDark }) => {
  const t = T(isDark);
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={28} className="text-[#5478FF] animate-spin" />
      <p className={`text-xs font-semibold ${t.textMuted}`}>Loading…</p>
    </div>
  );
};

const ErrorState = ({ message, isDark }) => {
  const t = T(isDark);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle size={26} className="text-rose-400" />
      <p className={`text-sm font-semibold ${t.textPrimary}`}>Something went wrong</p>
      <p className={`text-xs ${t.textMuted}`}>{message}</p>
    </div>
  );
};

const EmptyFeedbacks = ({ isDark }) => {
  const t = T(isDark);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <MessageSquare size={30} className={`${t.textMuted} opacity-40`} />
      <p className={`text-sm font-semibold ${t.textPrimary}`}>No feedbacks yet</p>
      <p className={`text-xs ${t.textMuted}`}>This session hasn't received any feedback.</p>
    </div>
  );
};

// ─── Feedback Item ───────────────────────────────────────────────────────────

const FeedbackItem = ({ fb, isDark }) => {
  const t = T(isDark);
  const conf = typeConf(fb.feedbackType, isDark);
  const Icon = conf.icon;

  return (
    <div className={`p-4 rounded-xl border ${isDark ? "border-[#2B3E7A] bg-[#0B1230]/60" : "border-gray-200 bg-gray-50/60"} flex flex-col gap-2.5`}>
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${conf.cls}`}>
            <Icon size={12} />
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${conf.cls}`}>
            {conf.label}
          </span>
        </div>
        <span className={`text-[10px] font-mono ${t.textMuted}`}>#{fb.feedbackId}</span>
      </div>

      {/* Message */}
      {fb.message && (
        <p className={`text-sm leading-relaxed ${t.textSecondary}`}>"{fb.message}"</p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-[10px] flex items-center gap-1 ${t.textMuted}`}>
          <User size={9} />
          User #{fb.userId}
        </span>
        {fb.createdAt && (
          <span className={`text-[10px] flex items-center gap-1 ${t.textMuted}`}>
            <Clock size={9} />
            {new Date(fb.createdAt).toLocaleString()}
          </span>
        )}
        {fb.status && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
            fb.status === "ACTIVE"
              ? isDark ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-emerald-700 border-emerald-200 bg-emerald-50"
              : isDark ? "text-slate-400 border-slate-500/30 bg-slate-500/10"       : "text-slate-500 border-slate-200 bg-slate-100"
          }`}>
            {fb.status}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Feedback Panel (slide-in) ───────────────────────────────────────────────

const FeedbackPanel = ({ session, onClose, isDark }) => {
  const t = T(isDark);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError(null);
    getFeedbackBySession(session.sessionId)
      .then((res) => setFeedbacks(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err?.response?.data?.message ?? "Failed to load feedbacks"))
      .finally(() => setLoading(false));
  }, [session?.sessionId]);

  // Esc to close
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!session) return null;

  const isOnline = session.mode === "ONLINE";
  const counts = {
    POSITIVE: feedbacks.filter(f => f.feedbackType === "POSITIVE").length,
    NEGATIVE: feedbacks.filter(f => f.feedbackType === "NEGATIVE").length,
    NEUTRAL:  feedbacks.filter(f => f.feedbackType === "NEUTRAL").length,
  };
  const displayed = typeFilter === "ALL" ? feedbacks : feedbacks.filter(f => f.feedbackType === typeFilter);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl shadow-2xl flex flex-col ${
        isDark ? "bg-[#060D24] border-l border-[#2B3E7A]" : "bg-white border-l border-gray-200"
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex-shrink-0 ${
          isDark ? "border-[#2B3E7A] bg-[#0B1230]" : "border-gray-200 bg-gray-50"
        }`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                isDark ? "bg-[#5478FF]/15 border border-[#5478FF]/30" : "bg-blue-50 border border-blue-200"
              }`}>
                {isOnline ? "💻" : "🏫"}
              </div>
              <div>
                <p className={`font-bold text-sm leading-snug ${t.textPrimary}`}>{session.sessionName}</p>
                <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>Session #{session.sessionId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              <X size={16} />
            </button>
          </div>

          {/* Session meta */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            <div className={`flex items-center gap-1.5 ${t.textSecondary}`}>
              <Calendar size={11} className="text-[#5478FF]" />
              {fmtDate(session.sessionDate)}
            </div>
            <div className={`flex items-center gap-1.5 ${t.textSecondary}`}>
              <Clock size={11} className="text-[#5478FF]" />
              {fmt12h(session.startTime)} – {fmt12h(session.endTime)}
            </div>
            <div className={`flex items-center gap-1.5 ${t.textSecondary}`}>
              {isOnline ? <Video size={11} className="text-purple-400" /> : <MapPin size={11} className="text-teal-400" />}
              {isOnline ? (session.link || "Online") : (session.location || "In-person")}
            </div>
            <div className="flex items-center gap-1.5">
              <TemporalBadge date={session.sessionDate} isDark={isDark} />
              <SessionStatusBadge status={session.status} isDark={isDark} />
            </div>
          </div>

          {/* Sentiment summary */}
          {!loading && !error && feedbacks.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "POSITIVE", count: counts.POSITIVE, color: isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700" },
                { type: "NEGATIVE", count: counts.NEGATIVE, color: isDark ? "border-rose-500/30 bg-rose-500/10 text-rose-400"         : "border-rose-200 bg-rose-50 text-rose-700"           },
                { type: "NEUTRAL",  count: counts.NEUTRAL,  color: isDark ? "border-slate-500/30 bg-slate-500/10 text-slate-400"       : "border-slate-200 bg-slate-100 text-slate-500"      },
              ].map(({ type, count, color }) => (
                <div key={type} className={`flex flex-col items-center p-2 rounded-xl border ${color}`}>
                  <span className="text-lg font-black">{count}</span>
                  <span className="text-[10px] font-bold">{type[0] + type.slice(1).toLowerCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter tabs */}
        {!loading && !error && feedbacks.length > 0 && (
          <div className={`px-6 py-3 border-b flex-shrink-0 flex items-center gap-2 flex-wrap ${
            isDark ? "border-[#2B3E7A]" : "border-gray-200"
          }`}>
            {["ALL", "POSITIVE", "NEGATIVE", "NEUTRAL"].map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  typeFilter === f
                    ? "bg-[#5478FF] text-white border-[#5478FF]"
                    : isDark
                      ? "border-[#2B3E7A] text-slate-400 hover:border-[#5478FF]/50 hover:text-white"
                      : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {f === "ALL" ? `All (${feedbacks.length})` : `${f[0] + f.slice(1).toLowerCase()} (${counts[f]})`}
              </button>
            ))}
          </div>
        )}

        {/* Feedback list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <Loader isDark={isDark} />
          ) : error ? (
            <ErrorState message={error} isDark={isDark} />
          ) : feedbacks.length === 0 ? (
            <EmptyFeedbacks isDark={isDark} />
          ) : displayed.length === 0 ? (
            <div className={`text-center py-10 text-sm ${t.textMuted}`}>No {typeFilter.toLowerCase()} feedbacks</div>
          ) : (
            displayed.map((fb) => (
              <FeedbackItem key={fb.feedbackId} fb={fb} isDark={isDark} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

// ─── Session Card ────────────────────────────────────────────────────────────

const SessionCard = ({ session, feedbackCount, onClick, isDark }) => {
  const t = T(isDark);
  const isOnline = session.mode === "ONLINE";
  const temporal = getSessionTemporal(session.sessionDate);

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-[#5478FF]/50 ${
        isDark
          ? "bg-[#0B1230] border-[#2B3E7A] hover:bg-[#0F1840]"
          : "bg-white border-gray-200 hover:bg-blue-50/50"
      } ${temporal === "TODAY" ? (isDark ? "border-amber-500/40" : "border-amber-300") : ""}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
            isDark ? "bg-[#5478FF]/10 border border-[#5478FF]/20" : "bg-blue-50 border border-blue-200"
          }`}>
            {isOnline ? "💻" : "🏫"}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold leading-snug ${t.textPrimary} group-hover:text-[#5478FF] transition-colors`}>
              {session.sessionName}
            </p>
            <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>Session #{session.sessionId}</p>
          </div>
        </div>
        <ChevronRight size={15} className={`${t.textMuted} group-hover:text-[#5478FF] transition-colors shrink-0 mt-1`} />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 mb-3">
        <div className={`flex items-center gap-1.5 text-xs ${t.textSecondary}`}>
          <Calendar size={11} className="text-[#5478FF] shrink-0" />
          {fmtDate(session.sessionDate)}
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${t.textSecondary}`}>
          <Clock size={11} className="text-[#5478FF] shrink-0" />
          {fmt12h(session.startTime)} – {fmt12h(session.endTime)}
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${t.textSecondary}`}>
          {isOnline
            ? <Video size={11} className="text-purple-400 shrink-0" />
            : <MapPin size={11} className="text-teal-400 shrink-0" />}
          <span className="truncate">{isOnline ? (session.link || "Online") : (session.location || "In-person")}</span>
        </div>
      </div>

      {/* Footer badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TemporalBadge date={session.sessionDate} isDark={isDark} />
          <SessionStatusBadge status={session.status} isDark={isDark} />
        </div>

        {/* Feedback count pill */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
          feedbackCount > 0
            ? isDark ? "bg-[#5478FF]/15 text-[#8BA3FF] border-[#5478FF]/30" : "bg-blue-50 text-blue-700 border-blue-200"
            : isDark ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-gray-50 text-gray-400 border-gray-200"
        }`}>
          <MessageSquare size={9} />
          {feedbackCount} feedback{feedbackCount !== 1 ? "s" : ""}
        </div>
      </div>
    </button>
  );
};

// ─── Stats Bar ───────────────────────────────────────────────────────────────

const StatsBar = ({ sessions, allFeedbacks, isDark }) => {
  const t = T(isDark);
  const today = new Date().toISOString().slice(0, 10);

  const stats = [
    { label: "Total Sessions",  value: sessions.length },
    { label: "Total Feedbacks", value: allFeedbacks.length },
    { label: "Positive",        value: allFeedbacks.filter(f => f.feedbackType === "POSITIVE").length },
    { label: "Negative",        value: allFeedbacks.filter(f => f.feedbackType === "NEGATIVE").length },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl border px-4 py-3 ${
          isDark ? "bg-[#0B1230] border-[#2B3E7A]" : "bg-white border-gray-200"
        }`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${t.textMuted}`}>{s.label}</p>
          <p className={`text-2xl font-black ${t.textPrimary}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT — SectionFeedbacks
// ═══════════════════════════════════════════════════════════════════════════════

export default function SectionFeedbacks({ isDark }) {
  const t = T(isDark);

  const [sessions,     setSessions]     = useState([]);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Search + filter
  const [search,       setSearch]       = useState("");
  const [modeFilter,   setModeFilter]   = useState("ALL");   // ALL | ONLINE | OFFLINE
  const [temporalFilter, setTemporalFilter] = useState("ALL"); // ALL | TODAY | UPCOMING | PAST

  // Load sessions + all feedbacks in parallel
  useEffect(() => {
    setLoading(true);
    Promise.all([getAllSessions(), getAllFeedbacks()])
      .then(([sessRes, fbRes]) => {
        const sess = Array.isArray(sessRes.data) ? sessRes.data : [];
        const fbs  = Array.isArray(fbRes.data)  ? fbRes.data  : [];

        // Sort: today → upcoming → past, then by date
        const order = { TODAY: 0, UPCOMING: 1, PAST: 2 };
        sess.sort((a, b) => {
          const ta = order[getSessionTemporal(a.sessionDate)] ?? 3;
          const tb = order[getSessionTemporal(b.sessionDate)] ?? 3;
          return ta !== tb ? ta - tb : (a.sessionDate ?? "").localeCompare(b.sessionDate ?? "");
        });

        setSessions(sess);
        setAllFeedbacks(fbs);
      })
      .catch((err) => setError(err?.response?.data?.message ?? "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // Build per-session feedback count map
  const feedbackCountMap = allFeedbacks.reduce((acc, fb) => {
    acc[fb.sessionId] = (acc[fb.sessionId] ?? 0) + 1;
    return acc;
  }, {});

  // Apply filters
  const displayed = sessions.filter((s) => {
    if (modeFilter !== "ALL" && s.mode !== modeFilter) return false;
    if (temporalFilter !== "ALL" && getSessionTemporal(s.sessionDate) !== temporalFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.sessionName?.toLowerCase().includes(q) &&
        !s.location?.toLowerCase().includes(q) &&
        !String(s.sessionId).includes(q)
      ) return false;
    }
    return true;
  });

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      {/* Page header */}
      <div className="mb-6">
        <h2 className={`text-base font-black flex items-center gap-2 ${t.textPrimary}`}>
          <MessageSquare size={18} className="text-[#5478FF]" />
          Feedbacks
        </h2>
        <p className={`text-xs mt-0.5 ${t.textSecondary}`}>
          Browse all study sessions and view student feedback for each
        </p>
      </div>

      {loading ? (
        <Loader isDark={isDark} />
      ) : error ? (
        <ErrorState message={error} isDark={isDark} />
      ) : (
        <>
          {/* Stats */}
          <StatsBar sessions={sessions} allFeedbacks={allFeedbacks} isDark={isDark} />

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textMuted}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sessions by name, location or ID…"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                  isDark
                    ? "bg-[#0B1230] border-[#2B3E7A] text-white placeholder-slate-600 focus:border-[#5478FF]"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
                }`}
              />
            </div>

            {/* Mode filter */}
            <div className="flex gap-1">
              {["ALL", "ONLINE", "OFFLINE"].map((f) => (
                <button
                  key={f}
                  onClick={() => setModeFilter(f)}
                  className={`text-[11px] font-bold px-3 py-2 rounded-lg border transition-all whitespace-nowrap ${
                    modeFilter === f
                      ? "bg-[#5478FF] text-white border-[#5478FF]"
                      : isDark
                        ? "border-[#2B3E7A] text-slate-400 hover:border-[#5478FF]/50 hover:text-white"
                        : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-700 bg-white"
                  }`}
                >
                  {f === "ALL" ? "All Modes" : f[0] + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Temporal filter */}
            <div className="flex gap-1">
              {["ALL", "TODAY", "UPCOMING", "PAST"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTemporalFilter(f)}
                  className={`text-[11px] font-bold px-3 py-2 rounded-lg border transition-all whitespace-nowrap ${
                    temporalFilter === f
                      ? "bg-[#5478FF] text-white border-[#5478FF]"
                      : isDark
                        ? "border-[#2B3E7A] text-slate-400 hover:border-[#5478FF]/50 hover:text-white"
                        : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-700 bg-white"
                  }`}
                >
                  {f === "ALL" ? "All Time" : f[0] + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className={`text-xs mb-4 ${t.textMuted}`}>
            Showing <span className={`font-bold ${t.textPrimary}`}>{displayed.length}</span> of{" "}
            <span className={`font-bold ${t.textPrimary}`}>{sessions.length}</span> sessions
          </p>

          {/* Sessions grid */}
          {displayed.length === 0 ? (
            <div className={`text-center py-20 ${t.textMuted}`}>
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sessions match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((session) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  feedbackCount={feedbackCountMap[session.sessionId] ?? 0}
                  onClick={() => setSelectedSession(session)}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Feedback side panel */}
      {selectedSession && (
        <FeedbackPanel
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}