/**
 * ResourcesPage.jsx
 * "My Resources" — shows all files the student has uploaded
 * Place in: src/pages/student/ResourcesPage.jsx
 */

import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { T, SEED_RESOURCES } from "../../component1/pages/StudentData";
import {
  FileText, Download, Trash2, Upload, Search,
  ChevronDown, X, BookOpen,
} from "lucide-react";

export default function ResourcesPage() {
  const { isDark } = useTheme();
  const t = T(isDark);

  const myUploads   = SEED_RESOURCES.filter(r => r.uploadedBy === "student");
  const [files, setFiles] = useState(myUploads);
  const [search,    setSearch]    = useState("");
  const [subject,   setSubject]   = useState("All");
  const [sortBy,    setSortBy]    = useState("date");
  const [showUpload,setShowUpload]= useState(false);
  const [uploadName,setUploadName]= useState("");
  const [uploadSub, setUploadSub] = useState("");
  const [confirmDel,setConfirmDel]= useState(null);

  const subjects = ["All", ...new Set(SEED_RESOURCES.map(r=>r.subjectName))];

  const filtered = files
    .filter(f =>
      (subject==="All" || f.subjectName===subject) &&
      (!search || f.title.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a,b) => sortBy==="date" ? new Date(b.date)-new Date(a.date) : a.title.localeCompare(b.title));

  const handleUpload = () => {
    if (!uploadName.trim() || !uploadSub.trim()) return;
    setFiles(p => [...p, {
      id: Date.now().toString(), subjectId: "custom", subjectName: uploadSub,
      title: uploadName, type: "pdf", size: "—", uploadedBy: "student",
      date: new Date().toISOString().split("T")[0], url: "#",
    }]);
    setUploadName(""); setUploadSub(""); setShowUpload(false);
  };

  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.url === "#" ? `data:application/pdf;base64,JVBERi0xLjQ=` : file.url;
    link.download = `${file.title}.pdf`;
    link.click();
  };

  const handleDelete = (id) => { setFiles(p=>p.filter(f=>f.id!==id)); setConfirmDel(null); };

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-xl font-black flex items-center gap-2 ${t.textPrimary}`}>
          <BookOpen size={20} className="text-[#5478FF]"/> My Resources
        </h2>
        <p className={`text-sm mt-0.5 ${t.textSecondary}`}>All PDF files you have uploaded to the system</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:"Total Files",    value: files.length,                     color:"border-blue-500/20 bg-blue-500/10 text-blue-400" },
          { label:"This Month",     value: files.filter(f=>f.date.startsWith("2025-06")).length, color:"border-green-500/20 bg-green-500/10 text-green-400" },
          { label:"Subjects Covered",value:new Set(files.map(f=>f.subjectName)).size, color:"border-purple-500/20 bg-purple-500/10 text-purple-400" },
        ].map(s=>(
          <div key={s.label} className={`${t.cardBg} rounded-2xl border ${t.cardBorder} p-4 flex items-center gap-3`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border text-xl font-black ${s.color}`}>
              {s.value}
            </div>
            <p className={`text-xs font-medium ${t.textSecondary}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs"
          style={{ background: isDark?"#0D1235":"white", borderColor: isDark?"rgba(84,120,255,0.3)":"#e5e7eb" }}>
          <Search size={14} className={t.textMuted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resources…"
            className="bg-transparent text-sm focus:outline-none flex-1" style={{ color: isDark?"white":"#374151" }}/>
        </div>

        <div className="relative">
          <select value={subject} onChange={e=>setSubject(e.target.value)}
            className={`appearance-none border rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer ${t.selectBg}`}>
            {subjects.map(s=><option key={s} value={s}>{s==="All"?"All Subjects":s}</option>)}
          </select>
          <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}/>
        </div>

        <div className="relative">
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            className={`appearance-none border rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer ${t.selectBg}`}>
            <option value="date">Sort by date</option>
            <option value="name">Sort by name</option>
          </select>
          <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}/>
        </div>

        <button onClick={()=>setShowUpload(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#5478FF] text-white rounded-xl text-sm font-bold hover:bg-[#4060ee] shadow-sm shadow-[#5478FF]/30 transition-colors">
          <Upload size={14}/> Upload PDF
        </button>
      </div>

      {/* File list */}
      {filtered.length === 0 ? (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl py-16 text-center`}>
          <FileText size={40} className={`mx-auto mb-3 ${t.textMuted}`}/>
          <p className={`font-bold ${t.textPrimary}`}>No resources yet</p>
          <p className={`text-sm mt-1 ${t.textSecondary}`}>Upload your first PDF file</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <div key={f.id} className={`${t.cardBg} rounded-2xl border ${t.cardBorder} p-4 flex items-center gap-4 hover:border-[#5478FF]/40 transition-colors group`}>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-red-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${t.textPrimary}`}>{f.title}</p>
                <p className={`text-xs ${t.textSecondary}`}>
                  {f.subjectName} · {f.size} · {f.date}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={()=>handleDownload(f)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#5478FF]/30 bg-[#5478FF]/10 text-[#53CBF3] text-xs font-bold hover:bg-[#5478FF]/20 transition-colors">
                  <Download size={12}/> PDF
                </button>
                <button onClick={()=>setConfirmDel(f.id)}
                  className="p-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={13}/>
                </button>
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
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Resource Name *</label>
                  <input value={uploadName} onChange={e=>setUploadName(e.target.value)} placeholder="e.g. My Study Notes"
                    className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/30 ${t.inputBg}`}/>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Subject *</label>
                  <input value={uploadSub} onChange={e=>setUploadSub(e.target.value)} placeholder="e.g. Data Structures"
                    className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/30 ${t.inputBg}`}/>
                </div>
                <p className={`text-[11px] ${t.textMuted}`}>Connect to your backend to handle actual file uploads.</p>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={()=>setShowUpload(false)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
                  <button onClick={handleUpload} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Upload</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm ${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-2xl overflow-hidden`}>
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={22} className="text-red-400"/>
                </div>
                <h3 className={`font-bold text-base ${t.textPrimary}`}>Delete Resource?</h3>
                <p className={`text-sm mt-1 ${t.textSecondary}`}>This file will be permanently removed.</p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={()=>setConfirmDel(null)} className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
                <button onClick={()=>handleDelete(confirmDel)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Yes, Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}