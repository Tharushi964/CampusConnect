import { useState, useEffect, useRef } from "react";
import {
  MapPin, Phone, Mail, Globe, Building2, GraduationCap,
  Pencil, Upload, Camera, Edit3, X, Plus, Trash2, BookOpen,
  Layers, Calendar, BookMarked, ChevronRight, Loader2, AlertTriangle
} from "lucide-react";

import {ConfirmModal} from "../../component1/components/AdminUiComponents";
import {ToastPopup}  from "../../component1/components/AdminUiComponents";
import { T }       from "../../component1/components/AdminUiComponents";

import sliitBg from "../../assets/sliit.jpg";
import myImage from "../../assets/sliit_logo.png";

import {
  getCampusById,
  getFacultyByCampus, createFaculty, updateFaculty, deleteFaculty,
  getProgramsByFaculty, createProgram, updateProgram, deleteProgram,
  getCurriculumByProgram, createCurriculum, updateCurriculum, deleteCurriculum,
  getBatchByCurriculum, createBatch, updateBatch, deleteBatch,
  getSemesterByBatch, createSemester, updateSemester, deleteSemester,
  getSubjectsBySemester, createSubject, updateSubject, deleteSubject,
} from "../utils/C2api";

// ─── Constants ─────────────────────────────────────────────────────
const CAMPUS_ID = 1;
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CHIP_COLORS   = [{c:"text-sky-400 bg-sky-500/15 border-sky-500/40"},{c:"text-purple-400 bg-purple-500/15 border-purple-500/40"},{c:"text-amber-400 bg-amber-500/15 border-amber-500/40"},{c:"text-teal-400 bg-teal-500/15 border-teal-500/40"}];
const CHIP_COLORS_L = [{c:"text-sky-700 bg-sky-50 border-sky-200"},{c:"text-purple-700 bg-purple-50 border-purple-200"},{c:"text-amber-700 bg-amber-50 border-amber-200"},{c:"text-teal-700 bg-teal-50 border-teal-200"}];

// ─── Shared helpers ─────────────────────────────────────────────────
const spin = "h-4 w-4 rounded-full border-2 border-[#5478FF] border-t-transparent animate-spin";

const InfoRow = ({ icon: Icon, label, value, cls, isDark }) => {
  const t = T(isDark);

  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 shrink-0 ${cls}`}>
        <Icon size={14}/>
      </div>

      <div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
          {label}
        </p>
        <p className={`text-sm font-semibold leading-tight ${t.textPrimary}`}>
          {value}
        </p>
      </div>
    </div>
  );
};

// ─── Small themed modal ─────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, isDark }) => {
  const t = T(isDark);
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`pointer-events-auto w-full max-w-lg ${t.modalBg} rounded-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.modalHeader} shrink-0`}>
            <p className={`font-bold text-sm ${t.textPrimary}`}>{title}</p>
            <button onClick={onClose} className={`p-1 rounded-lg ${t.modalClose}`}><X size={15}/></button>
          </div>
          <div className="px-5 py-4 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
};

// ─── Field ──────────────────────────────────────────────────────────
const F = ({ label, children, required }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold mb-1.5 opacity-70">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

// ─── Accordion section ──────────────────────────────────────────────
const AccordionSection = ({ title, icon: Icon, color, count, isOpen, onToggle, onAdd, addLabel, loading, children, isDark }) => {
  const t = T(isDark);
  const showAddButton = ["Batches", "Semesters", "Subjects"].includes(title);
  return (
    <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${t.divider} cursor-pointer`} onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${color.iconBg}`}>
            <Icon size={16} className={color.iconText}/>
          </div>
          <div>
            <p className={`font-bold text-sm ${t.textPrimary}`}>{title}</p>
            <p className={`text-[10px] ${t.textMuted}`}>{count} registered</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <div className={spin}/>}
          
          {showAddButton && (
            <button
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#5478FF] text-white rounded-xl text-xs font-bold hover:bg-[#4060ee] shadow-sm"
            >
                <Plus size={12}/>Add
            </button>
        )}
          <ChevronRight size={14} className={`${t.textMuted} transition-transform ${isOpen ? "rotate-90" : ""}`}/>
        </div>
      </div>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

// ─── Empty state ────────────────────────────────────────────────────
const Empty = ({ label, isDark }) => {
  const t = T(isDark);
  return <p className={`text-center text-sm py-8 ${t.textMuted}`}>No {label} found</p>;
};

// ═══════════════════════════════════════════════════════════════════
const SectionEntities = ({ notify, isDark }) => {
  const t = T(isDark);
  const logoInputRef = useRef(null);

  // ── Campus state ──────────────────────────────────────────────────
  const [campus, setCampus]       = useState({ name:"Sri Lanka Institute of Information Technology",shortName:"SLIIT",established:"1999",type:"Non-state Degree-Awarding Institute",address:"New Kandy Rd, Malabe 10115, Sri Lanka",phone:"+94 11 754 4801",fax:"+94 11 754 4802",email:"info@sliit.lk",web:"www.sliit.lk",students:"16,000+",staff:"800+",accreditation:"UGC Approved",vision:"To be the leading technological university in Sri Lanka." });
  const [draft, setDraft]         = useState({ ...campus });
  const [editing, setEditing]     = useState(false);
  const [logoSrc, setLogoSrc]     = useState(null);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const effectiveLogo = logoSrc || myImage;
  const hd = (e) => setDraft(p => ({ ...p, [e.target.name]: e.target.value }));
  const doSave = () => { setCampus({ ...draft }); setEditing(false); setSaveConfirm(false); showToast("Campus details updated!"); };
  const handleLogoChange = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => setLogoSrc(ev.target.result); r.readAsDataURL(f); };
  const CampusField = ({ label, name, value, onChange, textarea = false }) => (
    <div>
      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}>{label}</label>
      {textarea
        ? <textarea name={name} value={value} onChange={onChange} rows={2} className={`w-full p-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 resize-none ${t.inputBg}`}/>
        : <input name={name} value={value} onChange={onChange} className={`w-full p-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}/>}
    </div>
  );

  // ── Toast ─────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show:false, message:"", type:"success" });
  const showToast = (msg, type = "success") => setToast({ show:true, message:msg, type });

  // ── Accordion open state ──────────────────────────────────────────
  const [open, setOpen] = useState({ faculty:true, program:false, curriculum:false, batch:false, semester:false, subject:false });
  const toggle = (key) => setOpen(p => ({ ...p, [key]: !p[key] }));

  // ══════════════════════════════════════
  // FACULTY
  // ══════════════════════════════════════
  const [faculties, setFaculties]   = useState([]);
  const [lFac, setLFac]             = useState(false);
  const [facModal, setFacModal]     = useState(null);
  const [facConfirm, setFacConfirm] = useState(null);
  const [facForm, setFacForm]       = useState({ facultyName:"", status:"ACTIVE" });

  const loadFaculties = async () => {
    setLFac(true);
    try { const r = await getFacultyByCampus(CAMPUS_ID); setFaculties(r?.data ?? []); }
    catch { showToast("Failed to load faculties","error"); }
    finally { setLFac(false); }
  };

  useEffect(() => { loadFaculties(); }, []);

  const saveFaculty = async () => {
    try {
      if (facModal.mode === "add") await createFaculty({ ...facForm, campusId: CAMPUS_ID });
      else await updateFaculty(facModal.id, facForm);
      showToast(`Faculty ${facModal.mode === "add" ? "created" : "updated"}!`);
      setFacModal(null); loadFaculties();
    } catch (e) { showToast(e?.response?.data?.message ?? "Failed to save faculty","error"); }
  };

  const doDeleteFaculty = async (id) => {
    try { await deleteFaculty(id); showToast("Faculty deleted."); setFacConfirm(null); loadFaculties(); }
    catch (e) { showToast(e?.response?.data?.message ?? "Failed to delete","error"); setFacConfirm(null); }
  };

  // ══════════════════════════════════════
  // PROGRAM
  // ══════════════════════════════════════
  const [programs, setPrograms]     = useState([]);
  const [selFacId, setSelFacId]     = useState("");
  const [lProg, setLProg]           = useState(false);
  const [progModal, setProgModal]   = useState(null);
  const [progConfirm, setProgConfirm] = useState(null);
  const [progForm, setProgForm]     = useState({ programName:"", durationYears:4, status:"ACTIVE", facultyId:"" });

  const loadPrograms = async (facId) => {
    if (!facId) return;
    setLProg(true);
    try { const r = await getProgramsByFaculty(facId); setPrograms(r?.data ?? []); }
    catch { showToast("Failed to load programs","error"); }
    finally { setLProg(false); }
  };

  const saveProgram = async () => {
    try {
      if (progModal.mode === "add") await createProgram({ ...progForm, facultyId: Number(progForm.facultyId) });
      else await updateProgram(progModal.id, { ...progForm, facultyId: Number(progForm.facultyId) });
      showToast(`Program ${progModal.mode === "add" ? "created" : "updated"}!`);
      setProgModal(null); loadPrograms(selFacId);
    } catch (e) { showToast(e?.response?.data?.message ?? "Failed to save program","error"); }
  };

  const doDeleteProgram = async (id) => {
    try { await deleteProgram(id); showToast("Program deleted."); setProgConfirm(null); loadPrograms(selFacId); }
    catch (e) { showToast(e?.response?.data?.message ?? "Failed to delete","error"); setProgConfirm(null); }
  };

  // ══════════════════════════════════════
  // CURRICULUM
  // ══════════════════════════════════════
  const [curricula, setCurricula]     = useState([]);
  const [selProgId, setSelProgId]     = useState("");
  const [lCur, setLCur]               = useState(false);
  const [curModal, setCurModal]       = useState(null);
  const [curConfirm, setCurConfirm]   = useState(null);
  const [curForm, setCurForm]         = useState({ curriculumName:"", version:"v1.0", createdYear: new Date().getFullYear(), status:"ACTIVE", programId:"" });

  const loadCurricula = async (progId) => {
    if (!progId) return;
    setLCur(true);
    try { const r = await getCurriculumByProgram(progId); setCurricula(r?.data ?? []); }
    catch { showToast("Failed to load curricula","error"); }
    finally { setLCur(false); }
  };

  const saveCurriculum = async () => {
    try {
      const payload = { ...curForm, programId: Number(curForm.programId), createdYear: Number(curForm.createdYear) };
      if (curModal.mode === "add") await createCurriculum(payload);
      else await updateCurriculum(curModal.id, payload);
      showToast(`Curriculum ${curModal.mode === "add" ? "created" : "updated"}!`);
      setCurModal(null); loadCurricula(selProgId);
    } catch (e) { showToast(e?.response?.data?.message ?? "Failed to save curriculum","error"); }
  };

  const doDeleteCurriculum = async (id) => {
    try { await deleteCurriculum(id); showToast("Curriculum deleted."); setCurConfirm(null); loadCurricula(selProgId); }
    catch (e) { showToast(e?.response?.data?.message ?? "Failed to delete","error"); setCurConfirm(null); }
  };

  // ══════════════════════════════════════
  // BATCH
  // ══════════════════════════════════════
  const [batches, setBatches]       = useState([]);
  const [selCurId, setSelCurId]     = useState("");
  const [lBat, setLBat]             = useState(false);
  const [batModal, setBatModal]     = useState(null);
  const [batConfirm, setBatConfirm] = useState(null);
  const [batForm, setBatForm]       = useState({ batchName:"", intakeYear: new Date().getFullYear(), intakeMonth:"January", status:"ACTIVE", campusId: CAMPUS_ID, curriculumId:"" });

  const loadBatches = async (curId) => {
    if (!curId) return;
    setLBat(true);
    try { const r = await getBatchByCurriculum(curId); setBatches(r?.data ?? []); }
    catch { showToast("Failed to load batches","error"); }
    finally { setLBat(false); }
  };

  const saveBatch = async () => {
    try {
      const payload = { ...batForm, curriculumId: Number(batForm.curriculumId), intakeYear: Number(batForm.intakeYear), campusId: CAMPUS_ID };
      if (batModal.mode === "add") await createBatch(payload);
      else await updateBatch(batModal.id, payload);
      showToast(`Batch ${batModal.mode === "add" ? "created" : "updated"}!`);
      setBatModal(null); loadBatches(selCurId);
    } catch (e) { showToast(e?.response?.data?.message ?? "Failed to save batch","error"); }
  };

  const doDeleteBatch = async (id) => {
    try { await deleteBatch(id); showToast("Batch deleted."); setBatConfirm(null); loadBatches(selCurId); }
    catch (e) { showToast(e?.response?.data?.message ?? "Failed to delete","error"); setBatConfirm(null); }
  };

  // ══════════════════════════════════════
  // SEMESTER
  // ══════════════════════════════════════
  const [semesters, setSemesters]     = useState([]);
  const [selBatId, setSelBatId]       = useState("");
  const [lSem, setLSem]               = useState(false);
  const [semModal, setSemModal]       = useState(null);
  const [semConfirm, setSemConfirm]   = useState(null);
  const [semForm, setSemForm]         = useState({ yearNumber:1, semesterNumber:1, startDate:"", endDate:"", status:"ACTIVE", batchId:"" });

  const loadSemesters = async (batId) => {
    if (!batId) return;
    setLSem(true);
    try { const r = await getSemesterByBatch(batId); setSemesters(r?.data ?? []); }
    catch { showToast("Failed to load semesters","error"); }
    finally { setLSem(false); }
  };

  const saveSemester = async () => {
    try {
      const payload = { ...semForm, batchId: Number(semForm.batchId), yearNumber: Number(semForm.yearNumber), semesterNumber: Number(semForm.semesterNumber) };
      if (semModal.mode === "add") await createSemester(payload);
      else await updateSemester(semModal.id, payload);
      showToast(`Semester ${semModal.mode === "add" ? "created" : "updated"}!`);
      setSemModal(null); loadSemesters(selBatId);
    } catch (e) { showToast(e?.response?.data?.message ?? "Failed to save semester","error"); }
  };

  const doDeleteSemester = async (id) => {
    try { await deleteSemester(id); showToast("Semester deleted."); setSemConfirm(null); loadSemesters(selBatId); }
    catch (e) { showToast(e?.response?.data?.message ?? "Failed to delete","error"); setSemConfirm(null); }
  };

  // ══════════════════════════════════════
  // SUBJECT
  // ══════════════════════════════════════
  const [subjects, setSubjects]       = useState([]);
  const [selSemId, setSelSemId]       = useState("");
  const [lSub, setLSub]               = useState(false);
  const [subModal, setSubModal]       = useState(null);
  const [subConfirm, setSubConfirm]   = useState(null);
  const [subForm, setSubForm]         = useState({ subjectCode:"", subjectName:"", credits:3, curriculumId:"", semesterId:"" });

  const loadSubjects = async (semId) => {
    if (!semId) return;
    setLSub(true);
    try { const r = await getSubjectsBySemester(semId); setSubjects(r?.data ?? []); }
    catch { showToast("Failed to load subjects","error"); }
    finally { setLSub(false); }
  };

  const saveSubject = async () => {
    try {
      const payload = { ...subForm, semesterId: Number(subForm.semesterId), curriculumId: Number(subForm.curriculumId), credits: Number(subForm.credits) };
      if (subModal.mode === "add") await createSubject(payload);
      else await updateSubject(subModal.id, payload);
      showToast(`Subject ${subModal.mode === "add" ? "created" : "updated"}!`);
      setSubModal(null); loadSubjects(selSemId);
    } catch (e) { showToast(e?.response?.data?.message ?? "Failed to save subject","error"); }
  };

  const doDeleteSubject = async (id) => {
    try { await deleteSubject(id); showToast("Subject deleted."); setSubConfirm(null); loadSubjects(selSemId); }
    catch (e) { showToast(e?.response?.data?.message ?? "Failed to delete","error"); setSubConfirm(null); }
  };

  // ── Shared form input classes ──────────────────────────────────
  const inp = `w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`;
  const sel = `${inp} appearance-none cursor-pointer`;

  // ── Campus chips ──────────────────────────────────────────────
  const chips = [
    { label:"Students", value: campus.students },
    { label:"Staff",    value: campus.staff },
    { label:"Faculties",value: faculties.length },
    { label:"Programs", value: programs.length },
  ];

  // ── Filter dropdown ────────────────────────────────────────────
  const FilterDD = ({ label, value, onChange, options, labelKey, valueKey, renderLabel, loading: ld }) => (
  <div className="flex items-center gap-2 flex-wrap mb-4">
    <span className={`text-xs font-semibold ${t.textSecondary}`}>{label}:</span>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className={`${sel} pr-8 pl-3 py-1.5 text-xs`}>
        <option value="">— select —</option>
        {options.map(o => (
          <option key={o[valueKey]} value={o[valueKey]}>
            {renderLabel ? renderLabel(o) : o[labelKey]}
          </option>
        ))}
      </select>
      {ld && <div className="absolute right-2 top-1/2 -translate-y-1/2"><div className={spin}/></div>}
    </div>
  </div>
);

  // ── Row item ───────────────────────────────────────────────────
  const RowItem = ({ label, sub, onEdit, onDelete, showActions }) => {

  return (
    <div className={`flex items-center justify-between px-4 py-3 ${t.innerBg} rounded-xl border ${t.innerBorder} hover:border-[#5478FF]/40 transition-all group`}>
      <div>
        <p className={`text-sm font-semibold ${t.textPrimary}`}>{label}</p>
        {sub && <p className={`text-[10px] ${t.textMuted}`}>{sub}</p>}
      </div>

      {showActions && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-500/10">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
};


  // ──────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-6 ${t.pageBg} min-h-screen p-6`}>
      <ToastPopup show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(p => ({ ...p, show:false }))}/>

      {/* ── Campus Card ── */}
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <div className="h-28 relative bg-center bg-cover" style={{ backgroundImage:`url(${sliitBg})`, backgroundPosition:"center 45%" }}>
          <div className="absolute inset-0 bg-black/40"/>
          {!editing && (
            <button onClick={() => { setDraft({ ...campus }); setEditing(true); }} className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20">
              <Pencil size={12}/>Edit Details
            </button>
          )}
        </div>
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-end gap-4 -mt-12 mb-5">
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                <img src={effectiveLogo} alt="Logo" className="h-full w-full object-contain p-1" onError={e => { e.target.onerror=null; e.target.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%235478FF' rx='12'/%3E%3Ctext x='40' y='52' font-size='22' text-anchor='middle' fill='white' font-weight='bold'%3ESL%3C/text%3E%3C/svg%3E"; }}/>
              </div>
              <button onClick={() => logoInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center"><Camera size={18} className="mx-auto"/><span className="text-[9px] font-bold block mt-0.5">Change</span></div>
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange}/>
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h2 className={`font-black text-xl leading-tight ${t.textPrimary}`}>{campus.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#5478FF] bg-[#5478FF]/15 px-2.5 py-0.5 rounded-full border border-[#5478FF]/40">{campus.shortName}</span>
                <span className={`text-xs ${t.textSecondary}`}>Est. {campus.established}</span>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/40">{campus.accreditation}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            {chips.map((s, i) => { const c = isDark ? CHIP_COLORS[i]?.c : CHIP_COLORS_L[i]?.c; return (
              <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${c}`}>
                <span className="text-2xl font-black">{s.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{s.label}</span>
              </div>
            ); })}
          </div>

          {!editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <InfoRow icon={MapPin}        label="Address" value={campus.address} cls="text-sky-500" isDark={isDark}/>
              <InfoRow icon={Phone}         label="Phone"   value={campus.phone}   cls="text-sky-500" isDark={isDark}/>
              <InfoRow icon={Mail}          label="Email"   value={campus.email}   cls="text-purple-500" isDark={isDark}/>
              <InfoRow icon={Globe}         label="Website" value={campus.web}     cls="text-teal-500" isDark={isDark}/>
              <InfoRow icon={Building2}     label="Type"    value={campus.type}    cls="text-[#5478FF]" isDark={isDark}/>
              <InfoRow icon={GraduationCap} label="Vision"  value={campus.vision}  cls="text-amber-500" isDark={isDark}/>
            </div>
          )}

          {editing && (
            <div className={`${t.innerBg} rounded-2xl border ${t.innerBorder} p-5`}>
              <p className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${t.textMuted}`}><Edit3 size={12}/>Editing Campus Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <CampusField label="Full Name"     name="name"          value={draft.name}          onChange={hd}/>
                <CampusField label="Short Name"    name="shortName"     value={draft.shortName}     onChange={hd}/>
                <CampusField label="Established"   name="established"   value={draft.established}   onChange={hd}/>
                <CampusField label="Inst. Type"    name="type"          value={draft.type}          onChange={hd}/>
                <CampusField label="Phone"         name="phone"         value={draft.phone}         onChange={hd}/>
                <CampusField label="Fax"           name="fax"           value={draft.fax}           onChange={hd}/>
                <CampusField label="Email"         name="email"         value={draft.email}         onChange={hd}/>
                <CampusField label="Website"       name="web"           value={draft.web}           onChange={hd}/>
                <CampusField label="Students"      name="students"      value={draft.students}      onChange={hd}/>
                <CampusField label="Staff"         name="staff"         value={draft.staff}         onChange={hd}/>
                <CampusField label="Accreditation" name="accreditation" value={draft.accreditation} onChange={hd}/>
              </div>
              <CampusField label="Address" name="address" value={draft.address} onChange={hd}/>
              <div className="mt-3"><CampusField label="Vision Statement" name="vision" value={draft.vision} onChange={hd} textarea/></div>
              <div className={`mt-4 p-3 ${t.cardBg} rounded-xl border ${t.cardBorder} flex items-center gap-4`}>
                <img src={effectiveLogo} alt="logo" className="h-12 w-12 object-contain rounded-xl p-1"/>
                <div>
                  <p className={`text-xs font-bold mb-1 ${t.textPrimary}`}>Campus Logo</p>
                  <button onClick={() => logoInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5478FF] text-white rounded-xl text-xs font-bold hover:bg-[#4060ee]"><Upload size={12}/>Upload</button>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setEditing(false)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
                <button onClick={() => setSaveConfirm(true)} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-start">
      {/* ══════════════ FACULTY ══════════════ */}
      <AccordionSection title="Faculties" icon={GraduationCap} color={{ iconBg:"bg-amber-500/15 border border-amber-500/40", iconText:"text-amber-500" }}
        count={faculties.length} isOpen={open.faculty} onToggle={() => toggle("faculty")} loading={lFac} isDark={isDark}
        onAdd={() => { setFacForm({ facultyName:"", status:"ACTIVE" }); setFacModal({ mode:"add" }); }}>
        {faculties.length === 0 ? <Empty label="faculties" isDark={isDark}/> : (
          <div className="space-y-2">
            {faculties.map(f => (
              <RowItem key={f.facultyId} label={f.facultyName} sub={`Status: ${f.status}`}
                onEdit={() => { setFacForm({ facultyName: f.facultyName, status: f.status }); setFacModal({ mode:"edit", id: f.facultyId }); }}
                onDelete={() => setFacConfirm(f.facultyId)}
                showActions={false}/>
            ))}
          </div>
        )}
      </AccordionSection>

      {/* ══════════════ PROGRAM ══════════════ */}
      <AccordionSection title="Programs" icon={BookOpen} color={{ iconBg:"bg-purple-500/15 border border-purple-500/40", iconText:"text-purple-500" }}
        count={programs.length} isOpen={open.program} onToggle={() => toggle("program")} loading={lProg} isDark={isDark}
        onAdd={() => { setProgForm({ programName:"", durationYears:4, status:"ACTIVE", facultyId: selFacId || (faculties[0]?.facultyId ?? "") }); setProgModal({ mode:"add" }); }}>
        <FilterDD label="Filter by Faculty" value={selFacId} onChange={v => { setSelFacId(v); loadPrograms(v); }}
          options={faculties} labelKey="facultyName" valueKey="facultyId" loading={lFac}/>
        {!selFacId
          ? <p className={`text-xs text-center py-6 ${t.textMuted}`}>Select a faculty above to view its programs</p>
          : programs.length === 0 ? <Empty label="programs" isDark={isDark}/>
          : <div className="space-y-2">
              {programs.map(p => (
                <RowItem key={p.programId} label={p.programName} sub={`${p.durationYears} yrs · ${p.status}`}
                  onEdit={() => { setProgForm({ programName: p.programName, durationYears: p.durationYears, status: p.status, facultyId: p.facultyId }); setProgModal({ mode:"edit", id: p.programId }); }}
                  onDelete={() => setProgConfirm(p.programId)}
                  showActions={false}/>
              ))}
            </div>
        }
      </AccordionSection>

      {/* ══════════════ CURRICULUM ══════════════ */}
      <AccordionSection title="Curriculum" icon={BookMarked} color={{ iconBg:"bg-sky-500/15 border border-sky-500/40", iconText:"text-sky-500" }}
        count={curricula.length} isOpen={open.curriculum} onToggle={() => toggle("curriculum")} loading={lCur} isDark={isDark}
        onAdd={() => { setCurForm({ curriculumName:"", version:"v1.0", createdYear: new Date().getFullYear(), status:"ACTIVE", programId: selProgId || "" }); setCurModal({ mode:"add" }); }}>
        <FilterDD label="Filter by Program" value={selProgId} onChange={v => { setSelProgId(v); loadCurricula(v); }}
          options={programs} labelKey="programName" valueKey="programId" loading={lProg}/>
        {!selProgId
          ? <p className={`text-xs text-center py-6 ${t.textMuted}`}>Select a program above to view its curricula</p>
          : curricula.length === 0 ? <Empty label="curricula" isDark={isDark}/>
          : <div className="space-y-2">
              {curricula.map(c => (
                <RowItem key={c.curriculumId} label={`${c.curriculumName} ${c.version}`} sub={`Year: ${c.createdYear} · ${c.status}`}
                  onEdit={() => { setCurForm({ curriculumName: c.curriculumName, version: c.version, createdYear: c.createdYear, status: c.status, programId: c.programId }); setCurModal({ mode:"edit", id: c.curriculumId }); }}
                  onDelete={() => setCurConfirm(c.curriculumId)}
                  showActions={false}/>
              ))}
            </div>
        }
      </AccordionSection>

      {/* ══════════════ BATCH ══════════════ */}
      <AccordionSection title="Batches" icon={Layers} color={{ iconBg:"bg-teal-500/15 border border-teal-500/40", iconText:"text-teal-500" }}
        count={batches.length} isOpen={open.batch} onToggle={() => toggle("batch")} loading={lBat} isDark={isDark}
        onAdd={() => { setBatForm({ batchName:"", intakeYear: new Date().getFullYear(), intakeMonth:"January", status:"ACTIVE", campusId: CAMPUS_ID, curriculumId: selCurId || "" }); setBatModal({ mode:"add" }); }}>
        <FilterDD label="Filter by Curriculum" value={selCurId} onChange={v => { setSelCurId(v); loadBatches(v); }}
          options={curricula} labelKey="curriculumName" valueKey="curriculumId" loading={lCur}/>
        {!selCurId
          ? <p className={`text-xs text-center py-6 ${t.textMuted}`}>Select a curriculum above to view its batches</p>
          : batches.length === 0 ? <Empty label="batches" isDark={isDark}/>
          : <div className="space-y-2">
              {batches.map(b => (
                <RowItem key={b.batchId} label={b.batchName} sub={`${b.intakeMonth} ${b.intakeYear} · ${b.status}`}
                  onEdit={() => { setBatForm({ batchName: b.batchName, intakeYear: b.intakeYear, intakeMonth: b.intakeMonth, status: b.status, campusId: CAMPUS_ID, curriculumId: b.curriculumId }); setBatModal({ mode:"edit", id: b.batchId }); }}
                  onDelete={() => setBatConfirm(b.batchId)}
                  showActions={true}
                />
              ))}
            </div>
        }
      </AccordionSection>

      {/* ══════════════ SEMESTER ══════════════ */}
      <AccordionSection title="Semesters" icon={Calendar} color={{ iconBg:"bg-indigo-500/15 border border-indigo-500/40", iconText:"text-indigo-500" }}
        count={semesters.length} isOpen={open.semester} onToggle={() => toggle("semester")} loading={lSem} isDark={isDark}
        onAdd={() => { setSemForm({ yearNumber:1, semesterNumber:1, startDate:"", endDate:"", status:"ACTIVE", batchId: selBatId || "" }); setSemModal({ mode:"add" }); }}>
        <FilterDD label="Filter by Batch" value={selBatId} onChange={v => { setSelBatId(v); loadSemesters(v); }}
          options={batches} labelKey="batchName" valueKey="batchId" loading={lBat}/>
        {!selBatId
          ? <p className={`text-xs text-center py-6 ${t.textMuted}`}>Select a batch above to view its semesters</p>
          : semesters.length === 0 ? <Empty label="semesters" isDark={isDark}/>
          : <div className="space-y-2">
              {semesters.map(s => (
                <RowItem key={s.semesterId} label={`Year ${s.yearNumber} · Semester ${s.semesterNumber}`} sub={`${s.startDate} → ${s.endDate} · ${s.status}`}
                  onEdit={() => { setSemForm({ yearNumber: s.yearNumber, semesterNumber: s.semesterNumber, startDate: s.startDate, endDate: s.endDate, status: s.status, batchId: s.batchId }); setSemModal({ mode:"edit", id: s.semesterId }); }}
                  onDelete={() => setSemConfirm(s.semesterId)}
                  showActions={true}
                />
              ))}   
            </div>
        }
      </AccordionSection>

      {/* ══════════════ SUBJECT ══════════════ */}
      <AccordionSection title="Subjects" icon={BookOpen} color={{ iconBg:"bg-rose-500/15 border border-rose-500/40", iconText:"text-rose-500" }}
        count={subjects.length} isOpen={open.subject} onToggle={() => toggle("subject")} loading={lSub} isDark={isDark}
        onAdd={() => { setSubForm({ subjectCode:"", subjectName:"", credits:3, curriculumId: selCurId || "", semesterId: selSemId || "" }); setSubModal({ mode:"add" }); }}>
        <FilterDD
          label="Filter by Semester"
          value={selSemId}
          onChange={v => { setSelSemId(v); loadSubjects(v); }}
          options={semesters}
          valueKey="semesterId"
          renderLabel={(s) => `Year ${s.yearNumber} · Semester ${s.semesterNumber}`}
          loading={lSem}
        />
        {!selSemId
          ? <p className={`text-xs text-center py-6 ${t.textMuted}`}>Select a semester above to view its subjects</p>
          : subjects.length === 0 ? <Empty label="subjects" isDark={isDark}/>
          : <div className="space-y-2">
              {subjects.map(s => (
                <RowItem key={s.subjectId} label={`${s.subjectCode} — ${s.subjectName}`} sub={`${s.credits} credits`}
                  onEdit={() => { setSubForm({ subjectCode: s.subjectCode, subjectName: s.subjectName, credits: s.credits, curriculumId: s.curriculumId, semesterId: s.semesterId }); setSubModal({ mode:"edit", id: s.subjectId }); }}
                  onDelete={() => setSubConfirm(s.subjectId)} showActions={true}/>
              ))}
            </div>
        }
      </AccordionSection>
      </div>

      {/* ════════ MODALS ════════ */}

      {/* Faculty modal */}
      <Modal open={!!facModal} onClose={() => setFacModal(null)} title={facModal?.mode === "add" ? "Add Faculty" : "Edit Faculty"} isDark={isDark}>
        <F label="Faculty Name" required><input value={facForm.facultyName} onChange={e => setFacForm(p => ({ ...p, facultyName: e.target.value }))} placeholder="e.g. Faculty of Computing" className={inp}/></F>
        <F label="Status" required><select value={facForm.status} onChange={e => setFacForm(p => ({ ...p, status: e.target.value }))} className={sel}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></F>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setFacModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
          <button onClick={saveFaculty} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button>
        </div>
      </Modal>

      {/* Program modal */}
      <Modal open={!!progModal} onClose={() => setProgModal(null)} title={progModal?.mode === "add" ? "Add Program" : "Edit Program"} isDark={isDark}>
        <F label="Program Name" required><input value={progForm.programName} onChange={e => setProgForm(p => ({ ...p, programName: e.target.value }))} placeholder="e.g. BSc IT" className={inp}/></F>
        <F label="Faculty" required><select value={progForm.facultyId} onChange={e => setProgForm(p => ({ ...p, facultyId: e.target.value }))} className={sel}><option value="">Select…</option>{faculties.map(f => <option key={f.facultyId} value={f.facultyId}>{f.facultyName}</option>)}</select></F>
        <F label="Duration (years)" required><input type="number" min={1} max={6} value={progForm.durationYears} onChange={e => setProgForm(p => ({ ...p, durationYears: e.target.value }))} className={inp}/></F>
        <F label="Status" required><select value={progForm.status} onChange={e => setProgForm(p => ({ ...p, status: e.target.value }))} className={sel}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></F>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setProgModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
          <button onClick={saveProgram} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button>
        </div>
      </Modal>

      {/* Curriculum modal */}
      <Modal open={!!curModal} onClose={() => setCurModal(null)} title={curModal?.mode === "add" ? "Add Curriculum" : "Edit Curriculum"} isDark={isDark}>
        <F label="Curriculum Name" required><input value={curForm.curriculumName} onChange={e => setCurForm(p => ({ ...p, curriculumName: e.target.value }))} placeholder="e.g. BSc IT" className={inp}/></F>
        <F label="Version" required><input value={curForm.version} onChange={e => setCurForm(p => ({ ...p, version: e.target.value }))} placeholder="v1.0" className={inp}/></F>
        <F label="Program" required><select value={curForm.programId} onChange={e => setCurForm(p => ({ ...p, programId: e.target.value }))} className={sel}><option value="">Select…</option>{programs.map(p => <option key={p.programId} value={p.programId}>{p.programName}</option>)}</select></F>
        <F label="Created Year" required><input type="number" min={2023} value={curForm.createdYear} onChange={e => setCurForm(p => ({ ...p, createdYear: e.target.value }))} className={inp}/></F>
        <F label="Status" required><select value={curForm.status} onChange={e => setCurForm(p => ({ ...p, status: e.target.value }))} className={sel}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></F>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setCurModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
          <button onClick={saveCurriculum} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button>
        </div>
      </Modal>

      {/* Batch modal */}
      <Modal open={!!batModal} onClose={() => setBatModal(null)} title={batModal?.mode === "add" ? "Add Batch" : "Edit Batch"} isDark={isDark}>
        <F label="Batch Name" required><input value={batForm.batchName} onChange={e => setBatForm(p => ({ ...p, batchName: e.target.value }))} placeholder="e.g. 2023JUNE" className={inp}/></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Intake Year" required><input type="number" min={2000} value={batForm.intakeYear} onChange={e => setBatForm(p => ({ ...p, intakeYear: e.target.value }))} className={inp}/></F>
          <F label="Intake Month" required><select value={batForm.intakeMonth} onChange={e => setBatForm(p => ({ ...p, intakeMonth: e.target.value }))} className={sel}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></F>
        </div>
        <F label="Curriculum" required><select value={batForm.curriculumId} onChange={e => setBatForm(p => ({ ...p, curriculumId: e.target.value }))} className={sel}><option value="">Select…</option>{curricula.map(c => <option key={c.curriculumId} value={c.curriculumId}>{c.curriculumName} {c.version}</option>)}</select></F>
        <F label="Status" required><select value={batForm.status} onChange={e => setBatForm(p => ({ ...p, status: e.target.value }))} className={sel}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></F>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setBatModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
          <button onClick={saveBatch} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button>
        </div>
      </Modal>

      {/* Semester modal */}
      <Modal open={!!semModal} onClose={() => setSemModal(null)} title={semModal?.mode === "add" ? "Add Semester" : "Edit Semester"} isDark={isDark}>
        <div className="grid grid-cols-2 gap-3">
          <F label="Year Number" required><input type="number" min={1} value={semForm.yearNumber} onChange={e => setSemForm(p => ({ ...p, yearNumber: e.target.value }))} className={inp}/></F>
          <F label="Semester Number" required><input type="number" min={1} value={semForm.semesterNumber} onChange={e => setSemForm(p => ({ ...p, semesterNumber: e.target.value }))} className={inp}/></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Start Date" required><input type="date" value={semForm.startDate} onChange={e => setSemForm(p => ({ ...p, startDate: e.target.value }))} className={inp}/></F>
          <F label="End Date" required><input type="date" value={semForm.endDate} onChange={e => setSemForm(p => ({ ...p, endDate: e.target.value }))} className={inp}/></F>
        </div>
        <F label="Batch" required><select value={semForm.batchId} onChange={e => setSemForm(p => ({ ...p, batchId: e.target.value }))} className={sel}><option value="">Select…</option>{batches.map(b => <option key={b.batchId} value={b.batchId}>{b.batchName}</option>)}</select></F>
        <F label="Status" required><select value={semForm.status} onChange={e => setSemForm(p => ({ ...p, status: e.target.value }))} className={sel}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></F>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setSemModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
          <button onClick={saveSemester} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button>
        </div>
      </Modal>

      {/* Subject modal */}
      <Modal open={!!subModal} onClose={() => setSubModal(null)} title={subModal?.mode === "add" ? "Add Subject" : "Edit Subject"} isDark={isDark}>
        <div className="grid grid-cols-2 gap-3">
          <F label="Subject Code" required><input value={subForm.subjectCode} onChange={e => setSubForm(p => ({ ...p, subjectCode: e.target.value }))} placeholder="IT101" className={inp}/></F>
          <F label="Credits" required><input type="number" min={0} value={subForm.credits} onChange={e => setSubForm(p => ({ ...p, credits: e.target.value }))} className={inp}/></F>
        </div>
        <F label="Subject Name" required><input value={subForm.subjectName} onChange={e => setSubForm(p => ({ ...p, subjectName: e.target.value }))} placeholder="e.g. Introduction to IT" className={inp}/></F>
        <F label="Curriculum" required><select value={subForm.curriculumId} onChange={e => setSubForm(p => ({ ...p, curriculumId: e.target.value }))} className={sel}><option value="">Select…</option>{curricula.map(c => <option key={c.curriculumId} value={c.curriculumId}>{c.curriculumName} {c.version}</option>)}</select></F>
        <F label="Semester" required><select value={subForm.semesterId} onChange={e => setSubForm(p => ({ ...p, semesterId: e.target.value }))} className={sel}><option value="">Select…</option>{semesters.map(s => <option key={s.semesterId} value={s.semesterId}>Year {s.yearNumber} Sem {s.semesterNumber}</option>)}</select></F>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setSubModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
          <button onClick={saveSubject} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button>
        </div>
      </Modal>

      {/* ════════ CONFIRM DELETES ════════ */}
      <ConfirmModal isDark={isDark} open={saveConfirm}    onClose={() => setSaveConfirm(false)}    onConfirm={doSave}                        title="Save Changes?"    message="Update campus details?"                      confirmLabel="Yes, Save"/>
      <ConfirmModal isDark={isDark} open={!!facConfirm}   onClose={() => setFacConfirm(null)}       onConfirm={() => doDeleteFaculty(facConfirm)}   title="Delete Faculty"   message="This will delete the faculty and its data."  confirmLabel="Yes, Delete" variant="danger"/>
      <ConfirmModal isDark={isDark} open={!!progConfirm}  onClose={() => setProgConfirm(null)}      onConfirm={() => doDeleteProgram(progConfirm)}  title="Delete Program"   message="This will delete the program and its data."  confirmLabel="Yes, Delete" variant="danger"/>
      <ConfirmModal isDark={isDark} open={!!curConfirm}   onClose={() => setCurConfirm(null)}       onConfirm={() => doDeleteCurriculum(curConfirm)} title="Delete Curriculum" message="This will delete the curriculum."            confirmLabel="Yes, Delete" variant="danger"/>
      <ConfirmModal isDark={isDark} open={!!batConfirm}   onClose={() => setBatConfirm(null)}       onConfirm={() => doDeleteBatch(batConfirm)}      title="Delete Batch"     message="This will delete the batch."               confirmLabel="Yes, Delete" variant="danger"/>
      <ConfirmModal isDark={isDark} open={!!semConfirm}   onClose={() => setSemConfirm(null)}       onConfirm={() => doDeleteSemester(semConfirm)}   title="Delete Semester"  message="This will delete the semester."            confirmLabel="Yes, Delete" variant="danger"/>
      <ConfirmModal isDark={isDark} open={!!subConfirm}   onClose={() => setSubConfirm(null)}       onConfirm={() => doDeleteSubject(subConfirm)}    title="Delete Subject"   message="This will delete the subject."             confirmLabel="Yes, Delete" variant="danger"/>
    </div>
  );
};

export default SectionEntities;