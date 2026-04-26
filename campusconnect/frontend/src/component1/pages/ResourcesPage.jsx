/**
 * ResourcesPage.jsx — Fixed with real file picker
 * - "Upload PDF" button opens system file browser (PDF only)
 * - Uploaded file appears in the list with real filename and size
 * - subjectContext prop: if navigated from dashboard subject, pre-filters to that subject
 */

import { useState, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { T, SEED_RESOURCES } from "../../component1/pages/StudentData";
import {
  FileText, Download, Trash2, Upload, Search,
  ChevronDown, X, BookOpen, CheckCircle, AlertTriangle,
} from "lucide-react";

export default function ResourcesPage({ subjectContext = null, setSubjectContext }) {
  const { isDark } = useTheme();
  const t = T(isDark);
  const fileInputRef = useRef(null);

  const myUploads = SEED_RESOURCES.filter(r => r.uploadedBy === "student");
  const [files,      setFiles]      = useState(myUploads);
  const [search,     setSearch]     = useState("");
  const [subject,    setSubject]    = useState(subjectContext?.name ?? "All");
  const [sortBy,     setSortBy]     = useState("date");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name:"", subject:"", file:null, fileName:"" });
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast,      setToast]      = useState(null);

  const subjects = ["All", ...new Set(SEED_RESOURCES.map(r => r.subjectName))];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = files
    .filter(f =>
      (subject === "All" || f.subjectName === subject) &&
      (!search || f.title.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => sortBy === "date" ? new Date(b.date) - new Date(a.date) : a.title.localeCompare(b.title));

  // ── Real file picker ──────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadForm(p => ({
      ...p,
      file,
      fileName: file.name,
      name: p.name || file.name.replace(/\.pdf$/i, ""),
    }));
  };

  const handleUpload = () => {
    if (!uploadForm.name.trim() || !uploadForm.subject.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    const newFile = {
      id: Date.now().toString(),
      subjectId: "custom",
      subjectName: uploadForm.subject,
      title: uploadForm.name,
      type: "pdf",
      size: uploadForm.file ? `${(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB` : "—",
      uploadedBy: "student",
      date: new Date().toISOString().split("T")[0],
      url: uploadForm.file ? URL.createObjectURL(uploadForm.file) : "#",
      fileObj: uploadForm.file,
    };
    setFiles(p => [...p, newFile]);
    setUploadForm({ name:"", subject:"", file:null, fileName:"" });
    setShowUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("File uploaded successfully!");
  };

  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = (file.url && file.url !== "#") ? file.url : `data:application/pdf;base64,JVBERi0xLjQ=`;
    link.download = `${file.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id) => {
    const f = files.find(x => x.id === id);
    if (f?.url && f.url !== "#") URL.revokeObjectURL(f.url);
    setFiles(p => p.filter(f => f.id !== id));
    setConfirmDel(null);
    showToast("File deleted.", "info");
  };

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all ${toast.type==="error"?"bg-red-500":toast.type==="info"?"bg-[#5478FF]":"bg-green-500"}`}>
          {toast.type === "error" ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14}/></button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-xl font-black flex items-center gap-2 ${t.textPrimary}`}>
          <BookOpen size={20} className="text-[#5478FF]"/> My Resources
        </h2>
        <p className={`text-sm mt-0.5 ${t.textSecondary}`}>All PDF files you have uploaded to the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:"Total Files",      value: files.length,                                              color:"border-blue-500/20 bg-blue-500/10 text-blue-400"   },
          { label:"This Month",       value: files.filter(f => f.date.startsWith("2025-06")).length,   color:"border-green-500/20 bg-green-500/10 text-green-400" },
          { label:"Subjects Covered", value: new Set(files.map(f => f.subjectName)).size,              color:"border-purple-500/20 bg-purple-500/10 text-purple-400" },
        ].map(s => (
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
          style={{ background:isDark?"#0D1235":"white", borderColor:isDark?"rgba(84,120,255,0.3)":"#e5e7eb" }}>
          <Search size={14} className={t.textMuted}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…"
            className="bg-transparent text-sm focus:outline-none flex-1" style={{ color:isDark?"white":"#374151" }}/>
        </div>
        <div className="relative">
          <select value={subject} onChange={e => { setSubject(e.target.value); setSubjectContext?.(null); }}
            className={`appearance-none border rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer ${t.selectBg}`}>
            {subjects.map(s => <option key={s} value={s}>{s === "All" ? "All Subjects" : s}</option>)}
          </select>
          <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}/>
        </div>
        <div className="relative">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className={`appearance-none border rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer ${t.selectBg}`}>
            <option value="date">Sort by date</option>
            <option value="name">Sort by name</option>
          </select>
          <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}/>
        </div>
        {/* Upload PDF — opens modal with real file picker */}
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#5478FF] text-white rounded-xl text-sm font-bold hover:bg-[#4060ee] shadow-sm shadow-[#5478FF]/30 transition-colors">
          <Upload size={14}/> Upload PDF
        </button>
      </div>

      {/* File list */}
      {filtered.length === 0 ? (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl py-16 text-center`}>
          <FileText size={40} className={`mx-auto mb-3 ${t.textMuted}`}/>
          <p className={`font-bold ${t.textPrimary}`}>No resources yet</p>
          <p className={`text-sm mt-1 ${t.textSecondary}`}>Upload your first PDF file using the button above</p>
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
                <p className={`text-xs ${t.textSecondary}`}>{f.subjectName} · {f.size} · {f.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleDownload(f)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#5478FF]/30 bg-[#5478FF]/10 text-[#53CBF3] text-xs font-bold hover:bg-[#5478FF]/20 transition-colors">
                  <Download size={12}/> PDF
                </button>
                <button onClick={() => setConfirmDel(f.id)}
                  className="p-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload modal — real file picker ── */}
      {showUpload && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowUpload(false); setUploadForm({ name:"", subject:"", file:null, fileName:"" }); }}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className={`pointer-events-auto w-full max-w-sm ${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-2xl overflow-hidden`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${t.divider}`}>
                <p className={`font-bold text-sm ${t.textPrimary}`}>Upload PDF Resource</p>
                <button onClick={() => { setShowUpload(false); setUploadForm({ name:"", subject:"", file:null, fileName:"" }); }}
                  className={`p-1 rounded-lg ${t.modalClose}`}><X size={15}/></button>
              </div>
              <div className="px-5 py-4 space-y-4">

                {/* File picker area */}
                <div>
                  <label className={`block text-xs font-semibold mb-2 ${t.textSecondary}`}>Select PDF File *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                      ${uploadForm.file
                        ? "border-green-500/50 bg-green-500/5"
                        : isDark
                          ? "border-[#5478FF]/30 bg-[#5478FF]/5 hover:border-[#5478FF]/60 hover:bg-[#5478FF]/10"
                          : "border-gray-300 bg-gray-50 hover:border-[#5478FF]/50 hover:bg-blue-50/50"
                      }`}>
                    {uploadForm.file ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-red-400"/>
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-bold truncate max-w-[180px] ${t.textPrimary}`}>{uploadForm.fileName}</p>
                          <p className="text-[10px] text-green-500 font-semibold">✓ Ready to upload · {(uploadForm.file.size/1024/1024).toFixed(1)} MB</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setUploadForm(p=>({...p,file:null,fileName:""})); if(fileInputRef.current) fileInputRef.current.value=""; }}
                          className="ml-1 p-1 rounded-full hover:bg-red-500/10 text-red-400">
                          <X size={12}/>
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className={`mx-auto mb-2 ${t.textMuted}`}/>
                        <p className={`text-xs font-semibold ${t.textSecondary}`}>Click to browse your files</p>
                        <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>PDF files only (.pdf)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Resource name */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Resource Name *</label>
                  <input
                    value={uploadForm.name}
                    onChange={e => setUploadForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Week 5 — Lecture Notes"
                    className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/30 ${t.inputBg}`}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Subject *</label>
                  <input
                    value={uploadForm.subject}
                    onChange={e => setUploadForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Data Structures & Algorithms"
                    className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/30 ${t.inputBg}`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => { setShowUpload(false); setUploadForm({ name:"", subject:"", file:null, fileName:"" }); }}
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadForm.name.trim() || !uploadForm.subject.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <Upload size={13}/> Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm ${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-2xl overflow-hidden`}>
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={22} className="text-red-400"/>
                </div>
                <h3 className={`font-bold text-base ${t.textPrimary}`}>Delete Resource?</h3>
                <p className={`text-sm mt-1 ${t.textSecondary}`}>This file will be permanently removed from your resources.</p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setConfirmDel(null)} className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
                <button onClick={() => handleDelete(confirmDel)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Yes, Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}