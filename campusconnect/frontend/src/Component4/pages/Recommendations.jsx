import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth }  from "../../contexts/AuthContext";
import { colors }   from "../../contexts/ColorContext";
import {
  getSubjectsBySemester,
  getSubjectRecommendations,
  getResourceRecommendations,
  getResourcesBySubject,
} from "../utils/Analyticsapi";
import {
  Star, BookOpen, FileText, RefreshCw,
  AlertCircle, TrendingUp, Users, Hash,
} from "lucide-react";
import Chatbot from "../components/Chatbot";  // ← Add this import

// ─── Star display ─────────────────────────────────────────────────
const Stars = ({ avg, total }) => {
  const full    = Math.floor(avg);
  const partial = avg - full;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="relative h-3.5 w-3.5">
            {/* grey base */}
            <Star size={14} className="absolute inset-0 text-gray-600 fill-gray-600 opacity-30"/>
            {/* filled portion */}
            <div className="absolute inset-0 overflow-hidden"
              style={{ width: i <= full ? "100%" : i === full + 1 ? `${partial * 100}%` : "0%" }}>
              <Star size={14} className="text-[#FFDE42] fill-[#FFDE42]"/>
            </div>
          </div>
        ))}
      </div>
      <span className="text-[#FFDE42] text-xs font-black">{avg.toFixed(1)}</span>
      <span className="text-xs text-gray-500">({total})</span>
    </div>
  );
};

// ─── Rating bar ───────────────────────────────────────────────────
const RatingBar = ({ avg, isDark }) => (
  <div className={`flex-1 h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"} overflow-hidden`}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-[#FFDE42] to-[#FB923C] transition-all duration-500"
      style={{ width: `${(avg / 5) * 100}%` }}
    />
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────
const Skeleton = ({ isDark, rows = 4 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className={`rounded-2xl border p-4 animate-pulse ${isDark ? "bg-[#111640] border-[#5478FF]/20" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${isDark ? "bg-[#0D1235]" : "bg-gray-100"}`}/>
          <div className="flex-1 space-y-2">
            <div className={`h-3.5 w-3/5 rounded-full ${isDark ? "bg-[#0D1235]" : "bg-gray-100"}`}/>
            <div className={`h-2.5 w-2/5 rounded-full ${isDark ? "bg-[#0D1235]" : "bg-gray-100"}`}/>
          </div>
          <div className={`h-4 w-20 rounded-full ${isDark ? "bg-[#0D1235]" : "bg-gray-100"}`}/>
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────
const Empty = ({ icon: Icon, title, sub, theme }) => (
  <div className={`${theme.cardBg} border ${theme.border} rounded-2xl py-16 text-center`}>
    <Icon size={36} className={`mx-auto mb-3 ${theme.textSecondary} opacity-30`}/>
    <p className={`font-bold text-sm ${theme.text}`}>{title}</p>
    <p className={`text-xs mt-1 ${theme.textSecondary}`}>{sub}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
export default function Recommendations() {
  const { isDark }    = useTheme();
  const { user }      = useAuth();
  const theme         = isDark ? colors.dark : colors.light;

  const semesterId = user?.semesterId;

  const [activeTab, setActiveTab] = useState("subjects");

  // ── Raw data ───────────────────────────────────────────────────
  const [subjects,         setSubjects]         = useState([]);   // [{subjectId, subjectName, subjectCode}]
  const [subjectRatings,   setSubjectRatings]   = useState([]);   // [{entityType, entityId, avgRating, totalRatings}]
  const [resourceRatings,  setResourceRatings]  = useState([]);   // same shape, entityId = resourceId
  const [resourceMap,      setResourceMap]       = useState({});   // { resourceId -> { name, subjectCode } }

  // ── Loading per tab ────────────────────────────────────────────
  const [loadingSubjects,  setLoadingSubjects]  = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [error,            setError]            = useState(null);

  // ── Load subjects + subject ratings on mount ───────────────────
  useEffect(() => {
    if (!semesterId) return;
    loadSubjectData();
  }, [semesterId]);

  const loadSubjectData = async () => {
    setLoadingSubjects(true);
    setError(null);
    try {
      // 1. Get subjects for this semester
      const subRes = await getSubjectsBySemester(semesterId);
      const subs   = subRes?.data ?? [];
      setSubjects(subs);

      // 2. Get top-rated subjects for this semester
      const ratingRes = await getSubjectRecommendations(semesterId);
      setSubjectRatings(ratingRes?.data ?? []);
    } catch (e) {
      setError("Failed to load subject recommendations.");
      console.error(e);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // ── Load resource ratings when switching to resources tab ──────
  useEffect(() => {
    if (activeTab !== "resources" || subjects.length === 0) return;
    if (resourceRatings.length > 0) return;  // already loaded
    loadResourceData();
  }, [activeTab, subjects]);

  const loadResourceData = async () => {
    setLoadingResources(true);
    setError(null);
    try {
      // 3. For each subject, get top resources
      const results = await Promise.all(
        subjects.map(s =>
          getResourceRecommendations(s.subjectId)
            .then(r => ({ subjectId: s.subjectId, ratings: r?.data ?? [] }))
            .catch(() => ({ subjectId: s.subjectId, ratings: [] }))
        )
      );

      // Flatten all resource ratings
      const allRatings = results.flatMap(r => r.ratings);
      setResourceRatings(allRatings);

      // 4. Fetch resource names for all unique resourceIds
      //    We already have resources per subject from C2api — reuse them
      const resourceIds = [...new Set(allRatings.map(r => r.entityId))];

      // Build map: subjectId -> resources[]
      const subjectResourceFetches = await Promise.all(
        subjects.map(s =>
          getResourcesBySubject(s.subjectId)
            .then(res => ({ subjectCode: s.subjectCode, subjectName: s.subjectName, resources: res?.data ?? [] }))
            .catch(() => ({ subjectCode: s.subjectCode, subjectName: s.subjectName, resources: [] }))
        )
      );

      // Flatten into resourceId -> { name, subjectCode, subjectName }
      const map = {};
      subjectResourceFetches.forEach(({ subjectCode, subjectName, resources }) => {
        resources.forEach(r => {
          map[r.resourceId] = { name: r.name, subjectCode, subjectName };
        });
      });
      setResourceMap(map);
    } catch (e) {
      setError("Failed to load resource recommendations.");
      console.error(e);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === "subjects") {
      loadSubjectData();
    } else {
      setResourceRatings([]);
      loadResourceData();
    }
  };

  // ── Build subject display list ─────────────────────────────────
  // Map subjectRatings entityId → subject name
  const subjectMap = Object.fromEntries(subjects.map(s => [s.subjectId, s]));

  const rankedSubjects = subjectRatings
    .filter(r => r.entityType === "SUBJECT")
    .map(r => ({
      ...r,
      subject: subjectMap[r.entityId],
      name:    subjectMap[r.entityId]?.subjectName ?? `Subject #${r.entityId}`,
      code:    subjectMap[r.entityId]?.subjectCode ?? "—",
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  // ── Build resource display list ────────────────────────────────
  const rankedResources = resourceRatings
    .filter(r => r.entityType === "RESOURCE")
    .map(r => ({
      ...r,
      info:        resourceMap[r.entityId],
      name:        resourceMap[r.entityId]?.name        ?? `Resource #${r.entityId}`,
      subjectCode: resourceMap[r.entityId]?.subjectCode ?? "—",
      subjectName: resourceMap[r.entityId]?.subjectName ?? "—",
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  // ── Tabs ───────────────────────────────────────────────────────
  const TABS = [
    { id:"subjects",  label:"Top Subjects",   icon:Star     },
    { id:"resources", label:"Top Resources",  icon:FileText },
  ];

  const loading = activeTab === "subjects" ? loadingSubjects : loadingResources;

  if (!semesterId) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
      <div className={`${theme.cardBg} border ${theme.border} rounded-2xl p-10 text-center max-w-sm shadow-xl`}>
        <AlertCircle size={36} className="text-amber-400 mx-auto mb-3"/>
        <p className={`font-bold ${theme.text} mb-1`}>No semester found</p>
        <p className={`text-sm ${theme.textSecondary}`}>Your account doesn't have a semester linked. Contact your admin.</p>
      </div>
    </div>
  );

  return (
    <>
      <div className={`min-h-screen ${theme.background} p-6`} style={{ fontFamily:"'DM Sans', system-ui, sans-serif" }}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className={`text-2xl font-black flex items-center gap-2.5 ${theme.text}`}>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#5478FF] to-[#53CBF3] flex items-center justify-center shadow-lg shadow-[#5478FF]/30">
                  <TrendingUp size={18} className="text-white"/>
                </div>
                Recommendations
              </h1>
              <p className={`text-sm mt-1 ml-11 ${theme.textSecondary}`}>
                Top-rated content for Semester {semesterId} · based on peer ratings
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50
                ${isDark ? "border-[#5478FF]/40 text-[#53CBF3] hover:bg-[#5478FF]/10" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>Refresh
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border mb-5 text-sm font-medium
              ${isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
              <AlertCircle size={15} className="shrink-0"/>
              {error}
            </div>
          )}

          {/* Tab bar */}
          <div className={`flex gap-1.5 mb-6 p-1.5 rounded-2xl border ${theme.border} w-fit shadow-sm
            ${isDark ? "bg-[#111640]/50" : "bg-white"}`}>
            {TABS.map(tab => {
              const Icon     = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                    ${isActive
                      ? "bg-[#5478FF] text-white shadow-md shadow-[#5478FF]/30"
                      : `${theme.textSecondary} ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}`}>
                  <Icon size={13}/>{tab.label}
                </button>
              );
            })}
          </div>

          {/* ══ SUBJECTS TAB ══ */}
          {activeTab === "subjects" && (
            <div className="space-y-4">
              {loading ? <Skeleton isDark={isDark}/> : rankedSubjects.length === 0
                ? <Empty icon={Star} title="No subject ratings yet" sub="Subjects will appear here once students start rating them" theme={theme}/>
                : rankedSubjects.map((item, i) => (
                  <div key={item.entityId}
                    className={`${isDark ? "bg-[#111640] border-[#5478FF]/20" : "bg-white border-gray-200"} rounded-2xl border hover:border-[#5478FF]/50 transition-colors overflow-hidden`}>
                    <div className="flex items-center gap-4 p-4">

                      {/* Rank badge */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0
                        ${i === 0 ? "bg-[#FFDE42]/20 border border-[#FFDE42]/40 text-[#FFDE42]"
                          : i === 1 ? "bg-gray-400/15 border border-gray-400/30 text-gray-400"
                          : i === 2 ? "bg-amber-600/15 border border-amber-600/30 text-amber-600"
                          : `${isDark ? "bg-[#0D1235] border-[#5478FF]/15" : "bg-gray-50 border-gray-200"} ${theme.textSecondary}`}`}>
                        #{i + 1}
                      </div>

                      {/* Subject info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${isDark ? "text-white" : "text-[#111FA2]"}`}>{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                            ${isDark ? "bg-[#0D1235] border-[#5478FF]/30 text-[#53CBF3]" : "bg-sky-50 border-sky-200 text-sky-700"}`}>
                            {item.code}
                          </span>
                          <span className={`text-[10px] flex items-center gap-1 ${theme.textSecondary}`}>
                            <Users size={9}/>{item.totalRatings} rating{item.totalRatings !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Stars avg={item.avgRating} total={item.totalRatings}/>
                        <div className="flex items-center gap-2 w-32">
                          <RatingBar avg={item.avgRating} isDark={isDark}/>
                          <span className={`text-[10px] font-semibold shrink-0 ${theme.textSecondary}`}>
                            {((item.avgRating / 5) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ══ RESOURCES TAB ══ */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              {loading ? <Skeleton isDark={isDark}/> : rankedResources.length === 0
                ? <Empty icon={FileText} title="No resource ratings yet" sub="Resources will appear here once students start rating them" theme={theme}/>
                : rankedResources.map((item, i) => (
                  <div key={item.entityId}
                    className={`${isDark ? "bg-[#111640] border-[#5478FF]/20" : "bg-white border-gray-200"} rounded-2xl border hover:border-[#5478FF]/50 transition-colors overflow-hidden`}>
                    <div className="flex items-center gap-4 p-4">

                      {/* Rank badge */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0
                        ${i === 0 ? "bg-[#FFDE42]/20 border border-[#FFDE42]/40 text-[#FFDE42]"
                          : i === 1 ? "bg-gray-400/15 border border-gray-400/30 text-gray-400"
                          : i === 2 ? "bg-amber-600/15 border border-amber-600/30 text-amber-600"
                          : `${isDark ? "bg-[#0D1235] border-[#5478FF]/15" : "bg-gray-50 border-gray-200"} ${theme.textSecondary}`}`}>
                        #{i + 1}
                      </div>

                      {/* Resource info */}
                      <div className="h-10 w-10 rounded-xl bg-[#5478FF]/15 border border-[#5478FF]/30 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-[#5478FF]"/>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-[#111FA2]"}`}>{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                            ${isDark ? "bg-[#0D1235] border-[#5478FF]/30 text-[#53CBF3]" : "bg-sky-50 border-sky-200 text-sky-700"}`}>
                            {item.subjectCode}
                          </span>
                          <span className={`text-[10px] ${theme.textSecondary} truncate`}>{item.subjectName}</span>
                          <span className={`text-[10px] flex items-center gap-1 ${theme.textSecondary}`}>
                            <Users size={9}/>{item.totalRatings} rating{item.totalRatings !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Stars avg={item.avgRating} total={item.totalRatings}/>
                        <div className="flex items-center gap-2 w-32">
                          <RatingBar avg={item.avgRating} isDark={isDark}/>
                          <span className={`text-[10px] font-semibold shrink-0 ${theme.textSecondary}`}>
                            {((item.avgRating / 5) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

        </div>
      </div>
      
      {/* Chatbot - Add this outside the main div so it floats */}
      <Chatbot />
    </>
  );
}