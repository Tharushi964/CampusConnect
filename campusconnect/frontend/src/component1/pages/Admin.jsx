/**
 * Admin.jsx — CampusConnect Admin Portal
 * Theme-aware: dark + light modes with high-contrast, clearly readable content
 * Required: npm install jspdf jspdf-autotable
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import NotificationBanner from "../../components/NotificationBanner";
import Sidebar from "../components/SideBar";
import SectionUsers from "./SectionUsers";
import SectionRequests from "./SectionRequests";
import SectionBatchReps from "./SectionBatchReps";
import myImage from "../../assets/sliit_logo.png";
import sliitBg from "../../assets/sliit.jpg";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  LayoutDashboard, Users, ClipboardList, BookOpen, UserCheck,
  Bell, BarChart2, Settings, ScrollText, Building2, Sun, Moon,
  X, ChevronRight, ChevronDown, Plus, Pencil, Trash2,
  CheckCircle, XCircle, Download, Shield, MapPin, Phone,
  Mail, Globe, GraduationCap, Layers, ChevronLeft,
  Search, ToggleRight, ToggleLeft, LogOut, Loader2, AlertCircle,
  Home, Briefcase, BookMarked, UsersRound,
  MessageSquare, Clock, Filter, Lock, Key, UserCog,
  AlertTriangle, Info, Building, Upload,
  FileText, Activity, Send, Users2, Camera, User,
  Smartphone, AtSign, ShieldCheck, Edit3,
} from "lucide-react";

const SIDEBAR_GROUPS = [
  { id:"overview",   label:"Overview",   icon:Home,       children:[{ id:"dashboard",    label:"Dashboard",    icon:LayoutDashboard }] },
  { id:"people",     label:"People",     icon:UsersRound, children:[{ id:"users",         label:"Users",         icon:Users },{ id:"batchreps",label:"Batch Reps",icon:UserCheck }] },
  { id:"academic",   label:"Academic",   icon:BookMarked, children:[{ id:"entities",      label:"Entities",      icon:Building2 }] },
  { id:"operations", label:"Operations", icon:Briefcase,  children:[{ id:"requests",      label:"Requests",      icon:ClipboardList,badge:true },{ id:"notifications",label:"Notifications",icon:Bell }] },
  { id:"analytics",  label:"Analytics",  icon:BarChart2,  children:[{ id:"reports",       label:"Reports",       icon:BarChart2 },{ id:"settings",label:"Settings",icon:Settings },{ id:"logs",label:"Logs",icon:ScrollText }] },
];

const INITIAL_FACULTIES = ["Computing","Business","Engineering","Humanities"];
const INITIAL_PROGRAMS  = [
  { name:"Software Engineering",   faculty:"Computing",   duration:"4 yrs" },
  { name:"Data Science",           faculty:"Computing",   duration:"4 yrs" },
  { name:"Cyber Security",         faculty:"Computing",   duration:"4 yrs" },
  { name:"Business Admin",         faculty:"Business",    duration:"3 yrs" },
  { name:"Electrical Engineering", faculty:"Engineering", duration:"4 yrs" },
  { name:"Media Studies",          faculty:"Humanities",  duration:"3 yrs" },
];
const PROG_TO_FAC = {
  "Software Engineering":"Computing","Data Science":"Computing","Cyber Security":"Computing",
  "Business Admin":"Business","Electrical Engineering":"Engineering","Media Studies":"Humanities",
};
const PROGRAM_NAMES = INITIAL_PROGRAMS.map(p => p.name);

const SEED_USERS = [
  { id:1,  name:"Rehan Peter",     username:"rehan",    email:"rehan@my.sliit.lk",    role:"Student",   faculty:"Computing",   program:"Software Engineering", batch:"IT2023", active:true  },
  { id:2,  name:"Amaya Silva",     username:"amaya",    email:"amaya@my.sliit.lk",    role:"Batch Rep", faculty:"Computing",   program:"Data Science",         batch:"IT2022", active:true  },
  { id:3,  name:"Kasun Perera",    username:"kasun",    email:"kasun@my.sliit.lk",    role:"Student",   faculty:"Engineering", program:"Electrical Engineering",batch:"SE2023", active:false },
  { id:4,  name:"Sachini Wijes",   username:"sachini",  email:"sachini@my.sliit.lk",  role:"Admin",     faculty:"Computing",   program:"Cyber Security",        batch:"—",      active:true  },
  { id:5,  name:"Tharindu M.",     username:"tharindu", email:"tharindu@my.sliit.lk", role:"Student",   faculty:"Business",    program:"Business Admin",        batch:"BA2023", active:true  },
  { id:6,  name:"Nimal Fernando",  username:"nimal",    email:"nimal@my.sliit.lk",    role:"Student",   faculty:"Computing",   program:"Data Science",          batch:"IT2022", active:false },
  { id:7,  name:"Priya Jayantha",  username:"priya",    email:"priya@my.sliit.lk",    role:"Batch Rep", faculty:"Engineering", program:"Electrical Engineering", batch:"SE2022", active:true  },
  { id:8,  name:"Dinusha Ratna",   username:"dinusha",  email:"dinusha@my.sliit.lk",  role:"Student",   faculty:"Humanities",  program:"Media Studies",         batch:"HS2023", active:true  },
  { id:9,  name:"Chamali Perera",  username:"chamali",  email:"chamali@my.sliit.lk",  role:"Student",   faculty:"Business",    program:"Business Admin",        batch:"BA2022", active:true  },
  { id:10, name:"Isuru Bandara",   username:"isuru",    email:"isuru@my.sliit.lk",    role:"Student",   faculty:"Computing",   program:"Software Engineering",  batch:"IT2023", active:false },
];
const SEED_REPS = [
  { id:1, name:"Amaya Silva",    email:"amaya@my.sliit.lk",    faculty:"Computing",   program:"Data Science",          batch:"IT2022", since:"2024-01", active:true  },
  { id:2, name:"Priya Jayantha", email:"priya@my.sliit.lk",    faculty:"Engineering", program:"Electrical Engineering", batch:"SE2022", since:"2023-06", active:true  },
  { id:3, name:"Ravi Kumara",    email:"ravi@my.sliit.lk",     faculty:"Business",    program:"Business Admin",        batch:"BA2021", since:"2023-01", active:false },
  { id:4, name:"Dilan Perera",   email:"dilan@my.sliit.lk",    faculty:"Computing",   program:"Software Engineering",  batch:"IT2023", since:"2024-06", active:true  },
];
const SEED_REQUESTS = [
  { id:1, type:"Batch Rep Registration", from:"Rehan Peter",    batch:"IT2023", faculty:"Computing",   date:"2025-03-14", status:"PENDING",  comment:"" },
  { id:2, type:"Batch Rep Change",       from:"Amaya Silva",    batch:"IT2022", faculty:"Computing",   date:"2025-03-08", status:"APPROVED", comment:"Approved by admin." },
  { id:3, type:"Student Request",        from:"Kasun Perera",   batch:"SE2023", faculty:"Engineering", date:"2025-03-12", status:"REJECTED", comment:"Duplicate request." },
  { id:4, type:"Batch Rep Registration", from:"Sachini Wijes",  batch:"IT2021", faculty:"Computing",   date:"2025-03-14", status:"PENDING",  comment:"" },
  { id:5, type:"Batch Rep Change",       from:"Tharindu M.",    batch:"BA2023", faculty:"Business",    date:"2025-03-10", status:"REJECTED", comment:"Not eligible." },
  { id:6, type:"Student Request",        from:"Nimal Fernando", batch:"IT2022", faculty:"Computing",   date:"2025-03-09", status:"DELETED",  comment:"Spam." },
];
const SEED_LOGS = [
  { id:1,  action:"User Created",         admin:"superadmin", target:"rehan",        time:"2025-03-14 09:12", category:"User",     severity:"info"    },
  { id:2,  action:"Request Approved",     admin:"superadmin", target:"Request #2",   time:"2025-03-13 14:30", category:"Request",  severity:"success" },
  { id:3,  action:"Program Deleted",      admin:"superadmin", target:"BBA 2019",     time:"2025-03-12 11:05", category:"Academic", severity:"warning" },
  { id:4,  action:"User Deactivated",     admin:"superadmin", target:"kasun",        time:"2025-03-11 16:44", category:"User",     severity:"warning" },
  { id:5,  action:"Campus Updated",       admin:"superadmin", target:"Malabe",       time:"2025-03-10 08:20", category:"System",   severity:"info"    },
  { id:6,  action:"Failed Login Attempt", admin:"unknown",    target:"admin panel",  time:"2025-03-09 22:11", category:"Security", severity:"danger"  },
  { id:7,  action:"Notification Sent",    admin:"superadmin", target:"IT2023 Batch", time:"2025-03-09 10:00", category:"Notif",    severity:"info"    },
  { id:8,  action:"Report Exported",      admin:"superadmin", target:"User Report",  time:"2025-03-08 15:45", category:"Report",   severity:"success" },
  { id:9,  action:"Settings Updated",     admin:"superadmin", target:"Permissions",  time:"2025-03-07 09:30", category:"System",   severity:"info"    },
  { id:10, action:"Batch Created",        admin:"superadmin", target:"IT2025",       time:"2025-03-06 11:20", category:"Academic", severity:"success" },
];
const SEED_BATCHES = ["IT2022","IT2023","CS2022","CS2023","SE2022","SE2023","BA2022","BA2023","HS2023"];

// ═══════════════════════════════════════════════════════════════════
// THEME TOKENS — HIGH CONTRAST, CLEARLY READABLE
// ═══════════════════════════════════════════════════════════════════
const T = (isDark) => ({
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

const getColor = (isDark, key) => isDark ? SC[key] : SCL[key];

// ─── Badge colors — always readable on light bg ───────────────────
const StatusBadge = ({ status }) => {
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

const RequestTypeBadge = ({ type }) => {
  const map = {
    "Batch Rep Registration":"bg-blue-100 text-blue-800 border-blue-300",
    "Batch Rep Change":"bg-purple-100 text-purple-800 border-purple-300",
    "Student Request":"bg-teal-100 text-teal-800 border-teal-300",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[type]??"bg-slate-100 text-slate-600 border-slate-200"}`}>{type}</span>;
};

const StatCard = ({ label, value, icon:Icon, colorKey, sub, isDark }) => {
  const c = getColor(isDark, colorKey);
  const t = T(isDark);
  return (
    <div className={`rounded-2xl p-5 border flex items-center gap-4 shadow-sm ${t.cardBg} ${c.border}`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
        <Icon size={22} className={c.iconText}/>
      </div>
      <div>
        <p className={`text-xs font-semibold ${t.textMuted}`}>{label}</p>
        <p className={`text-2xl font-black ${c.value}`}>{value}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>{sub}</p>}
      </div>
    </div>
  );
};

const ThemedSearch = ({ value, onChange, placeholder, isDark }) => {
  const t = T(isDark);
  return (
    <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm w-64 ${t.searchBg}`}>
      <Search size={14} className={t.textMuted+" shrink-0"}/>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="bg-transparent text-sm focus:outline-none flex-1"/>
    </div>
  );
};

const ThemedSelect = ({ value, onChange, options, placeholder="Select…", isDark }) => {
  const t = T(isDark);
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)}
        className={`appearance-none border text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 shadow-sm cursor-pointer font-medium ${t.selectBg}`}>
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`}/>
    </div>
  );
};

const ThemedModal = ({ open, onClose, title, children, wide=false, isDark }) => {
  const t = T(isDark);
  useEffect(()=>{ if(!open)return; const h=(e)=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[open,onClose]);
  if(!open)return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`pointer-events-auto w-full ${wide?"max-w-2xl":"max-w-lg"} ${t.modalBg} rounded-2xl shadow-2xl overflow-hidden border`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${t.modalHeader}`}>
            <p className={`font-bold text-sm ${t.textPrimary}`}>{title}</p>
            <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${t.modalClose}`}><X size={16}/></button>
          </div>
          <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
};

const ThemedField = ({ label, name, value, onChange, type="text", options, required=false, placeholder="", isDark }) => {
  const t = T(isDark);
  return (
    <div className="mb-4">
      <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
        {label}{required&&<span className="text-red-400 ml-0.5">*</span>}
      </label>
      {options ? (
        <select name={name} value={value} onChange={onChange} required={required}
          className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}>
          <option value="">Select…</option>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
          className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}/>
      )}
    </div>
  );
};

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel="Confirm", variant="primary", isDark }) => {
  if(!open)return null;
  const t = T(isDark);
  const btnCls = variant==="danger"?"bg-red-500 hover:bg-red-600 text-white":variant==="success"?"bg-emerald-500 hover:bg-emerald-600 text-white":"bg-[#5478FF] hover:bg-[#4060ee] text-white";
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"/>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className={`w-full max-w-sm ${t.confirmBg} rounded-2xl shadow-2xl border ${t.cardBorder} overflow-hidden`}>
          <div className="px-6 pt-6 pb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 ${variant==="danger"?"bg-red-100":"bg-blue-100"}`}>
              {variant==="danger"?<AlertTriangle size={22} className="text-red-600"/>:<Info size={22} className="text-blue-600"/>}
            </div>
            <h3 className={`font-bold text-base text-center ${t.textPrimary}`}>{title}</h3>
            <p className={`text-sm text-center mt-1 ${t.textSecondary}`}>{message}</p>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
            <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${btnCls}`}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </>
  );
};

const ToastPopup = ({ show, message, type="success", onClose }) => {
  useEffect(()=>{ if(show){ const t=setTimeout(onClose,3500); return()=>clearTimeout(t); } },[show,onClose]);
  if(!show)return null;
  const styles = { success:"bg-emerald-600",error:"bg-red-600",info:"bg-[#5478FF]",warning:"bg-amber-500" };
  const icons  = { success:<CheckCircle size={16}/>,error:<XCircle size={16}/>,info:<Info size={16}/>,warning:<AlertTriangle size={16}/> };
  return (
    <div className={`fixed top-5 right-5 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white ${styles[type]}`}>
      {icons[type]}<span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14}/></button>
    </div>
  );
};

const DARK_THEME_DIALOG = { statBg:"bg-[#111B3D]", border:"border-[#2B3E7A]", statText:"text-sky-300", cardBg:"bg-[#0B1230]" };

// ─── Role badge — always readable ────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    Admin:      "bg-purple-100 text-purple-800 border-purple-300",
    "Batch Rep":"bg-amber-100 text-amber-800 border-amber-300",
    Student:    "bg-sky-100 text-sky-800 border-sky-300",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[role]??"bg-slate-100 text-slate-600 border-slate-300"}`}>{role}</span>;
};

// ─── PDF export utilities (unchanged) ────────────────────────────
const addPDFHeader = (doc, reportTitle, subtitle="") => {
  const pageW=doc.internal.pageSize.getWidth();
  doc.setFillColor(84,120,255);doc.rect(0,0,pageW,38,"F");
  doc.setFont("helvetica","bold");doc.setFontSize(18);doc.setTextColor(255,255,255);
  doc.text("CampusConnect",14,16);
  doc.setFontSize(9);doc.setFont("helvetica","normal");
  doc.text("Sri Lanka Institute of Information Technology",14,24);
  doc.text("www.sliit.lk  ·  info@sliit.lk",14,30);
  doc.setFontSize(11);doc.setFont("helvetica","bold");
  doc.text(reportTitle,pageW-14,16,{align:"right"});
  doc.setFontSize(8);doc.setFont("helvetica","normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`,pageW-14,24,{align:"right"});
  if(subtitle)doc.text(subtitle,pageW-14,30,{align:"right"});
  doc.setDrawColor(200,210,255);doc.line(14,44,pageW-14,44);
  doc.setTextColor(30,30,30);return 50;
};
const addPDFFooter=(doc)=>{const n=doc.internal.getNumberOfPages(),pageW=doc.internal.pageSize.getWidth(),pageH=doc.internal.pageSize.getHeight();doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(150,150,150);for(let i=1;i<=n;i++){doc.setPage(i);doc.text(`CampusConnect Admin Portal  ·  Page ${i} of ${n}`,pageW/2,pageH-8,{align:"center"});}};
const TABLE_STYLES={headStyles:{fillColor:[84,120,255],textColor:255,fontStyle:"bold",fontSize:8},bodyStyles:{fontSize:8,textColor:[50,50,50]},alternateRowStyles:{fillColor:[245,247,255]},margin:{left:14,right:14},styles:{cellPadding:3}};
const downloadBlob=(blob,filename)=>{const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.setAttribute("download",filename);document.body.appendChild(link);link.click();document.body.removeChild(link);URL.revokeObjectURL(url);};
const exportCSV=(headers,rows,filename)=>{const esc=(v)=>`"${String(v??"").replace(/"/g,'""')}"`;const content=[headers.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\n");downloadBlob(new Blob([content],{type:"text/csv;charset=utf-8;"}),filename);};
const generateUserReport=()=>{const doc=new jsPDF();const y=addPDFHeader(doc,"User Report",`Total: ${SEED_USERS.length}`);autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Name","Username","Email","Role","Faculty","Program","Batch","Status"]],body:SEED_USERS.map(u=>[u.id,u.name,`@${u.username}`,u.email,u.role,u.faculty,u.program,u.batch,u.active?"ACTIVE":"INACTIVE"])});addPDFFooter(doc);doc.save(`CampusConnect_User_Report_${new Date().toISOString().split("T")[0]}.pdf`);};
const generateBatchReport=()=>{const doc=new jsPDF();const y=addPDFHeader(doc,"Batch-wise Report",`Batches: ${SEED_BATCHES.length}`);autoTable(doc,{...TABLE_STYLES,startY:y,head:[["Batch","Total","Active","Inactive","Batch Rep(s)"]],body:SEED_BATCHES.map(b=>{const m=SEED_USERS.filter(u=>u.batch===b),r=SEED_REPS.filter(r=>r.batch===b);return[b,m.length,m.filter(u=>u.active).length,m.filter(u=>!u.active).length,r.map(r=>r.name).join(", ")||"—"];})});addPDFFooter(doc);doc.save(`CampusConnect_Batch_Report_${new Date().toISOString().split("T")[0]}.pdf`);};
const generateRequestReport=()=>{const doc=new jsPDF({orientation:"landscape"});const y=addPDFHeader(doc,"Request Report",`Total: ${SEED_REQUESTS.length}`);autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Type","From","Batch","Faculty","Date","Status","Comment"]],body:SEED_REQUESTS.map(r=>[r.id,r.type,r.from,r.batch,r.faculty,r.date,r.status,r.comment||"—"])});addPDFFooter(doc);doc.save(`CampusConnect_Request_Report_${new Date().toISOString().split("T")[0]}.pdf`);};
const generateRepReport=()=>{const doc=new jsPDF();const y=addPDFHeader(doc,"Batch Rep Report",`Total: ${SEED_REPS.length}`);autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Name","Email","Faculty","Program","Batch","Since","Status"]],body:SEED_REPS.map((r,i)=>[i+1,r.name,r.email,r.faculty,r.program,r.batch,r.since,r.active?"ACTIVE":"INACTIVE"])});addPDFFooter(doc);doc.save(`CampusConnect_BatchRep_Report_${new Date().toISOString().split("T")[0]}.pdf`);};
const generateFacultyReport=()=>{const doc=new jsPDF();const y=addPDFHeader(doc,"Faculty Report",`Faculties: ${INITIAL_FACULTIES.length}`);autoTable(doc,{...TABLE_STYLES,startY:y,head:[["Faculty","Programs","Total","Active","Inactive","Program List"]],body:INITIAL_FACULTIES.map(f=>{const p=INITIAL_PROGRAMS.filter(p=>p.faculty===f),s=SEED_USERS.filter(u=>u.faculty===f);return[f,p.length,s.length,s.filter(u=>u.active).length,s.filter(u=>!u.active).length,p.map(p=>p.name).join(", ")];})});addPDFFooter(doc);doc.save(`CampusConnect_Faculty_Report_${new Date().toISOString().split("T")[0]}.pdf`);};
const generateNotifReport=(sentList)=>{const doc=new jsPDF({orientation:"landscape"});const y=addPDFHeader(doc,"Notification Report",`Sent: ${sentList.length}`);autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Title","Type","Target","Batch","Date","Preview"]],body:sentList.map((n,i)=>[i+1,n.title,n.type,n.target,n.batch||"—",n.date,n.message?.slice(0,60)+"…"])});addPDFFooter(doc);doc.save(`CampusConnect_Notification_Report_${new Date().toISOString().split("T")[0]}.pdf`);};
const generateAllReportsPDF=(sentList)=>{const doc=new jsPDF();let y=addPDFHeader(doc,"Complete System Report");doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(84,120,255);doc.text("1. User Report",14,y);y+=4;autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Name","Role","Faculty","Program","Batch","Status"]],body:SEED_USERS.map(u=>[u.id,u.name,u.role,u.faculty,u.program,u.batch,u.active?"ACTIVE":"INACTIVE"])});doc.addPage();y=addPDFHeader(doc,"Complete System Report (cont.)");doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(84,120,255);doc.text("2. Request Report",14,y);y+=4;autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Type","From","Batch","Faculty","Date","Status"]],body:SEED_REQUESTS.map(r=>[r.id,r.type,r.from,r.batch,r.faculty,r.date,r.status])});doc.addPage();y=addPDFHeader(doc,"Complete System Report (cont.)");doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(84,120,255);doc.text("3. Batch Rep Report",14,y);y+=4;autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Name","Email","Faculty","Program","Batch","Status"]],body:SEED_REPS.map((r,i)=>[i+1,r.name,r.email,r.faculty,r.program,r.batch,r.active?"ACTIVE":"INACTIVE"])});addPDFFooter(doc);doc.save(`CampusConnect_Complete_Report_${new Date().toISOString().split("T")[0]}.pdf`);};
const exportUserCSV=()=>exportCSV(["ID","Name","Username","Email","Role","Faculty","Program","Batch","Status"],SEED_USERS.map(u=>[u.id,u.name,u.username,u.email,u.role,u.faculty,u.program,u.batch,u.active?"ACTIVE":"INACTIVE"]),`CampusConnect_Users_${new Date().toISOString().split("T")[0]}.csv`);
const exportBatchCSV=()=>exportCSV(["Batch","Total","Active","Inactive"],SEED_BATCHES.map(b=>{const m=SEED_USERS.filter(u=>u.batch===b);return[b,m.length,m.filter(u=>u.active).length,m.filter(u=>!u.active).length];}),`CampusConnect_Batches_${new Date().toISOString().split("T")[0]}.csv`);
const exportRequestCSV=()=>exportCSV(["ID","Type","From","Batch","Faculty","Date","Status","Comment"],SEED_REQUESTS.map(r=>[r.id,r.type,r.from,r.batch,r.faculty,r.date,r.status,r.comment]),`CampusConnect_Requests_${new Date().toISOString().split("T")[0]}.csv`);
const exportRepCSV=()=>exportCSV(["ID","Name","Email","Faculty","Program","Batch","Since","Status"],SEED_REPS.map((r,i)=>[i+1,r.name,r.email,r.faculty,r.program,r.batch,r.since,r.active?"ACTIVE":"INACTIVE"]),`CampusConnect_BatchReps_${new Date().toISOString().split("T")[0]}.csv`);
const exportFacultyCSV=()=>exportCSV(["Faculty","Programs","Total","Active","Inactive"],INITIAL_FACULTIES.map(f=>{const s=SEED_USERS.filter(u=>u.faculty===f);return[f,INITIAL_PROGRAMS.filter(p=>p.faculty===f).length,s.length,s.filter(u=>u.active).length,s.filter(u=>!u.active).length];}),`CampusConnect_Faculties_${new Date().toISOString().split("T")[0]}.csv`);
const exportLogsPDF=(filteredLogs)=>{const doc=new jsPDF({orientation:"landscape"});const y=addPDFHeader(doc,"Activity Logs Report",`Entries: ${filteredLogs.length}`);autoTable(doc,{...TABLE_STYLES,startY:y,head:[["#","Severity","Category","Action","Admin","Target","Timestamp"]],body:filteredLogs.map(l=>[`#${l.id}`,l.severity.toUpperCase(),l.category,l.action,l.admin,l.target,l.time])});addPDFFooter(doc);doc.save(`CampusConnect_Activity_Logs_${new Date().toISOString().split("T")[0]}.pdf`);};
const exportLogsCSV=(filteredLogs)=>exportCSV(["ID","Severity","Category","Action","Admin","Target","Timestamp"],filteredLogs.map(l=>[l.id,l.severity.toUpperCase(),l.category,l.action,l.admin,l.target,l.time]),`CampusConnect_Activity_Logs_${new Date().toISOString().split("T")[0]}.csv`);

// ═══════════════════════════════════════════════════════════════════
// SECTION: USERS
// ═══════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════
// SECTION: BATCH REPS
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// SECTION: REQUESTS
// ═══════════════════════════════════════════════════════════════════
const STATUS_FLOW={PENDING:{next:["APPROVED","REJECTED"]},APPROVED:{next:[]},REJECTED:{next:["DELETED"]},DELETED:{next:[]}};


// ═══════════════════════════════════════════════════════════════════
// SECTION: ENTITIES
// ═══════════════════════════════════════════════════════════════════
const SectionEntities = ({ notify, isDark }) => {
  const t=T(isDark);
  const logoInputRef=useRef(null);
  const[editing,setEditing]=useState(false);
  const[logoSrc,setLogoSrc]=useState(null);
  const[campus,setCampus]=useState({name:"Sri Lanka Institute of Information Technology",shortName:"SLIIT",established:"1999",type:"Non-state Degree-Awarding Institute",address:"New Kandy Rd, Malabe 10115, Sri Lanka",phone:"+94 11 754 4801",fax:"+94 11 754 4802",email:"info@sliit.lk",web:"www.sliit.lk",students:"16,000+",staff:"800+",accreditation:"UGC Approved",vision:"To be the leading technological university in Sri Lanka."});
  const[draft,setDraft]=useState({...campus});
  const[saveConfirm,setSaveConfirm]=useState(false);
  const[toast,setToast]=useState({show:false,message:"",type:"success"});
  const showToast=(msg,type="success")=>setToast({show:true,message:msg,type});
  const hd=(e)=>setDraft(p=>({...p,[e.target.name]:e.target.value}));
  const doSave=()=>{setCampus({...draft});setEditing(false);setSaveConfirm(false);showToast("Campus details updated!");};
  const handleLogoChange=(e)=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=(ev)=>setLogoSrc(ev.target.result);r.readAsDataURL(file);};
  const[faculties,setFaculties]=useState(INITIAL_FACULTIES);const[facModal,setFacModal]=useState(null);const[facForm,setFacForm]=useState("");const[facConfirm,setFacConfirm]=useState(null);
  const saveFaculty=()=>{if(!facForm.trim())return;if(facModal.mode==="add")setFaculties(p=>[...p,facForm.trim()]);else setFaculties(p=>p.map((f,i)=>i===facModal.idx?facForm.trim():f));showToast(`Faculty ${facModal.mode==="add"?"added":"updated"}!`);setFacModal(null);setFacForm("");};
  const deleteFaculty=(idx)=>{setFaculties(p=>p.filter((_,i)=>i!==idx));showToast("Faculty deleted.","info");setFacConfirm(null);};
  const[programs,setPrograms]=useState(INITIAL_PROGRAMS);const[progModal,setProgModal]=useState(null);const[progForm,setProgForm]=useState({name:"",faculty:"Computing",duration:"4 yrs"});const[progConfirm,setProgConfirm]=useState(null);
  const hp=(e)=>setProgForm(p=>({...p,[e.target.name]:e.target.value}));
  const saveProgram=()=>{if(!progForm.name.trim())return;if(progModal.mode==="add")setPrograms(p=>[...p,{...progForm}]);else setPrograms(p=>p.map((pr,i)=>i===progModal.idx?{...progForm}:pr));showToast(`Program ${progModal.mode==="add"?"added":"updated"}!`);setProgModal(null);};
  const deleteProgram=(idx)=>{setPrograms(p=>p.filter((_,i)=>i!==idx));showToast("Program deleted.","info");setProgConfirm(null);};
  const EntityModal=({open,onClose,title,children})=>{useEffect(()=>{if(!open)return;const h=(e)=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[open,onClose]);if(!open)return null;return(<><div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}/><div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"><div className={`pointer-events-auto w-full max-w-md ${t.modalBg} rounded-2xl shadow-2xl overflow-hidden border`}><div className={`flex items-center justify-between px-5 py-4 border-b ${t.modalHeader}`}><p className={`font-bold text-sm ${t.textPrimary}`}>{title}</p><button onClick={onClose} className={`p-1 rounded-lg ${t.modalClose}`}><X size={15}/></button></div><div className="px-5 py-4">{children}</div></div></div></>);};
  const InfoRow=({icon:Icon,label,value,cls="text-sky-500"})=>(<div className="flex items-start gap-3"><div className={`mt-0.5 shrink-0 ${cls}`}><Icon size={14}/></div><div><p className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>{label}</p><p className={`text-sm font-semibold leading-tight ${t.textPrimary}`}>{value}</p></div></div>);
  const CampusField=({label,name,value,onChange,textarea=false})=>(<div><label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}>{label}</label>{textarea?<textarea name={name} value={value} onChange={onChange} rows={2} className={`w-full p-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 resize-none ${t.inputBg}`}/>:<input name={name} value={value} onChange={onChange} className={`w-full p-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}/>}</div>);
  const effectiveLogo=logoSrc||myImage;
  const CHIP_COLORS=[{c:"text-sky-400 bg-sky-500/15 border-sky-500/40"},{c:"text-purple-400 bg-purple-500/15 border-purple-500/40"},{c:"text-amber-400 bg-amber-500/15 border-amber-500/40"},{c:"text-teal-400 bg-teal-500/15 border-teal-500/40"}];
  const CHIP_COLORS_L=[{c:"text-sky-700 bg-sky-50 border-sky-200"},{c:"text-purple-700 bg-purple-50 border-purple-200"},{c:"text-amber-700 bg-amber-50 border-amber-200"},{c:"text-teal-700 bg-teal-50 border-teal-200"}];
  const chips=[{label:"Students",value:campus.students},{label:"Staff",value:campus.staff},{label:"Faculties",value:faculties.length},{label:"Programs",value:programs.length}];

  return (
    <div className={`space-y-6 ${t.pageBg} min-h-screen p-6`}>
      <ToastPopup show={toast.show} message={toast.message} type={toast.type} onClose={()=>setToast(p=>({...p,show:false}))}/>
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <div className="h-28 relative bg-center bg-cover" style={{backgroundImage:`url(${sliitBg})`,backgroundPosition:"center 45%"}}>
          <div className="absolute inset-0 bg-black/40"/>
          {!editing&&<button onClick={()=>{setDraft({...campus});setEditing(true);}} className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20"><Pencil size={12}/>Edit Details</button>}
        </div>
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-end gap-4 -mt-12 mb-5">
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center"><img src={effectiveLogo} alt="SLIIT Logo" className="h-full w-full object-contain p-1" onError={e=>{e.target.onerror=null;e.target.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%235478FF' rx='12'/%3E%3Ctext x='40' y='52' font-size='22' text-anchor='middle' fill='white' font-weight='bold'%3ESL%3C/text%3E%3C/svg%3E";}}/></div>
              <button onClick={()=>logoInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="text-white text-center"><Camera size={18} className="mx-auto"/><span className="text-[9px] font-bold block mt-0.5">Change</span></div></button>
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
            {chips.map((s,i)=>{const c=isDark?CHIP_COLORS[i].c:CHIP_COLORS_L[i].c;return(<div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${c}`}><span className={`text-2xl font-black`}>{s.value}</span><span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{s.label}</span></div>);})}
          </div>
          {!editing&&(<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={MapPin}        label="Address" value={campus.address}/>
            <InfoRow icon={Phone}         label="Phone"   value={campus.phone}   cls="text-sky-500"/>
            <InfoRow icon={Mail}          label="Email"   value={campus.email}   cls="text-purple-500"/>
            <InfoRow icon={Globe}         label="Website" value={campus.web}     cls="text-teal-500"/>
            <InfoRow icon={Building2}     label="Type"    value={campus.type}    cls="text-[#5478FF]"/>
            <InfoRow icon={GraduationCap} label="Vision"  value={campus.vision}  cls="text-amber-500"/>
          </div>)}
          {editing&&(<div className={`${t.innerBg} rounded-2xl border ${t.innerBorder} p-5`}>
            <p className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${t.textMuted}`}><Edit3 size={12}/>Editing Campus Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <CampusField label="Full Name" name="name" value={draft.name} onChange={hd}/><CampusField label="Short Name" name="shortName" value={draft.shortName} onChange={hd}/>
              <CampusField label="Established" name="established" value={draft.established} onChange={hd}/><CampusField label="Inst. Type" name="type" value={draft.type} onChange={hd}/>
              <CampusField label="Phone" name="phone" value={draft.phone} onChange={hd}/><CampusField label="Fax" name="fax" value={draft.fax} onChange={hd}/>
              <CampusField label="Email" name="email" value={draft.email} onChange={hd}/><CampusField label="Website" name="web" value={draft.web} onChange={hd}/>
              <CampusField label="Students" name="students" value={draft.students} onChange={hd}/><CampusField label="Staff" name="staff" value={draft.staff} onChange={hd}/>
              <CampusField label="Accreditation" name="accreditation" value={draft.accreditation} onChange={hd}/>
            </div>
            <CampusField label="Address" name="address" value={draft.address} onChange={hd}/>
            <div className="mt-3"><CampusField label="Vision Statement" name="vision" value={draft.vision} onChange={hd} textarea/></div>
            <div className={`mt-4 p-3 ${t.cardBg} rounded-xl border ${t.cardBorder} flex items-center gap-4`}>
              <img src={effectiveLogo} alt="logo" className="h-12 w-12 object-contain rounded-xl border border-white/10 p-1"/>
              <div><p className={`text-xs font-bold mb-1 ${t.textPrimary}`}>Campus Logo</p><button onClick={()=>logoInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5478FF] text-white rounded-xl text-xs font-bold hover:bg-[#4060ee]"><Upload size={12}/>Upload</button></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={()=>setEditing(false)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
              <button onClick={()=>setSaveConfirm(true)} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee] shadow-sm">Save Changes</button>
            </div>
          </div>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.divider}`}>
            <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center"><GraduationCap size={16} className="text-amber-500"/></div><div><p className={`font-bold text-sm ${t.textPrimary}`}>Faculties</p><p className={`text-[10px] ${t.textMuted}`}>{faculties.length} registered</p></div></div>
            <button onClick={()=>{setFacForm("");setFacModal({mode:"add"});}} className="flex items-center gap-1 px-3 py-1.5 bg-[#5478FF] text-white rounded-xl text-xs font-bold hover:bg-[#4060ee] shadow-sm"><Plus size={12}/>Add</button>
          </div>
          <div className="p-4 space-y-2">
            {faculties.length===0?<p className={`text-center text-sm py-6 ${t.textMuted}`}>No faculties</p>
            :faculties.map((f,i)=>(<div key={i} className={`flex items-center justify-between px-4 py-3 ${t.innerBg} rounded-xl border ${t.innerBorder} hover:border-amber-400/50 transition-all group`}><div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"/><span className={`text-sm font-semibold ${t.textPrimary}`}>{f}</span></div><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>{setFacForm(f);setFacModal({mode:"edit",idx:i});}} className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-500/10"><Pencil size={13}/></button><button onClick={()=>setFacConfirm(i)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 size={13}/></button></div></div>))}
          </div>
        </div>
        <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${t.divider}`}>
            <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center"><BookOpen size={16} className="text-purple-500"/></div><div><p className={`font-bold text-sm ${t.textPrimary}`}>Programs</p><p className={`text-[10px] ${t.textMuted}`}>{programs.length} registered</p></div></div>
            <button onClick={()=>{setProgForm({name:"",faculty:faculties[0]??"Computing",duration:"4 yrs"});setProgModal({mode:"add"});}} className="flex items-center gap-1 px-3 py-1.5 bg-[#5478FF] text-white rounded-xl text-xs font-bold hover:bg-[#4060ee] shadow-sm"><Plus size={12}/>Add</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className={`${t.tableHead} text-[10px] uppercase tracking-wider border-b ${t.divider}`}>{["Program","Faculty","Duration","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {programs.length===0?<tr><td colSpan={4} className={`py-8 text-center text-sm ${t.textMuted}`}>No programs</td></tr>
                :programs.map((p,i)=>(<tr key={i} className={`border-t ${t.divider} ${i%2===1?t.rowAlt:""} ${t.rowHover} transition-colors group`}>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0"/><span className={`font-semibold text-xs ${t.textPrimary}`}>{p.name}</span></div></td>
                  <td className="px-4 py-2.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">{p.faculty}</span></td>
                  <td className={`px-4 py-2.5 text-xs ${t.textSecondary}`}>{p.duration}</td>
                  <td className="px-4 py-2.5"><div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={()=>{setProgForm({...p});setProgModal({mode:"edit",idx:i});}} className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-500/10"><Pencil size={12}/></button><button onClick={()=>setProgConfirm(i)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 size={12}/></button></div></td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal isDark={isDark} open={saveConfirm} onClose={()=>setSaveConfirm(false)} onConfirm={doSave} title="Save Changes?" message="Update campus details?" confirmLabel="Yes, Save"/>
      <EntityModal open={!!facModal} onClose={()=>setFacModal(null)} title={facModal?.mode==="add"?"Add Faculty":"Edit Faculty"}><div className="mb-4"><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Faculty Name *</label><input value={facForm} onChange={e=>setFacForm(e.target.value)} placeholder="e.g. Computing" className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}/></div><div className="flex justify-end gap-2"><button onClick={()=>setFacModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button><button onClick={saveFaculty} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button></div></EntityModal>
      <EntityModal open={!!progModal} onClose={()=>setProgModal(null)} title={progModal?.mode==="add"?"Add Program":"Edit Program"}><div className="mb-3"><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Program Name *</label><input name="name" value={progForm.name} onChange={hp} placeholder="e.g. Software Engineering" className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}/></div><div className="mb-3"><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Faculty *</label><select name="faculty" value={progForm.faculty} onChange={hp} className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}>{faculties.map(f=><option key={f} value={f}>{f}</option>)}</select></div><div className="mb-4"><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Duration</label><select name="duration" value={progForm.duration} onChange={hp} className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}>{["1 yr","2 yrs","3 yrs","4 yrs","5 yrs"].map(d=><option key={d} value={d}>{d}</option>)}</select></div><div className="flex justify-end gap-2"><button onClick={()=>setProgModal(null)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button><button onClick={saveProgram} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save</button></div></EntityModal>
      <ConfirmModal isDark={isDark} open={facConfirm!==null} onClose={()=>setFacConfirm(null)} onConfirm={()=>deleteFaculty(facConfirm)} title="Delete Faculty" message={`Delete "${faculties[facConfirm]}"?`} confirmLabel="Yes, Delete" variant="danger"/>
      <ConfirmModal isDark={isDark} open={progConfirm!==null} onClose={()=>setProgConfirm(null)} onConfirm={()=>deleteProgram(progConfirm)} title="Delete Program" message={`Delete "${programs[progConfirm]?.name}"?`} confirmLabel="Yes, Delete" variant="danger"/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION: NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════
const SectionNotifications = ({ notify, isDark }) => {
  const t=T(isDark);
  const[sentList,setSentList]=useState([
    {id:1,title:"Exam Schedule Released",message:"Final exams will begin on April 15th. Please check the portal.",type:"Push",target:"All Students",date:"2025-03-10 10:00",batch:null},
    {id:2,title:"IT2023 Assignment Deadline",message:"Reminder: Assignment 2 deadline is tomorrow at 11:59 PM.",type:"Email",target:"Specific Batch",date:"2025-03-08 09:30",batch:"IT2023"}
  ]);
  const[form,setForm]=useState({title:"",message:"",type:"Push",audience:"All Students",batch:""});
  const[sendConfirm,setSendConfirm]=useState(false);
  const[toast,setToast]=useState({show:false,message:"",type:"success"});
  const hc=(e)=>setForm(p=>({...p,[e.target.name]:e.target.value}));
  const showToast=(msg,type="success")=>setToast({show:true,message:msg,type});
  const attemptSend=()=>{if(!form.title||!form.message){showToast("Please fill in title and message.","warning");return;}setSendConfirm(true);};
  const doSend=()=>{setSentList(p=>[{...form,id:Date.now(),date:new Date().toLocaleString()},...p]);setSendConfirm(false);setForm({title:"",message:"",type:"Push",audience:"All Students",batch:""});showToast("Notification sent successfully!");};
  const typeIcons={Push:<Smartphone size={14}/>,SMS:<MessageSquare size={14}/>,Email:<AtSign size={14}/>};
  const typeCls={Push:"bg-sky-100 text-sky-800 border-sky-300",SMS:"bg-emerald-100 text-emerald-800 border-emerald-300",Email:"bg-purple-100 text-purple-800 border-purple-300"};
  const typeBtn=(tp)=>form.type===tp
    ? "border-[#5478FF] bg-[#5478FF]/15 text-[#5478FF] font-bold"
    : isDark ? "border-[#2B3E7A] bg-[#0B1230] text-slate-300 hover:border-[#5478FF]/50" : "border-gray-200 bg-white text-gray-600 hover:border-blue-300";
  const audienceBtn=(a)=>form.audience===a
    ? "border-[#5478FF] bg-[#5478FF]/15 text-[#5478FF] font-bold"
    : isDark ? "border-[#2B3E7A] bg-[#0B1230] text-slate-300 hover:border-[#5478FF]/50" : "border-gray-200 bg-white text-gray-600 hover:border-blue-300";

  return (
    <div className={`min-h-full ${t.pageBg} p-6 space-y-6`}>
      <ToastPopup show={toast.show} message={toast.message} type={toast.type} onClose={()=>setToast(p=>({...p,show:false}))}/>
      <div className="flex items-center justify-between">
        <div><h2 className={`text-base font-black flex items-center gap-2 ${t.textPrimary}`}><Bell size={18} className="text-[#5478FF]"/>Notifications</h2><p className={`text-xs mt-0.5 ${t.textSecondary}`}>Send announcements to students or batches</p></div>
        <div className={`text-center px-4 py-2 ${t.cardBg} rounded-xl border ${t.cardBorder}`}><p className="text-xl font-black text-[#5478FF]">{sentList.length}</p><p className={`text-[10px] font-semibold uppercase ${t.textMuted}`}>Sent</p></div>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className={`lg:col-span-2 ${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${t.divider} bg-gradient-to-r from-[#5478FF]/10 to-sky-500/10 flex items-center gap-2`}>
            <div className="h-8 w-8 rounded-xl bg-[#5478FF] flex items-center justify-center"><Send size={14} className="text-white"/></div>
            <div><p className={`font-bold text-sm ${t.textPrimary}`}>Compose Notification</p><p className={`text-[10px] ${t.textMuted}`}>Fill in the details below</p></div>
          </div>
          <div className="p-5 space-y-4">
            <div><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Title <span className="text-red-500">*</span></label><input name="title" value={form.title} onChange={hc} placeholder="e.g. Exam Schedule Released" className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}/></div>
            <div><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Message <span className="text-red-500">*</span></label><textarea name="message" value={form.message} onChange={hc} rows={4} placeholder="Write your announcement…" className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 resize-none ${t.inputBg}`}/></div>
            <div><label className={`block text-xs font-semibold mb-2 ${t.textSecondary}`}>Type</label><div className="grid grid-cols-3 gap-2">{["Push","SMS","Email"].map(tp=>(<button key={tp} onClick={()=>setForm(p=>({...p,type:tp}))} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs transition-all ${typeBtn(tp)}`}>{typeIcons[tp]}{tp}</button>))}</div></div>
            <div><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Send To</label>
              <div className="flex gap-2 mb-2">{["All Students","Specific Batch"].map(a=>(<button key={a} onClick={()=>setForm(p=>({...p,audience:a,batch:""}))} className={`flex-1 py-2 rounded-xl border text-xs transition-all ${audienceBtn(a)}`}>{a}</button>))}</div>
              {form.audience==="Specific Batch"&&<select name="batch" value={form.batch} onChange={hc} className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}><option value="">Select batch…</option>{SEED_BATCHES.map(b=><option key={b} value={b}>{b}</option>)}</select>}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={()=>setForm({title:"",message:"",type:"Push",audience:"All Students",batch:""})} className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Clear</button>
              <button onClick={attemptSend} className="flex-1 px-4 py-2.5 rounded-xl bg-[#5478FF] text-white text-sm font-bold hover:bg-[#4060ee] shadow-sm flex items-center justify-center gap-2"><Send size={14}/>Send</button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4"><h3 className={`font-bold text-sm ${t.textPrimary}`}>Sent History</h3><span className={`text-[10px] ${t.textMuted} ${t.innerBg} px-2 py-1 rounded-full border ${t.innerBorder}`}>{sentList.length} notifications</span></div>
          {sentList.length===0?(<div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-12 text-center`}><Bell size={32} className={`mx-auto mb-2 ${t.textMuted}`}/><p className={`text-sm ${t.textMuted}`}>No notifications sent yet</p></div>)
          :(<div className="space-y-3">{sentList.map(n=>(<div key={n.id} className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm p-4 hover:border-[#5478FF]/50 transition-colors`}>
            <div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap"><p className={`font-bold text-sm ${t.textPrimary}`}>{n.title}</p><span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeCls[n.type]}`}>{typeIcons[n.type]}{n.type}</span><StatusBadge status="SENT"/></div>
              <p className={`text-xs line-clamp-2 ${t.textSecondary}`}>{n.message}</p>
            </div></div>
            <div className={`flex items-center gap-3 mt-2.5 pt-2.5 border-t ${t.divider} flex-wrap`}><span className="flex items-center gap-1 text-[10px] text-sky-500 font-semibold"><Users2 size={10}/>{n.target}{n.batch?` · ${n.batch}`:""}</span><span className={`flex items-center gap-1 text-[10px] ${t.textMuted}`}><Clock size={10}/>{n.date}</span></div>
          </div>))}</div>)}
        </div>
      </div>
      <ConfirmModal isDark={isDark} open={sendConfirm} onClose={()=>setSendConfirm(false)} onConfirm={doSend} title="Send Notification?" message={`Send "${form.title}" to ${form.audience==="Specific Batch"?form.batch:"all students"} via ${form.type}?`} confirmLabel="Yes, Send"/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION: REPORTS
// ═══════════════════════════════════════════════════════════════════
const SectionReports = ({ isDark }) => {
  const t=T(isDark);
  const[toast,setToast]=useState({show:false,message:"",type:"success"});
  const[generating,setGenerating]=useState(null);
  const[sentList]=useState([{id:1,title:"Exam Schedule Released",message:"Final exams begin April 15.",type:"Push",target:"All Students",date:"2025-03-10",batch:null},{id:2,title:"IT2023 Assignment",message:"Deadline tomorrow 11:59 PM.",type:"Email",target:"Specific Batch",date:"2025-03-08",batch:"IT2023"}]);
  const showToast=(msg,type="success")=>setToast({show:true,message:msg,type});
  const REPORTS=[
    {id:"user",   label:"User Report",        desc:"All users with roles, faculty, program and status",      icon:Users,        colorKey:"blue",  stat:`${SEED_USERS.length} users`,    onPDF:generateUserReport,    onCSV:exportUserCSV},
    {id:"batch",  label:"Batch-wise Report",   desc:"Students per batch with reps and active status",         icon:Layers,       colorKey:"purple",stat:`${SEED_BATCHES.length} batches`, onPDF:generateBatchReport,   onCSV:exportBatchCSV},
    {id:"request",label:"Request Report",      desc:"All requests with approval and rejection history",        icon:ClipboardList,colorKey:"amber", stat:`${SEED_REQUESTS.length} requests`,onPDF:generateRequestReport,onCSV:exportRequestCSV},
    {id:"rep",    label:"Batch Rep Report",    desc:"Active and inactive batch reps with faculty info",        icon:UserCheck,    colorKey:"teal",  stat:`${SEED_REPS.length} reps`,      onPDF:generateRepReport,     onCSV:exportRepCSV},
    {id:"faculty",label:"Faculty Report",      desc:"Faculties with student enrollment statistics",            icon:GraduationCap,colorKey:"green", stat:`${INITIAL_FACULTIES.length} faculties`,onPDF:generateFacultyReport,onCSV:exportFacultyCSV},
    {id:"notif",  label:"Notification Report", desc:"Sent notifications with type, target and delivery",      icon:Bell,         colorKey:"red",   stat:`${sentList.length} sent`,        onPDF:()=>generateNotifReport(sentList),onCSV:()=>exportCSV(["Title","Type","Target","Date"],sentList.map(n=>[n.title,n.type,n.target,n.date]),`CC_Notifs_${new Date().toISOString().split("T")[0]}.csv`)},
  ];
  const handle=async(r,fmt)=>{setGenerating(`${r.id}-${fmt}`);try{fmt==="PDF"?r.onPDF():r.onCSV();showToast(`${r.label} exported as ${fmt}!`);}catch{showToast("Export failed.","error");}finally{setTimeout(()=>setGenerating(null),800);}};
  const handleAll=async(fmt)=>{setGenerating(`all-${fmt}`);try{fmt==="PDF"?generateAllReportsPDF(sentList):(exportUserCSV(),exportBatchCSV(),exportRequestCSV(),exportRepCSV(),exportFacultyCSV());showToast(`All reports exported as ${fmt}!`);}catch{showToast("Export failed.","error");}finally{setTimeout(()=>setGenerating(null),800);}};

  return (
    <div className={`min-h-full ${t.pageBg} p-6 space-y-6`}>
      <ToastPopup show={toast.show} message={toast.message} type={toast.type} onClose={()=>setToast(p=>({...p,show:false}))}/>
      <div><h2 className={`text-base font-black flex items-center gap-2 ${t.textPrimary}`}><BarChart2 size={18} className="text-[#5478FF]"/>Reports</h2><p className={`text-xs mt-0.5 ${t.textSecondary}`}>Generate and export system reports — downloads to your device</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(r=>{const c=getColor(isDark,r.colorKey);return(
          <div key={r.id} className={`${t.cardBg} rounded-2xl border ${c.border} shadow-sm p-5 hover:shadow-lg transition-all`}>
            <div className="flex items-start gap-3 mb-4"><div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg} border ${c.border}`}><r.icon size={20} className={c.iconText}/></div><div className="flex-1 min-w-0"><p className={`font-bold text-sm ${t.textPrimary}`}>{r.label}</p><p className={`text-[10px] mt-0.5 leading-relaxed ${t.textMuted}`}>{r.desc}</p></div></div>
            <div className="flex items-center justify-between mb-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.iconBg} ${c.iconText} border ${c.border}`}>{r.stat}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>handle(r,"PDF")} disabled={!!generating} className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-400/40 bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-40">
                {generating===`${r.id}-PDF`?<Loader2 size={12} className="animate-spin"/>:<FileText size={12}/>}PDF
              </button>
              <button onClick={()=>handle(r,"CSV")} disabled={!!generating} className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-500 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-40">
                {generating===`${r.id}-CSV`?<Loader2 size={12} className="animate-spin"/>:<Download size={12}/>}CSV
              </button>
            </div>
          </div>
        );})}
      </div>
      <div className={`${t.cardBg} rounded-2xl border border-[#5478FF]/40 p-5 flex items-center gap-4 bg-gradient-to-r from-[#5478FF]/10 to-sky-500/10`}>
        <div className="h-10 w-10 rounded-xl bg-[#5478FF] flex items-center justify-center shrink-0"><Download size={18} className="text-white"/></div>
        <div className="flex-1"><p className={`font-bold text-sm ${t.textPrimary}`}>Export All Reports</p><p className={`text-xs ${t.textSecondary}`}>PDF combines all sections — CSV exports separate files</p></div>
        <div className="flex gap-2">
          <button onClick={()=>handleAll("PDF")} disabled={!!generating} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1.5 disabled:opacity-40">{generating==="all-PDF"?<Loader2 size={12} className="animate-spin"/>:<FileText size={12}/>}All PDF</button>
          <button onClick={()=>handleAll("CSV")} disabled={!!generating} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-40">{generating==="all-CSV"?<Loader2 size={12} className="animate-spin"/>:<Download size={12}/>}All CSV</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION: SETTINGS
// ═══════════════════════════════════════════════════════════════════
const SectionSettings = ({ isDark }) => {
  const t=T(isDark);
  const photoInputRef=useRef(null);
  const[toast,setToast]=useState({show:false,message:"",type:"success"});
  const showToast=(msg,type="success")=>setToast({show:true,message:msg,type});
  const[adminPhotoSrc,setAdminPhotoSrc]=useState(null);
  const[adminProfile,setAdminProfile]=useState({name:"Super Admin",email:"superadmin@sliit.lk",phone:"+94 77 123 4567",role:"System Administrator",department:"ICT"});
  const[adminDraft,setAdminDraft]=useState({...adminProfile});
  const[editingAdmin,setEditingAdmin]=useState(false);
  const[saveAdminConfirm,setSaveAdminConfirm]=useState(false);
  const[deleteAdminConfirm,setDeleteAdminConfirm]=useState(false);
  const[changePassConfirm,setChangePassConfirm]=useState(false);
  const ha=(e)=>setAdminDraft(p=>({...p,[e.target.name]:e.target.value}));
  const handlePhotoChange=(e)=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=(ev)=>setAdminPhotoSrc(ev.target.result);r.readAsDataURL(file);};
  const doSaveAdmin=()=>{setAdminProfile({...adminDraft});setEditingAdmin(false);setSaveAdminConfirm(false);showToast("Profile updated successfully!");};
  const[perms,setPerms]=useState([
    {role:"Admin",    manage_users:true, approve_requests:true, view_logs:true, export_reports:true, manage_entities:true},
    {role:"Batch Rep",manage_users:false,approve_requests:false,view_logs:false,export_reports:false,manage_entities:false},
    {role:"Student",  manage_users:false,approve_requests:false,view_logs:false,export_reports:false,manage_entities:false},
  ]);
  const permKeys=["manage_users","approve_requests","view_logs","export_reports","manage_entities"];
  const permLabels={manage_users:"Manage Users",approve_requests:"Approve Requests",view_logs:"View Logs",export_reports:"Export Reports",manage_entities:"Manage Entities"};
  const togglePerm=(role,key)=>{setPerms(p=>p.map(r=>r.role===role?{...r,[key]:!r[key]}:r));showToast("Permission updated.","info");};
  const SYS_CONFIGS=[
    {icon:Lock,      label:"Password Policy",          desc:"Min 8 chars, uppercase & number required",    colorKey:"blue"  },
    {icon:Clock,     label:"Session Timeout",           desc:"Auto logout after 30 minutes of inactivity",  colorKey:"amber" },
    {icon:UserCog,   label:"Registration Control",      desc:"Open / Invite-only student registration",     colorKey:"purple"},
    {icon:ShieldCheck,label:"Two-Factor Authentication",desc:"Enable 2FA for admin accounts",               colorKey:"green" },
    {icon:Bell,      label:"Notification Settings",     desc:"Configure push, email and SMS delivery",       colorKey:"red"   },
    {icon:Activity,  label:"Audit Trail",               desc:"Log retention period and export settings",     colorKey:"teal"  },
  ];
  const initials=adminProfile.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className={`min-h-full ${t.pageBg} p-6 space-y-6`}>
      <ToastPopup show={toast.show} message={toast.message} type={toast.type} onClose={()=>setToast(p=>({...p,show:false}))}/>
      <h2 className={`text-base font-black flex items-center gap-2 ${t.textPrimary}`}><Settings size={18} className="text-[#5478FF]"/>Settings</h2>

      {/* Admin Profile */}
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <div className="h-20 bg-gradient-to-r from-[#111FA2] via-[#5478FF] to-[#A78BFA] relative"><div className="absolute inset-0 opacity-20" style={{backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"16px 16px"}}/></div>
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="relative group shrink-0">
              <div className={`h-20 w-20 rounded-2xl ${isDark?"bg-[#111B3D]":"bg-slate-100"} border-4 ${isDark?"border-[#111B3D]":"border-white"} shadow-xl flex items-center justify-center overflow-hidden`}>
                {adminPhotoSrc?<img src={adminPhotoSrc} alt="Admin" className="h-full w-full object-cover"/>:<div className="h-full w-full bg-gradient-to-br from-[#5478FF] to-[#A78BFA] flex items-center justify-center text-white font-black text-2xl">{initials}</div>}
              </div>
              <button onClick={()=>photoInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="text-white text-center"><Camera size={18} className="mx-auto"/><span className="text-[9px] font-bold block mt-0.5">Change</span></div></button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
            </div>
            <div className="pb-1 flex-1"><h3 className={`font-black text-lg ${t.textPrimary}`}>{adminProfile.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/40">{adminProfile.role}</span>
                <span className={`text-xs ${t.textSecondary}`}>{adminProfile.department}</span>
              </div>
            </div>
            {!editingAdmin&&<div className="flex gap-2 pb-1">
              <button onClick={()=>{setAdminDraft({...adminProfile});setEditingAdmin(true);}} className="flex items-center gap-1.5 px-3 py-1.5 border border-sky-500/50 text-sky-500 rounded-xl text-xs font-bold hover:bg-sky-500/10"><Pencil size={12}/>Edit</button>
              <button onClick={()=>setDeleteAdminConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/40 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/10"><Trash2 size={12}/>Delete</button>
            </div>}
          </div>
          {!editingAdmin?(
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[{icon:User,label:"Name",val:adminProfile.name},{icon:Mail,label:"Email",val:adminProfile.email},{icon:Phone,label:"Phone",val:adminProfile.phone},{icon:ShieldCheck,label:"Department",val:adminProfile.department}].map(f=>(
                <div key={f.label} className={`${t.innerBg} rounded-xl p-3 border ${t.innerBorder}`}>
                  <div className="flex items-center gap-1.5 mb-1"><f.icon size={12} className="text-sky-500"/><p className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>{f.label}</p></div>
                  <p className={`text-sm font-semibold ${t.textPrimary}`}>{f.val}</p>
                </div>
              ))}
            </div>
          ):(
            <div className={`${t.innerBg} rounded-2xl border ${t.innerBorder} p-5`}>
              <p className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${t.textMuted}`}><Edit3 size={12}/>Editing Profile</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {[{label:"Full Name",name:"name"},{label:"Email",name:"email"},{label:"Phone",name:"phone"},{label:"Department",name:"department"}].map(f=>(
                  <div key={f.name}><label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>{f.label}</label><input name={f.name} value={adminDraft[f.name]} onChange={ha} className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}/></div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={()=>setChangePassConfirm(true)} className={`flex items-center gap-1.5 text-xs font-semibold hover:text-sky-500 transition-colors ${t.textSecondary}`}><Key size={12}/>Change Password</button>
                <div className="flex gap-2">
                  <button onClick={()=>setEditingAdmin(false)} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}>Cancel</button>
                  <button onClick={()=>setSaveAdminConfirm(true)} className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee]">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permissions */}
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${t.divider} flex items-center gap-2`}>
          <div className="h-8 w-8 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center"><Shield size={16} className="text-purple-500"/></div>
          <div><p className={`font-bold text-sm ${t.textPrimary}`}>Role Permissions Matrix</p><p className={`text-[10px] ${t.textMuted}`}>Configure access levels per role — click to toggle</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className={`${t.tableHead} text-xs uppercase tracking-wider border-b ${t.divider}`}><th className="px-5 py-3 text-left font-semibold">Role</th>{permKeys.map(k=><th key={k} className="px-4 py-3 text-center font-semibold">{permLabels[k]}</th>)}</tr></thead>
            <tbody>
              {perms.map((r,i)=>(<tr key={r.role} className={`border-t ${t.divider} ${i%2===1?t.rowAlt:""}`}>
                <td className="px-5 py-3"><RoleBadge role={r.role}/></td>
                {permKeys.map(k=>(<td key={k} className="px-4 py-3 text-center">
                  <button onClick={()=>togglePerm(r.role,k)} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold transition-all border ${r[k]?"bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200":"bg-red-100 text-red-700 border-red-300 hover:bg-red-200"}`}>{r[k]?<CheckCircle size={11}/>:<XCircle size={11}/>}{r[k]?"On":"Off"}</button>
                </td>))}
              </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System config */}
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${t.divider} flex items-center gap-2`}>
          <div className={`h-8 w-8 rounded-xl ${t.innerBg} border ${t.innerBorder} flex items-center justify-center`}><Settings size={16} className={t.textSecondary}/></div>
          <div><p className={`font-bold text-sm ${t.textPrimary}`}>System Configurations</p><p className={`text-[10px] ${t.textMuted}`}>Access levels and system settings</p></div>
        </div>
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYS_CONFIGS.map(c=>{const col=getColor(isDark,c.colorKey);return(
            <div key={c.label} className={`flex items-start gap-3 p-4 rounded-xl border ${col.border} ${t.innerBg} hover:border-[#5478FF]/50 hover:shadow-sm transition-all cursor-pointer group`}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${col.iconBg} border ${col.border}`}><c.icon size={16} className={col.iconText}/></div>
              <div className="flex-1 min-w-0"><p className={`font-semibold text-xs ${t.textPrimary}`}>{c.label}</p><p className={`text-[10px] mt-0.5 leading-relaxed ${t.textMuted}`}>{c.desc}</p></div>
              <ChevronRight size={14} className={`${t.textMuted} shrink-0 mt-0.5 group-hover:text-[#5478FF] transition-colors`}/>
            </div>
          );})}
        </div>
      </div>

      <ConfirmModal isDark={isDark} open={saveAdminConfirm} onClose={()=>setSaveAdminConfirm(false)} onConfirm={doSaveAdmin} title="Save Profile?" message="Update your admin profile details?" confirmLabel="Yes, Save"/>
      <ConfirmModal isDark={isDark} open={deleteAdminConfirm} onClose={()=>setDeleteAdminConfirm(false)} onConfirm={()=>setDeleteAdminConfirm(false)} title="Delete Account?" message="This will permanently delete your admin account. This cannot be undone." confirmLabel="Yes, Delete" variant="danger"/>
      <ConfirmModal isDark={isDark} open={changePassConfirm} onClose={()=>setChangePassConfirm(false)} onConfirm={()=>setChangePassConfirm(false)} title="Change Password?" message="A password reset link will be sent to your registered email address." confirmLabel="Send Reset Link"/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION: LOGS
// ═══════════════════════════════════════════════════════════════════
const SectionLogs = ({ isDark }) => {
  const t=T(isDark);
  const[logs]=useState(SEED_LOGS);
  const[filter,setFilter]=useState("ALL");
  const[catFilter,setCatFilter]=useState("ALL");
  const[search,setSearch]=useState("");
  const[toast,setToast]=useState({show:false,message:"",type:"success"});
  const[generating,setGenerating]=useState(false);
  const showToast=(msg,type="success")=>setToast({show:true,message:msg,type});
  const categories=["ALL",...Array.from(new Set(logs.map(l=>l.category)))];
  const filtered=logs.filter(l=>{const ms=!search||l.action.toLowerCase().includes(search.toLowerCase())||l.target.toLowerCase().includes(search.toLowerCase())||l.admin.toLowerCase().includes(search.toLowerCase());return ms&&(filter==="ALL"||l.severity===filter)&&(catFilter==="ALL"||l.category===catFilter);});
  const counts={info:logs.filter(l=>l.severity==="info").length,success:logs.filter(l=>l.severity==="success").length,warning:logs.filter(l=>l.severity==="warning").length,danger:logs.filter(l=>l.severity==="danger").length};
  const handlePDF=async()=>{setGenerating(true);try{exportLogsPDF(filtered);showToast("Logs exported as PDF!");}catch{showToast("Export failed.","error");}finally{setTimeout(()=>setGenerating(false),800);}};
  const handleCSV=async()=>{setGenerating(true);try{exportLogsCSV(filtered);showToast("Logs exported as CSV!");}catch{showToast("Export failed.","error");}finally{setTimeout(()=>setGenerating(false),800);}};

  // Severity badge — solid bg for both modes
  const SEV={
    info:    "bg-sky-100 text-sky-800 border-sky-300",
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    danger:  "bg-red-100 text-red-800 border-red-300",
  };
  const SEV_ICON={info:<Info size={11}/>,success:<CheckCircle size={11}/>,warning:<AlertTriangle size={11}/>,danger:<AlertCircle size={11}/>};

  const SEV_FILTERS=[
    {key:"ALL",     label:"All",     activeCls:"bg-slate-700 text-white",     inactiveDark:"bg-[#0B1230] text-slate-300 border border-[#2B3E7A]",  inactiveLight:"bg-white text-gray-600 border border-gray-200"},
    {key:"info",    label:"Info",    activeCls:"bg-sky-500 text-white",       inactiveDark:"bg-sky-500/10 text-sky-300 border border-sky-500/40",   inactiveLight:"bg-sky-50 text-sky-700 border border-sky-200"},
    {key:"success", label:"Success", activeCls:"bg-emerald-500 text-white",   inactiveDark:"bg-emerald-500/10 text-emerald-300 border border-emerald-500/40", inactiveLight:"bg-emerald-50 text-emerald-700 border border-emerald-200"},
    {key:"warning", label:"Warning", activeCls:"bg-amber-500 text-white",     inactiveDark:"bg-amber-500/10 text-amber-300 border border-amber-500/40", inactiveLight:"bg-amber-50 text-amber-700 border border-amber-200"},
    {key:"danger",  label:"Critical",activeCls:"bg-red-500 text-white",       inactiveDark:"bg-red-500/10 text-red-300 border border-red-500/40",   inactiveLight:"bg-red-50 text-red-700 border border-red-200"},
  ];

  return (
    <div className={`min-h-full ${t.pageBg} p-6 space-y-6`}>
      <ToastPopup show={toast.show} message={toast.message} type={toast.type} onClose={()=>setToast(p=>({...p,show:false}))}/>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className={`text-base font-black flex items-center gap-2 ${t.textPrimary}`}><ScrollText size={18} className="text-[#5478FF]"/>Activity Logs</h2><p className={`text-xs mt-0.5 ${t.textSecondary}`}>Track admin actions, system events and security monitoring</p></div>
        <div className="flex gap-2">
          <button onClick={handlePDF} disabled={generating} className="flex items-center gap-1.5 px-4 py-2 border border-red-400/40 bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 rounded-xl disabled:opacity-40">{generating?<Loader2 size={13} className="animate-spin"/>:<FileText size={13}/>}Export PDF</button>
          <button onClick={handleCSV} disabled={generating} className="flex items-center gap-1.5 px-4 py-2 border border-emerald-400/40 bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 rounded-xl disabled:opacity-40">{generating?<Loader2 size={13} className="animate-spin"/>:<Download size={13}/>}Export CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Info"     value={counts.info}    icon={Info}          colorKey="sky"   isDark={isDark}/>
        <StatCard label="Success"  value={counts.success} icon={CheckCircle}   colorKey="green" isDark={isDark}/>
        <StatCard label="Warning"  value={counts.warning} icon={AlertTriangle} colorKey="amber" isDark={isDark}/>
        <StatCard label="Critical" value={counts.danger}  icon={AlertCircle}   colorKey="red"   isDark={isDark}/>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <ThemedSearch isDark={isDark} value={search} onChange={setSearch} placeholder="Search logs…"/>
        <div className="flex gap-1.5 flex-wrap">
          {SEV_FILTERS.map(s=><button key={s.key} onClick={()=>setFilter(s.key)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter===s.key?s.activeCls:(isDark?s.inactiveDark:s.inactiveLight)}`}>{s.label}</button>)}
        </div>
        <ThemedSelect isDark={isDark} value={catFilter} onChange={setCatFilter} options={categories.filter(c=>c!=="ALL")} placeholder="All Categories"/>
        <span className={`text-xs ml-auto ${t.textMuted}`}>Showing <span className={`font-bold ${t.textSecondary}`}>{filtered.length}</span> of {logs.length}</span>
      </div>
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className={`${t.tableHead} text-xs uppercase tracking-wider border-b ${t.divider}`}>{["#","Severity","Category","Action","Admin","Target","Timestamp"].map(h=><th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={7} className={`py-12 text-center text-sm ${t.textMuted}`}>No logs match your filters</td></tr>
              :filtered.map((l,i)=>(<tr key={l.id} className={`border-t ${t.divider} ${i%2===1?t.rowAlt:""} ${t.rowHover} transition-colors`}>
                <td className={`px-4 py-3 text-xs font-mono ${t.textMuted}`}>#{l.id}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEV[l.severity]}`}>{SEV_ICON[l.severity]}{l.severity.toUpperCase()}</span></td>
                <td className="px-4 py-3"><span className={`text-[10px] ${t.innerBg} ${t.textSecondary} px-2 py-0.5 rounded-full font-semibold border ${t.innerBorder}`}>{l.category}</span></td>
                <td className={`px-4 py-3 font-semibold text-xs ${t.textPrimary}`}>{l.action}</td>
                <td className="px-4 py-3 text-sky-500 text-xs font-medium">{l.admin}</td>
                <td className={`px-4 py-3 text-xs ${t.textSecondary}`}>{l.target}</td>
                <td className={`px-4 py-3 text-xs font-mono ${t.textMuted}`}>{l.time}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Admin details panel ──────────────────────────────────────────
const AdminDetailsPanel = ({ user, onClose, isDark }) => {
  const t=T(isDark);
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}/>
      <div className={`fixed top-16 right-4 z-50 w-72 ${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-2xl overflow-hidden`}>
        <div className="h-16 bg-gradient-to-r from-[#111FA2] via-[#5478FF] to-[#A78BFA]"/>
        <div className="px-4 pb-4">
          <div className="-mt-8 mb-3"><div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#5478FF] to-[#A78BFA] flex items-center justify-center text-white font-black text-xl border-4 border-[#111B3D] shadow-lg">{(user?.firstName??"S").charAt(0)}{(user?.lastName??"A").charAt(0)}</div></div>
          <p className={`font-black text-base ${t.textPrimary}`}>{user?.firstName?`${user.firstName} ${user.lastName??""}`:"Super Admin"}</p>
          <p className="text-sky-500 text-xs font-semibold">System Administrator</p>
          <div className="mt-3 space-y-2">
            {[{icon:Mail,label:"Email",val:user?.email??"superadmin@sliit.lk"},{icon:Shield,label:"Role",val:"Admin"},{icon:Building2,label:"Department",val:"ICT"}].map(f=>(
              <div key={f.label} className="flex items-center gap-2.5 py-1.5">
                <div className={`h-6 w-6 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0`}><f.icon size={12} className="text-sky-500"/></div>
                <div><p className={`text-[9px] font-bold uppercase tracking-wider leading-none ${t.textMuted}`}>{f.label}</p><p className={`text-xs font-semibold ${t.textPrimary}`}>{f.val}</p></div>
              </div>
            ))}
          </div>
          <button onClick={onClose} className={`mt-3 w-full py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition-colors ${t.cardBorder} ${t.textSecondary}`}>Close</button>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function Admin() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const[active,setActive]=useState("dashboard");
  const[notification,setNotification]=useState({show:false,type:"info",message:""});
  const[showAdminPanel,setShowAdminPanel]=useState(false);
  const[logoutConfirm,setLogoutConfirm]=useState(false);
  const[logoutSuccessToast,setLogoutSuccessToast]=useState(false);
  const notify=useCallback((type,message)=>setNotification({show:true,type,message}),[]);
  const t=T(isDark);

  const handleLogout=()=>{setLogoutConfirm(false);setLogoutSuccessToast(true);setTimeout(()=>{logout?.();navigate("/campusconnect/admin",{replace:true});},2000);};

  const renderContent=()=>{switch(active){
    case "dashboard":     return <div className={`h-[60vh] flex flex-col items-center justify-center gap-3 ${t.textMuted}`}><LayoutDashboard size={56}/><p className="font-bold text-base">Dashboard is empty</p></div>;
    case "users":         return <SectionUsers         notify={notify} isDark={isDark}/>;
    case "batchreps":     return <SectionBatchReps     notify={notify} isDark={isDark}/>;
    case "requests":      return <SectionRequests      notify={notify} isDark={isDark}/>;
    case "entities":      return <SectionEntities      notify={notify} isDark={isDark}/>;
    case "notifications": return <SectionNotifications notify={notify} isDark={isDark}/>;
    case "reports":       return <SectionReports       isDark={isDark}/>;
    case "settings":      return <SectionSettings      isDark={isDark}/>;
    case "logs":          return <SectionLogs          isDark={isDark}/>;
    default:              return <div className={`text-center py-20 italic ${t.textMuted}`}>Section "{active}" coming soon…</div>;
  }};

  return (
    <div className={`flex h-screen overflow-hidden ${t.pageBg}`}>

      {/* SIDEBAR */}
      <Sidebar
        t={t}
        isDark={isDark}
        toggleTheme={toggleTheme}
        active={active}
        setActive={setActive}
        onLogoutClick={() => setLogoutConfirm(true)}
        SIDEBAR_GROUPS={SIDEBAR_GROUPS}
      />

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto relative">
        <header className={`h-16 border-b ${t.headerBorder} flex items-center justify-between px-8 ${t.headerBg} backdrop-blur-xl sticky top-0 z-10`}>
          <h1 className={`font-black text-lg capitalize ${t.textPrimary}`}>{active}</h1>
          <div className="flex items-center gap-4">
            {notification.show&&<NotificationBanner show={notification.show} type={notification.type} message={notification.message} onClose={()=>setNotification({show:false,type:"info",message:""})}/>}
            <button onClick={()=>setShowAdminPanel(p=>!p)} className={`flex items-center gap-3 px-3 py-1.5 rounded-xl transition-colors ${isDark?"hover:bg-white/5":"hover:bg-gray-100"}`}>
              <div className="text-right hidden sm:block">
                <p className={`text-xs font-bold leading-tight ${t.textPrimary}`}>{user?.firstName?`${user.firstName} ${user.lastName??""}`:"Super Admin"}</p>
                <p className="text-sky-500 text-[10px] font-medium">System Administrator</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#5478FF] to-[#A78BFA] border-2 border-[#5478FF]/50 flex items-center justify-center text-white text-xs font-black">
                {(user?.firstName??"S").charAt(0)}{(user?.lastName??"A").charAt(0)}
              </div>
              <ChevronDown size={12} className={t.textMuted}/>
            </button>
          </div>
        </header>

        {showAdminPanel&&<AdminDetailsPanel user={user} onClose={()=>setShowAdminPanel(false)} isDark={isDark}/>}
        <div>{renderContent()}</div>
      </main>

      <ConfirmModal isDark={isDark} open={logoutConfirm} onClose={()=>setLogoutConfirm(false)} onConfirm={handleLogout} title="Logout?" message="Are you sure you want to log out of the admin portal?" confirmLabel="Yes, Logout" variant="danger"/>
      <ToastPopup show={logoutSuccessToast} message="Logged out successfully!" type="success" onClose={()=>setLogoutSuccessToast(false)}/>
    </div>
  );
}