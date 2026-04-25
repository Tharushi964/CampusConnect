/**
 * DashboardPage.jsx
 * Academic semester calendar + sub-pages: Study Groups, Subjects, Subject Resources
 * Place in: src/pages/student/DashboardPage.jsx
 */

import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth }  from "../../contexts/AuthContext";
import { T, SEED_SEMESTERS, SEED_RESOURCES } from "../../component1/pages/StudentData";
import {
  createSession,
  createStudyGroup,
  deleteSession,
  deleteStudyGroup,
  getAllSemesters,
  getAllSessions,
  getAllStudyGroups,
  getAllSubjects,
  getPastSessionsByGroup,
  getSessionsByOrganizer,
  getSubjectsBySemester,
  getStudyGroupsByOrganizer,
} from "../utils/C1api";
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

// ── Study Groups + Session Management ─────────────────────────────
function StudyGroupsPage({ semester, onBack }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const t = T(isDark);

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const minSessionDate = getTodayDateString();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groupSubjectOptions, setGroupSubjectOptions] = useState([]);
  const [groupSubjectsLoading, setGroupSubjectsLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const [groupForm, setGroupForm] = useState({
    groupName: "",
    status: "ACTIVE",
    semesterId: "",
    subjectId: "",
  });

  const [sessionForm, setSessionForm] = useState({
    sessionName: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    mode: "PHYSICAL",
    location: "",
    link: "",
    driveLink: "",
    status: "SCHEDULED",
  });

  const normalizedRole = (user?.role || "").toLowerCase();
  const canManage = normalizedRole === "batchrep" || normalizedRole === "admin";

  const subjectById = subjects.reduce((acc, s) => {
    acc[s.subjectId] = s;
    return acc;
  }, {});

  const semesterById = semesters.reduce((acc, s) => {
    acc[s.semesterId] = s;
    return acc;
  }, {});

  const selectedGroup = groups.find((g) => g.groupId === selectedGroupId) || null;
  const shouldHideSession = (session) => {
    const normalizedStatus = (session?.status || "").toUpperCase();
    const isPastDate = !!session?.sessionDate && session.sessionDate < minSessionDate;
    return isPastDate && (normalizedStatus === "SCHEDULED" || normalizedStatus === "CANCELLED");
  };

  const selectedGroupSessions = sessions
    .filter((s) => s.groupId === selectedGroupId)
    .filter((s) => !shouldHideSession(s))
    .sort((a, b) => `${a.sessionDate} ${a.startTime}`.localeCompare(`${b.sessionDate} ${b.startTime}`));

  const visiblePastSessions = pastSessions.filter((s) => !shouldHideSession(s));

  const loadStudyData = async () => {
    setLoading(true);
    setError("");
    try {
      const groupsReq = normalizedRole === "batchrep" && user?.userId
        ? getStudyGroupsByOrganizer(user.userId)
        : getAllStudyGroups();

      const sessionsReq = normalizedRole === "batchrep" && user?.userId
        ? getSessionsByOrganizer(user.userId)
        : getAllSessions();

      const [groupsRes, sessionsRes, semestersRes, subjectsRes] = await Promise.all([
        groupsReq,
        sessionsReq,
        getAllSemesters(),
        getAllSubjects(),
      ]);

      setGroups(groupsRes?.data ?? []);
      setSessions(sessionsRes?.data ?? []);
      setSemesters(semestersRes?.data ?? []);
      setSubjects(subjectsRes?.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load study groups and sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadPastSessions = async (groupId) => {
    if (!groupId) {
      setPastSessions([]);
      return;
    }

    try {
      const res = await getPastSessionsByGroup(groupId);
      setPastSessions(res?.data ?? []);
    } catch {
      setPastSessions([]);
    }
  };

  useEffect(() => {
    loadStudyData();
  }, [normalizedRole, user?.userId]);

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId(null);
      return;
    }
    if (!groups.some((g) => g.groupId === selectedGroupId)) {
      setSelectedGroupId(groups[0].groupId);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    loadPastSessions(selectedGroupId);
  }, [selectedGroupId]);

  useEffect(() => {
    if (!showGroupModal) {
      return;
    }

    if (!groupForm.semesterId) {
      setGroupSubjectOptions([]);
      return;
    }

    let cancelled = false;

    const loadSubjectsForSemester = async () => {
      setGroupSubjectsLoading(true);
      try {
        const res = await getSubjectsBySemester(Number(groupForm.semesterId));
        const data = res?.data ?? [];

        if (cancelled) return;

        setGroupSubjectOptions(data);
        setGroupForm((prev) => ({
          ...prev,
          subjectId: data.some((s) => String(s.subjectId) === String(prev.subjectId)) ? prev.subjectId : "",
        }));
      } catch (e) {
        if (cancelled) return;
        setGroupSubjectOptions([]);
        setError(e?.response?.data?.error || e?.response?.data?.message || "Failed to load subjects for selected semester");
      } finally {
        if (!cancelled) setGroupSubjectsLoading(false);
      }
    };

    loadSubjectsForSemester();

    return () => {
      cancelled = true;
    };
  }, [showGroupModal, groupForm.semesterId]);

  const saveGroup = async () => {
    if (!groupForm.groupName.trim() || !groupForm.semesterId || !groupForm.subjectId) {
      setNotice("Group name, semester, and subject are required");
      return;
    }

    if (!user?.userId) {
      setNotice("You must be logged in to create a study group");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      await createStudyGroup({
        groupName: groupForm.groupName.trim(),
        status: groupForm.status,
        subjectId: Number(groupForm.subjectId),
        semesterId: Number(groupForm.semesterId),
        createdByUserId: user.userId,
      });

      setShowGroupModal(false);
      setGroupForm({ groupName: "", status: "ACTIVE", semesterId: "", subjectId: "" });
      setNotice("Study group created successfully");
      await loadStudyData();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create study group");
    } finally {
      setSaving(false);
    }
  };

  const saveSession = async () => {
    if (!selectedGroupId) {
      setNotice("Select a study group first");
      return;
    }

    if (!sessionForm.sessionName.trim() || !sessionForm.sessionDate || !sessionForm.startTime || !sessionForm.endTime) {
      setNotice("Session name, date, start time, and end time are required");
      return;
    }

    const normalizedStatus = (sessionForm.status || "").toUpperCase();
    const allowsPastDate = normalizedStatus === "COMPLETED";

    if (!allowsPastDate && sessionForm.sessionDate < minSessionDate) {
      setNotice("Session date cannot be in the past unless status is COMPLETED");
      return;
    }

    if (sessionForm.mode === "ONLINE" && !sessionForm.link.trim()) {
      setNotice("Online sessions require a meeting link");
      return;
    }

    if (sessionForm.mode === "PHYSICAL" && !sessionForm.location.trim()) {
      setNotice("Physical sessions require a location");
      return;
    }

    if (!user?.userId) {
      setNotice("You must be logged in to create a session");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      await createSession({
        sessionName: sessionForm.sessionName.trim(),
        sessionDate: sessionForm.sessionDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        mode: sessionForm.mode,
        location: sessionForm.mode === "PHYSICAL" ? sessionForm.location.trim() : null,
        link: sessionForm.mode === "ONLINE" ? sessionForm.link.trim() : null,
        driveLink: sessionForm.driveLink.trim() || null,
        status: sessionForm.status,
        groupId: selectedGroupId,
        createdByUserId: user.userId,
      });

      setShowSessionModal(false);
      setSessionForm({
        sessionName: "",
        sessionDate: "",
        startTime: "",
        endTime: "",
        mode: "PHYSICAL",
        location: "",
        link: "",
        driveLink: "",
        status: "SCHEDULED",
      });
      setNotice("Session created successfully");
      await loadStudyData();
      await loadPastSessions(selectedGroupId);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const removeGroup = async () => {
    if (!selectedGroupId) return;
    if (!window.confirm("Delete this study group?")) return;

    setSaving(true);
    setNotice("");
    try {
      await deleteStudyGroup(selectedGroupId);
      setNotice("Study group deleted successfully");
      await loadStudyData();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete study group");
    } finally {
      setSaving(false);
    }
  };

  const removeSession = async (sessionId) => {
    if (!window.confirm("Delete this session?")) return;

    setSaving(true);
    setNotice("");
    try {
      await deleteSession(sessionId);
      setNotice("Session deleted successfully");
      await loadStudyData();
      await loadPastSessions(selectedGroupId);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-xl border border-green-400/40 text-green-400 bg-green-400/10 hover:bg-green-400/20 text-sm font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-4 flex flex-wrap gap-3 items-start justify-between">
        <div>
          <h2 className={`font-black text-xl ${t.textPrimary}`}>Study Groups and Sessions</h2>
          <p className={`text-sm mt-1 ${t.textSecondary}`}>
            Manage physical and online sessions for {semester.name}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-bold hover:bg-[#4060ee]"
          >
            <Plus size={14} /> New Study Group
          </button>
        )}
      </div>

      {notice && (
        <div className="mb-4 px-3 py-2 rounded-xl text-sm border border-emerald-300/40 text-emerald-500 bg-emerald-500/10">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-xl text-sm border border-red-300/40 text-red-400 bg-red-500/10">
          {error}
        </div>
      )}

      {loading ? (
        <div className={`text-sm ${t.textMuted}`}>Loading study groups...</div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 lg:col-span-2`}>
            <h3 className={`font-bold text-sm mb-3 ${t.textPrimary}`}>Study Groups ({groups.length})</h3>
            {groups.length === 0 ? (
              <p className={`text-xs ${t.textMuted}`}>No study groups found.</p>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {groups.map((g) => {
                  const semesterItem = semesterById[g.semesterId];
                  const subjectItem = subjectById[g.subjectId];
                  const count = sessions.filter((s) => s.groupId === g.groupId).length;
                  const selected = selectedGroupId === g.groupId;
                  return (
                    <button
                      key={g.groupId}
                      onClick={() => setSelectedGroupId(g.groupId)}
                      className={`w-full text-left rounded-xl border p-3 transition-colors ${selected ? "border-[#5478FF] bg-[#5478FF]/10" : `${t.innerBorder} ${t.innerBg} ${t.rowHover}`}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold ${t.textPrimary}`}>{g.groupName}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${g.status === "ACTIVE" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : "text-amber-400 border-amber-400/30 bg-amber-400/10"}`}>
                          {g.status}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${t.textSecondary}`}>
                        {subjectItem?.subjectCode || "No Subject"} • Y{semesterItem?.yearNumber || "?"}S{semesterItem?.semesterNumber || "?"}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${t.textMuted}`}>{count} session{count !== 1 ? "s" : ""}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 lg:col-span-3`}>
            {!selectedGroup ? (
              <div className={`h-full min-h-[240px] flex items-center justify-center ${t.textMuted}`}>
                Select a study group to view sessions.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 items-start justify-between mb-4">
                  <div>
                    <h3 className={`font-black text-lg ${t.textPrimary}`}>{selectedGroup.groupName}</h3>
                    <p className={`text-xs mt-0.5 ${t.textSecondary}`}>
                      {subjectById[selectedGroup.subjectId]?.subjectName || "Unknown Subject"}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowSessionModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#53CBF3]/20 border border-[#53CBF3]/30 text-[#53CBF3] text-xs font-bold hover:bg-[#53CBF3]/30"
                      >
                        <Plus size={13} /> New Session
                      </button>
                      <button
                        onClick={removeGroup}
                        disabled={saving}
                        className="px-3 py-2 rounded-xl border border-red-400/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Delete Group
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <p className={`text-[11px] uppercase tracking-wider font-black ${t.textMuted}`}>Sessions</p>
                  {selectedGroupSessions.length === 0 ? (
                    <p className={`text-xs ${t.textMuted}`}>No sessions in this study group.</p>
                  ) : (
                    selectedGroupSessions.map((s) => (
                      <div key={s.sessionId} className={`${t.innerBg} ${t.innerBorder} border rounded-xl p-3`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className={`text-sm font-bold ${t.textPrimary}`}>{s.sessionName}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.mode === "ONLINE" ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" : "text-orange-400 border-orange-400/30 bg-orange-400/10"}`}>
                              {s.mode}
                            </span>
                            {canManage && (
                              <button
                                onClick={() => removeSession(s.sessionId)}
                                disabled={saving}
                                className="text-[10px] px-2 py-0.5 rounded-full border border-red-400/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <p className={`text-[11px] mt-1 ${t.textSecondary}`}>
                          {s.sessionDate} • {s.startTime} - {s.endTime}
                        </p>
                        {s.mode === "ONLINE" && s.link && (
                          <a href={s.link} target="_blank" rel="noreferrer" className="text-[11px] text-[#53CBF3] hover:underline">
                            Join Link
                          </a>
                        )}
                        {s.mode === "PHYSICAL" && s.location && (
                          <p className={`text-[11px] ${t.textSecondary}`}>Location: {s.location}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <p className={`text-[11px] uppercase tracking-wider font-black mb-2 ${t.textMuted}`}>
                    Past Sessions With Drive Links
                  </p>
                  {visiblePastSessions.length === 0 ? (
                    <p className={`text-xs ${t.textMuted}`}>No past sessions with drive links yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {visiblePastSessions.map((s) => (
                        <div key={s.sessionId} className={`${t.innerBg} ${t.innerBorder} border rounded-xl p-3 flex items-center justify-between gap-2`}>
                          <div>
                            <p className={`text-sm font-semibold ${t.textPrimary}`}>{s.sessionName}</p>
                            <p className={`text-[11px] ${t.textSecondary}`}>{s.sessionDate}</p>
                          </div>
                          <a
                            href={s.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5478FF]/30 bg-[#5478FF]/10 text-[#53CBF3] text-xs font-bold hover:bg-[#5478FF]/20"
                          >
                            <Download size={12} /> Drive Link
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showGroupModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowGroupModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className={`pointer-events-auto w-full max-w-md ${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-2xl overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${t.divider} flex items-center justify-between`}>
                <p className={`font-bold text-sm ${t.textPrimary}`}>Create Study Group</p>
                <button onClick={() => setShowGroupModal(false)} className={`p-1 rounded-lg ${t.modalClose}`}><X size={15} /></button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Group Name *</label>
                  <input
                    value={groupForm.groupName}
                    onChange={(e) => setGroupForm((p) => ({ ...p, groupName: e.target.value }))}
                    className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Semester *</label>
                    <select
                      value={groupForm.semesterId}
                      onChange={(e) => setGroupForm((p) => ({ ...p, semesterId: e.target.value, subjectId: "" }))}
                      className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((s) => (
                        <option key={s.semesterId} value={s.semesterId}>Y{s.yearNumber}S{s.semesterNumber}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Status *</label>
                    <select
                      value={groupForm.status}
                      onChange={(e) => setGroupForm((p) => ({ ...p, status: e.target.value }))}
                      className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Subject *</label>
                  <select
                    value={groupForm.subjectId}
                    onChange={(e) => setGroupForm((p) => ({ ...p, subjectId: e.target.value }))}
                    disabled={!groupForm.semesterId || groupSubjectsLoading}
                    className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}
                  >
                    <option value="" disabled>
                      {!groupForm.semesterId
                        ? "Select Semester First"
                        : groupSubjectsLoading
                          ? "Loading subjects..."
                          : "Select Subject"}
                    </option>
                    {!!groupForm.semesterId && !groupSubjectsLoading && groupSubjectOptions.length === 0 && (
                      <option value="" disabled>No subjects found for this semester</option>
                    )}
                    {groupSubjectOptions.map((s) => (
                      <option key={s.subjectId} value={s.subjectId}>{s.subjectCode} - {s.subjectName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setShowGroupModal(false)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary}`}>Cancel</button>
                  <button onClick={saveGroup} disabled={saving} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee] disabled:opacity-60">Save</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showSessionModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowSessionModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className={`pointer-events-auto w-full max-w-lg ${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-2xl overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${t.divider} flex items-center justify-between`}>
                <p className={`font-bold text-sm ${t.textPrimary}`}>Create Session</p>
                <button onClick={() => setShowSessionModal(false)} className={`p-1 rounded-lg ${t.modalClose}`}><X size={15} /></button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Session Name *</label>
                  <input
                    value={sessionForm.sessionName}
                    onChange={(e) => setSessionForm((p) => ({ ...p, sessionName: e.target.value }))}
                    className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Date *</label>
                    <input
                      type="date"
                      value={sessionForm.sessionDate}
                      min={sessionForm.status === "COMPLETED" ? undefined : minSessionDate}
                      onChange={(e) => setSessionForm((p) => ({ ...p, sessionDate: e.target.value }))}
                      className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Start *</label>
                    <input type="time" value={sessionForm.startTime} onChange={(e) => setSessionForm((p) => ({ ...p, startTime: e.target.value }))} className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>End *</label>
                    <input type="time" value={sessionForm.endTime} onChange={(e) => setSessionForm((p) => ({ ...p, endTime: e.target.value }))} className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Mode *</label>
                    <select value={sessionForm.mode} onChange={(e) => setSessionForm((p) => ({ ...p, mode: e.target.value }))} className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}>
                      <option value="PHYSICAL">PHYSICAL</option>
                      <option value="ONLINE">ONLINE</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Status *</label>
                    <select value={sessionForm.status} onChange={(e) => setSessionForm((p) => ({ ...p, status: e.target.value }))} className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}>
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
                {sessionForm.mode === "PHYSICAL" ? (
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Location *</label>
                    <input value={sessionForm.location} onChange={(e) => setSessionForm((p) => ({ ...p, location: e.target.value }))} className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`} />
                  </div>
                ) : (
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Meeting Link *</label>
                    <input value={sessionForm.link} onChange={(e) => setSessionForm((p) => ({ ...p, link: e.target.value }))} className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`} />
                  </div>
                )}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Past Session Drive Link (Optional)</label>
                  <input
                    value={sessionForm.driveLink}
                    onChange={(e) => setSessionForm((p) => ({ ...p, driveLink: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className={`w-full p-2.5 border rounded-xl text-sm ${t.inputBg}`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setShowSessionModal(false)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary}`}>Cancel</button>
                  <button onClick={saveSession} disabled={saving} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee] disabled:opacity-60">Save</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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