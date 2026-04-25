/**
 * StudentLayout.jsx
 * Main shell: sidebar + header + content area
 * Place in: src/components/student/StudentLayout.jsx
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { T } from "../pages/StudentPortal/StudentData";
import {
  LayoutDashboard, BookOpen, ClipboardList, User, Sun, Moon,
  LogOut, Bell, ChevronDown, X, Menu, ChevronLeft, ChevronRight,
  BookMarked, Home,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { id: "entities",   label: "Entities", icon: BookOpen         },
  { id: "requests",    label: "My Requests",  icon: ClipboardList    },
  { id: "recomandations",    label: "Recomandations",  icon: ClipboardList    },
  { id: "profile",     label: "My Profile",   icon: User             },
];

export default function BatchRepLayout({ active, setActive, children }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const t                       = T(isDark);

  const [collapsed,       setCollapsed]       = useState(false);
  const [showProfile,     setShowProfile]     = useState(false);
  const [showNotif,       setShowNotif]       = useState(false);
  
  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  
  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  const notifTypeIcon = { resource:"📄", admin:"📢", session:"🗓" };
  const notifColor    = {
    resource: isDark ? "text-[#53CBF3]"  : "text-blue-600",
    admin:    isDark ? "text-[#FFDE42]"  : "text-amber-600",
    session:  isDark ? "text-[#A78BFA]"  : "text-purple-600",
  };

  const displayName = user?.username ?? "Student";
  const initials    = displayName.slice(0,2).toUpperCase();

  return (
    <div className={`flex h-screen overflow-hidden ${t.pageBg}`} style={{ fontFamily:"'DM Sans', system-ui, sans-serif" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className={`${collapsed?"w-[95px]":"w-60"} shrink-0 flex flex-col ${t.sidebarBg} border-r ${t.sidebarBorder} transition-all duration-300 z-30`}>

        {/* Logo row */}
        <div className={`flex items-center h-16 px-4 border-b ${t.sidebarBorder} shrink-0 gap-3`}>
          <div className="h-9 w-9 shrink-0 bg-gradient-to-br from-[#5478FF] to-[#53CBF3] rounded-xl flex items-center justify-center shadow-lg shadow-[#5478FF]/30">
            <span className="text-white font-black text-sm">Cc</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`font-black text-sm leading-tight truncate ${t.textPrimary}`}>CampusConnect</p>
              <p className={`text-[10px] truncate ${t.textAccent}`}>Batch Representative Portal</p>
            </div>
          )}
          <button onClick={() => setCollapsed(p => !p)}
            className={`shrink-0 p-1.5 rounded-lg transition-colors ${t.sidebarItem}`}>
            {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon     = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group
                  ${isActive ? t.sidebarActive : t.sidebarItem}`}>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-[#53CBF3] rounded-r-full"/>}
                <Icon size={16} className={isActive ? "" : ""}/>
                {!collapsed && <span className="truncate flex-1 text-left text-[13px]">{item.label}</span>}
                {collapsed && (
                  <span className={`absolute left-full ml-2 px-2 py-1 ${t.cardBg} ${t.textPrimary} text-xs rounded-lg border ${t.cardBorder} whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`px-2 pb-3 pt-2 border-t ${t.sidebarBorder} space-y-0.5`}>
          <button onClick={toggleTheme}
            title={collapsed ? (isDark ? "Light Mode" : "Dark Mode") : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${t.sidebarItem}`}>
            {isDark ? <Sun size={16} className="text-[#FFDE42]"/> : <Moon size={16}/>}
            {!collapsed && <span className="text-[13px]">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button onClick={() => { logout(); navigate("/admin/login", { replace:true }); }}
            title={collapsed ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={16}/>
            {!collapsed && <span className="text-[13px]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className={`h-14 border-b ${t.headerBorder} flex items-center justify-between px-6 shrink-0 backdrop-blur ${t.headerBg}`}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className={t.textMuted}>CampusConnect</span>
            <ChevronRight size={12} className={t.textMuted}/>
            <span className={`font-semibold capitalize ${t.textPrimary}`}>
              {NAV_ITEMS.find(n => n.id === active)?.label ?? active}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

      
            {/* Profile button */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setShowProfile(p=>!p); setShowNotif(false); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${isDark?"hover:bg-white/5":"hover:bg-gray-100"}`}>
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#5478FF] to-[#53CBF3] flex items-center justify-center text-white text-xs font-black">
                  {initials}
                </div>
                <div className="hidden sm:block text-right">
                  <p className={`text-xs font-bold leading-tight ${t.textPrimary}`}>{displayName}</p>
                  <p className={`text-[10px] ${t.textAccent}`}>Batch Rep</p>
                </div>
                <ChevronDown size={12} className={t.textMuted}/>
              </button>

              {/* Profile dropdown */}
              {showProfile && (
                <div className={`absolute top-12 right-0 w-64 ${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-2xl overflow-hidden z-50`}>
                  {/* Mini header */}
                  <div className="h-14 bg-gradient-to-r from-[#111FA2] via-[#5478FF] to-[#53CBF3]"/>
                  <div className="px-4 pb-4">
                    <div className="-mt-7 mb-3">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#5478FF] to-[#53CBF3] flex items-center justify-center text-white font-black text-lg border-4 border-[#111640] shadow-lg">
                        {initials}
                      </div>
                    </div>
                    <p className={`font-black text-sm ${t.textPrimary}`}>{displayName}</p>
                    <p className={`text-[10px] ${t.textAccent}`}>Batch Rep · SLIIT</p>
                    <div className={`mt-3 pt-3 border-t ${t.divider} space-y-1`}>
                      <button onClick={()=>{setActive("profile");setShowProfile(false);}}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${t.sidebarItem}`}>
                        <User size={13}/> View Profile
                      </button>
                      <button onClick={toggleTheme}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${t.sidebarItem}`}>
                        {isDark?<Sun size={13} className="text-[#FFDE42]"/>:<Moon size={13}/>}
                        {isDark ? "Light Mode" : "Dark Mode"}
                      </button>
                      <button onClick={()=>{ logout(); navigate("/campusconnect/login",{replace:true}); }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={13}/> Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}