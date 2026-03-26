/**
 * DashboardPage.jsx
 * Academic semester calendar + sub-pages: Study Groups, Subjects, Subject Resources
 * Place in: src/pages/student/DashboardPage.jsx
 */

import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth }  from "../../contexts/AuthContext";
import { T, SEED_SEMESTERS, SEED_RESOURCES } from "../../component1/pages/StudentData";
import {
  ArrowLeft, Users, BookOpen, Search, SortAsc, Download,
  Upload, Trash2, Plus, ChevronDown, FileText, X, Filter,
  Grid3X3, List, Calendar, Clock, BookMarked,
} from "lucide-react";

// ── Subject card (like the screenshot) ───────────────────────────
const SubjectCard = ({ subject, onClick }) => (
  <div onClick={onClick}
    className="rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all hover:shadow-xl hover:shadow-black/20 group">
    {/* Coloured banner with geometric pattern */}
    <div className="h-32 relative" style={{ background: subject.color }}>
      {/* Geometric background pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`pat-${subject.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect x="5" y="5" width="30" height="30" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
            <rect x="12" y="12" width="16" height="16" rx="1" fill="white" fillOpacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-${subject.id})`}/>
      </svg>
      {/* Progress badge */}
      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
        {subject.progress}% complete
      </div>
      {/* Section chip */}
      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/30">
        Section {subject.section}
      </div>
    </div>
    {/* Card body */}
    <div className="bg-white dark:bg-[#111640] px-4 py-3 border border-t-0 border-gray-200 dark:border-[#5478FF]/20 rounded-b-2xl">
      <p className="font-black text-sm text-gray-800 dark:text-white leading-tight">{subject.name}</p>
      <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{subject.code}</p>
    </div>
  </div>
);

// ── Subjects grid page ────────────────────────────────────────────
function SubjectsPage({ semester, onBack, onSelectSubject }) {
  const { isDark } = useTheme();
  const t = T(isDark);
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("name");
  const [section, setSection] = useState("All");

  const sections = ["All", ...new Set(semester.subjects.map(s => s.section))];

  const filtered = semester.subjects
    .filter(s =>
      (section==="All" || s.section===section) &&
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a,b) => sortBy==="name" ? a.name.localeCompare(b.name) : a.code.localeCompare(b.code));

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      {/* Back button */}
      <button onClick={onBack}
        className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-xl border border-green-400/40 text-green-400 bg-green-400/10 hover:bg-green-400/20 text-sm font-semibold transition-colors">
        <ArrowLeft size={16}/> Back
      </button>

      <div className="mb-6">
        <h2 className={`text-xl font-black ${t.textPrimary}`}>Subjects — {semester.name}</h2>
        <p className={`text-sm mt-0.5 ${t.textSecondary}`}>{semester.subjects.length} subjects enrolled</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${t.searchBg ?? t.inputBg} flex-1 min-w-[200px] max-w-xs`}
          style={{ background: isDark?"#0D1235":"white", borderColor: isDark?"rgba(84,120,255,0.3)":"#e5e7eb" }}>
          <Search size={14} className={t.textMuted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subjects…"
            className="bg-transparent text-sm focus:outline-none flex-1" style={{ color: isDark?"white":"#374151" }}/>
        </div>
        {/* Sort */}
        <div className="relative">
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            className={`appearance-none border rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer ${t.selectBg}`}>
            <option value="name">Sort by name</option>
            <option value="code">Sort by code</option>
          </select>
          <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}/>
        </div>
        {/* Section filter */}
        <div className="relative">
          <select value={section} onChange={e=>setSection(e.target.value)}
            className={`appearance-none border rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer ${t.selectBg}`}>
            {sections.map(s=><option key={s} value={s}>{s==="All"?"All Sections":`Section ${s}`}</option>)}
          </select>
          <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}/>
        </div>
      </div>

      {/* Subject grid */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${t.textMuted}`}>No subjects found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(sub => (
            <SubjectCard key={sub.id} subject={sub} onClick={() => onSelectSubject(sub)}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Subject resources page ────────────────────────────────────────
function SubjectResourcesPage({ subject, onBack, isDark }) {
  const t = T(isDark);
  const subResources = SEED_RESOURCES.filter(r => r.subjectId === subject.id);
  const [myFiles, setMyFiles] = useState(subResources.filter(r=>r.uploadedBy==="student"));
  const [allFiles] = useState(subResources.filter(r=>r.uploadedBy==="admin"));
  const [search, setSearch] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const handleFakeUpload = () => {
    if (!uploadName.trim()) return;
    setMyFiles(p=>[...p, {
      id: Date.now().toString(),
      subjectId: subject.id,
      subjectName: subject.name,
      title: uploadName,
      type: "pdf",
      size: "—",
      uploadedBy: "student",
      date: new Date().toISOString().split("T")[0],
      url: "#",
    }]);
    setUploadName(""); setShowUpload(false);
  };

  const handleDownload = (file) => {
    // In production, replace with actual PDF URL from backend
    const link = document.createElement("a");
    link.href = file.url === "#" ? `data:application/pdf;base64,JVBERi0xLjQ=` : file.url;
    link.download = `${file.title}.pdf`;
    link.click();
  };

  const handleDelete = (id) => setMyFiles(p => p.filter(f=>f.id!==id));

  const combined = [...allFiles, ...myFiles].filter(f =>
    !search || f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      <button onClick={onBack}
        className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-xl border border-green-400/40 text-green-400 bg-green-400/10 hover:bg-green-400/20 text-sm font-semibold transition-colors">
        <ArrowLeft size={16}/> Back
      </button>

      {/* Subject header */}
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} p-5 mb-6 flex items-center gap-4`}>
        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
          style={{ background: subject.color }}>
          {subject.code.slice(-2)}
        </div>
        <div>
          <h2 className={`font-black text-lg ${t.textPrimary}`}>{subject.name}</h2>
          <p className={`text-sm ${t.textSecondary}`}>{subject.code} · Section {subject.section} · {combined.length} resources</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-xs`}
          style={{ background: isDark?"#0D1235":"white", borderColor: isDark?"rgba(84,120,255,0.3)":"#e5e7eb" }}>
          <Search size={14} className={t.textMuted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resources…"
            className="bg-transparent text-sm focus:outline-none flex-1" style={{ color: isDark?"white":"#374151" }}/>
        </div>
        <button onClick={()=>setShowUpload(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#5478FF] text-white rounded-xl text-sm font-bold hover:bg-[#4060ee] transition-colors shadow-sm shadow-[#5478FF]/30">
          <Upload size={14}/> Upload PDF
        </button>
      </div>

      {/* Resource list */}
      {combined.length === 0 ? (
        <div className={`text-center py-16 ${t.textMuted}`}>No resources yet</div>
      ) : (
        <div className="space-y-2">
          {combined.map(f => (
            <div key={f.id} className={`${t.cardBg} rounded-2xl border ${t.cardBorder} p-4 flex items-center gap-4 hover:border-[#5478FF]/40 transition-colors`}>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-red-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${t.textPrimary}`}>{f.title}</p>
                <p className={`text-xs ${t.textSecondary}`}>{f.size} · {f.date} · {f.uploadedBy==="admin"?"By Admin":"My Upload"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={()=>handleDownload(f)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#5478FF]/30 bg-[#5478FF]/10 text-[#53CBF3] text-xs font-bold hover:bg-[#5478FF]/20 transition-colors">
                  <Download size={12}/> PDF
                </button>
                {f.uploadedBy === "student" && (
                  <button onClick={()=>handleDelete(f.id)}
                    className="p-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={()=>setShowUpload(false)}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className={`pointer-events-auto w-full max-w-sm ${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-2xl overflow-hidden`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${t.divider}`}>
                <p className={`font-bold text-sm ${t.textPrimary}`}>Upload PDF Resource</p>
                <button onClick={()=>setShowUpload(false)} className={`p-1 rounded-lg ${t.modalClose}`}><X size={15}/></button>
              </div>
              <div className="px-5 py-4">
                <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Resource Name *</label>
                <input value={uploadName} onChange={e=>setUploadName(e.target.value)} placeholder="e.g. My Notes Week 3"
                  className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/30 ${t.inputBg}`}/>
                <p className={`text-xs mt-2 ${t.textMuted}`}>Note: In production, attach a real PDF file via file input.</p>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={()=>setShowUpload(false)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
                  <button onClick={handleFakeUpload} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Upload</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Study Groups empty page ───────────────────────────────────────
function StudyGroupsPage({ semester, onBack }) {
  const { isDark } = useTheme();
  const t = T(isDark);
  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      <button onClick={onBack}
        className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-xl border border-green-400/40 text-green-400 bg-green-400/10 hover:bg-green-400/20 text-sm font-semibold transition-colors">
        <ArrowLeft size={16}/> Back
      </button>
      <div className={`flex flex-col items-center justify-center h-[60vh] gap-4 ${t.textMuted}`}>
        <Users size={64} className="opacity-30"/>
        <p className={`font-black text-xl ${t.textPrimary} opacity-40`}>Study Groups</p>
        <p className="text-sm opacity-50">Study groups for {semester.name} — coming soon</p>
      </div>
    </div>
  );
}

// ── Week progress bar ─────────────────────────────────────────────
const WeekBar = ({ week, total, isDark }) => {
  const t = T(isDark);
  const pct = Math.round((week / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className={`text-[10px] font-bold w-14 shrink-0 ${t.textMuted}`}>Week {week}/{total}</span>
      <div className={`flex-1 h-1.5 rounded-full ${isDark?"bg-white/10":"bg-gray-200"}`}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#5478FF] to-[#53CBF3] transition-all" style={{ width:`${pct}%` }}/>
      </div>
      <span className="text-[10px] font-bold text-[#53CBF3] w-8 text-right">{pct}%</span>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────
export default function DashboardPage({ setActive }) {
  const { isDark } = useTheme();
  const { user }   = useAuth();
  const t          = T(isDark);

  const current  = SEED_SEMESTERS.filter(s => s.active);
  const previous = SEED_SEMESTERS.filter(s => !s.active);

  const [tab,           setTab]           = useState("current");   // "current" | "previous"
  const [selectedSem,   setSelectedSem]   = useState(current[0] ?? SEED_SEMESTERS[0]);
  const [subPage,       setSubPage]       = useState("calendar");  // "calendar"|"subjects"|"studygroups"|"subjectdetail"
  const [selectedSub,   setSelectedSub]   = useState(null);
  const [currentWeek]   = useState(7); // simulated current week

  const displaySems = tab === "current" ? current : previous;

  if (subPage === "studygroups") return <StudyGroupsPage semester={selectedSem} onBack={() => setSubPage("calendar")}/>;
  if (subPage === "subjects")     return <SubjectsPage   semester={selectedSem} onBack={() => setSubPage("calendar")} onSelectSubject={s => { setSelectedSub(s); setSubPage("subjectdetail"); }}/>;
  if (subPage === "subjectdetail") return <SubjectResourcesPage subject={selectedSub} onBack={() => setSubPage("subjects")} isDark={isDark}/>;

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className={`text-2xl font-black ${t.textPrimary}`}>
          Welcome back, {user?.username ?? "Student"} 👋
        </h1>
        <p className={`text-sm mt-1 ${t.textSecondary}`}>Here's your academic overview</p>
      </div>

      {/* Tabs: Current / Previous */}
      <div className="flex gap-2 mb-5">
        {["current","previous"].map(tab_ => (
          <button key={tab_} onClick={()=>{ setTab(tab_); setSelectedSem((tab_==="current"?current:previous)[0]??SEED_SEMESTERS[0]); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${tab===tab_?"bg-[#5478FF] text-white shadow-md shadow-[#5478FF]/30":`${t.cardBg} border ${t.cardBorder} ${t.textSecondary} hover:border-[#5478FF]/40`}`}>
            {tab_} Semester{tab_==="previous"&&previous.length>0?` (${previous.length})`:""}</button>
        ))}
      </div>

      {/* Semester selector pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {displaySems.map(s => (
          <button key={s.id} onClick={() => setSelectedSem(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedSem.id===s.id?"border-[#5478FF] bg-[#5478FF]/10 text-[#53CBF3]":`${t.cardBorder} ${t.cardBg} ${t.textSecondary} hover:border-[#5478FF]/40`}`}>
            {s.active && <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 mb-0.5"/>}
            {s.name}
          </button>
        ))}
      </div>

      {/* Semester card */}
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} overflow-hidden`}>

        {/* Card header */}
        <div className={`px-6 py-4 border-b ${t.divider} flex items-start justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`font-black text-lg ${t.textPrimary}`}>{selectedSem.name}</h2>
              {selectedSem.active && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">ACTIVE</span>
              )}
            </div>
            <p className={`text-sm ${t.textSecondary}`}>{selectedSem.period} · {selectedSem.weeks} weeks · {selectedSem.subjects.length} subjects</p>
          </div>
          {/* Action buttons */}
          {selectedSem.active && (
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setSubPage("studygroups")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5478FF]/10 border border-[#5478FF]/30 text-[#53CBF3] text-xs font-bold hover:bg-[#5478FF]/20 transition-colors">
                <Users size={13}/> Study Groups
              </button>
              <button onClick={() => setSubPage("subjects")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5478FF] to-[#53CBF3] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm shadow-[#5478FF]/30">
                <BookOpen size={13}/> Subjects
              </button>
            </div>
          )}
        </div>

        {/* Body: weeks + subjects */}
        <div className="grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#5478FF]/10">

          {/* Left: Week progress */}
          <div className="p-6">
            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${t.textMuted}`}>
              <Calendar size={12} className="inline mr-1.5"/>Weekly Progress
            </h3>
            <div className="space-y-2.5">
              {Array.from({ length: Math.min(selectedSem.weeks, 16) }, (_,i)=>i+1).map(w => (
                <WeekBar key={w} week={w} total={selectedSem.weeks} isDark={isDark}/>
              ))}
            </div>
          </div>

          {/* Right: Subjects list */}
          <div className="p-6">
            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${t.textMuted}`}>
              <BookMarked size={12} className="inline mr-1.5"/>Subjects Enrolled
            </h3>
            <div className="space-y-2">
              {selectedSem.subjects.map(sub => (
                <div key={sub.id}
                  onClick={() => selectedSem.active ? (setSelectedSub(sub), setSubPage("subjectdetail")) : null}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${t.innerBorder} ${t.innerBg} ${selectedSem.active?"cursor-pointer "+t.rowHover:"opacity-70"} transition-colors`}>
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: sub.color }}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${t.textPrimary}`}>{sub.name}</p>
                    <p className={`text-[10px] ${t.textMuted}`}>{sub.code} · Section {sub.section}</p>
                  </div>
                  {/* Mini progress */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-16 h-1 rounded-full ${isDark?"bg-white/10":"bg-gray-200"}`}>
                      <div className="h-1 rounded-full" style={{ width:`${sub.progress}%`, background: sub.color }}/>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: sub.color }}>{sub.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}