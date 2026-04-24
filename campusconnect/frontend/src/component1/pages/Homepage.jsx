import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { colors } from "../../contexts/ColorContext";

// ─── Lucide-style inline SVG icons (no extra dep) ───────────────────────────
const Icon = ({ d, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  users:      "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z",
  book:       "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z",
  video:      "M23 7l-7 5 7 5V7zM1 5h13a2 2 0 012 2v10a2 2 0 01-2 2H1a2 2 0 01-2-2V7a2 2 0 012-2z",
  shield:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star:       "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  check:      "M20 6L9 17l-5-5",
  upload:     "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  message:    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  award:      "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  globe:      "M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20",
  sun:        "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10A5 5 0 0012 7z",
  moon:       "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  menu:       "M3 12h18M3 6h18M3 18h18",
  x:          "M18 6L6 18M6 6l12 12",
};

// ─── Stat counter ────────────────────────────────────────────────────────────
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── NavBar ──────────────────────────────────────────────────────────────────
function NavBar({ isDark, toggleTheme, onLogin }) {
  const theme = isDark ? colors.dark : colors.light;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = ["Home", "Features", "About", "Contact"];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? isDark ? "bg-[#0A0F2C]/95 shadow-lg shadow-black/30 backdrop-blur-xl border-b border-[#5478FF]/20"
                 : "bg-white/95 shadow-md backdrop-blur-xl border-b border-[#53CBF3]/30"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5478FF] to-[#111FA2] flex items-center justify-center shadow-lg shadow-[#5478FF]/30">
            <span className="text-white font-black text-sm">CC</span>
          </div>
          <span className={`font-black text-lg tracking-tight ${isDark ? "text-white" : "text-[#111FA2]"}`}>
            Campus<span className="text-[#5478FF]">Connect</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:text-[#5478FF] ${
                isDark ? "text-slate-300" : "text-gray-600"
              }`}>
              {link}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? "text-slate-400 hover:text-white hover:bg-white/10"
                     : "text-gray-500 hover:text-[#111FA2] hover:bg-gray-100"
            }`}>
            <Icon d={isDark ? icons.sun : icons.moon} size={18} />
          </button>
          <button onClick={onLogin}
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#5478FF] to-[#111FA2] text-white text-sm font-semibold shadow-lg shadow-[#5478FF]/30 hover:opacity-90 transition-opacity">
            Login / Register
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500">
            <Icon d={mobileOpen ? icons.x : icons.menu} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden px-6 pb-4 space-y-2 ${isDark ? "bg-[#0A0F2C]" : "bg-white"}`}>
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
              {link}
            </a>
          ))}
          <button onClick={onLogin}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#5478FF] to-[#111FA2] text-white text-sm font-semibold">
            Login / Register
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ isDark, onGetStarted }) {
  const students  = useCounter(16500);
  const courses   = useCounter(7500);

  return (
    <section id="home" className={`relative min-h-screen flex items-center overflow-hidden ${
      isDark ? "bg-[#0A0F2C]" : "bg-gradient-to-br from-[#EEF2FF] via-[#F0F4FF] to-[#E8F4FE]"
    }`}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${
          isDark ? "bg-[#5478FF]" : "bg-[#5478FF]"
        }`} />
        <div className={`absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 ${
          isDark ? "bg-[#53CBF3]" : "bg-[#53CBF3]"
        }`} />
        {/* Dot grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? "#5478FF30" : "#5478FF20"} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{
              background: isDark ? "rgba(84,120,255,0.12)" : "rgba(84,120,255,0.08)",
              borderColor: isDark ? "rgba(84,120,255,0.4)" : "rgba(84,120,255,0.3)",
              color: "#5478FF",
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5478FF] animate-pulse" />
            SLIIT Smart Campus Platform
          </div>

          <h1 className={`text-5xl lg:text-6xl font-black leading-tight mb-6 ${
            isDark ? "text-white" : "text-[#0A0F2C]"
          }`}>
            Campus Learning{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5478FF] to-[#53CBF3]">
              Feels Like
            </span>{" "}
            Real Connection
          </h1>

          <p className={`text-base leading-relaxed mb-8 max-w-lg ${
            isDark ? "text-slate-300" : "text-gray-600"
          }`}>
            Join SLIIT's smart campus network. Access study resources, join study groups, attend
            sessions, and stay connected with your faculty — all in one place.
          </p>

          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {["Get Certified", "Gain Real Skills", "Stay Connected"].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 text-sm font-medium text-[#5478FF]">
                <Icon d={icons.check} size={14} className="text-[#53CBF3]" />
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={onGetStarted}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#5478FF] to-[#111FA2] text-white font-bold text-sm shadow-xl shadow-[#5478FF]/30 hover:opacity-90 transition-all hover:scale-[1.02]">
              Get Started
              <Icon d={icons.arrowRight} size={16} />
            </button>
            <button
                onClick={() => {
                    const section = document.getElementById("features");
                    if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                    }
                }}
              className={`flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border-2 transition-all hover:scale-[1.02] ${
                isDark
                  ? "border-[#5478FF]/40 text-white hover:border-[#5478FF] hover:bg-[#5478FF]/10"
                  : "border-[#5478FF]/30 text-[#111FA2] hover:border-[#5478FF] hover:bg-[#5478FF]/5"
              }`}>
              Platform Features
              <Icon d={icons.arrowRight} size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-10 pt-8 border-t border-dashed"
            style={{ borderColor: isDark ? "rgba(84,120,255,0.2)" : "rgba(84,120,255,0.15)" }}>
            <div>
              <p className={`text-3xl font-black ${isDark ? "text-white" : "text-[#111FA2]"}`}>
                {students.toLocaleString()}+
              </p>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                Active Students
              </p>
            </div>
            <div className={`w-px h-10 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
            <div>
              <p className={`text-3xl font-black ${isDark ? "text-white" : "text-[#111FA2]"}`}>
                {courses.toLocaleString()}+
              </p>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                Study Sessions
              </p>
            </div>
            <div className={`w-px h-10 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />
            <div>
              <p className={`text-3xl font-black ${isDark ? "text-white" : "text-[#111FA2]"}`}>4+</p>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                Faculties
              </p>
            </div>
          </div>
        </div>

        {/* Right — hero image placeholder */}
        <div className="relative flex justify-center">
          {/* Main image box */}
          <div className={`relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden border-2 flex items-center justify-center ${
            isDark
              ? "bg-gradient-to-br from-[#111640] to-[#0D1235] border-[#5478FF]/30"
              : "bg-gradient-to-br from-[#E8EEFF] to-[#D8E8FE] border-[#5478FF]/20"
          }`}>
            {/* Placeholder graphic */}
            <div className="text-center px-8">
             <img
                src="/student.jpg"
                alt="student"
                className="w-full h-full object-cover absolute inset-0"
                />
            </div>

            {/* Floating badge 1 */}
            <div className={`absolute bottom-6 left-6 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border ${
              isDark ? "bg-[#111640] border-[#5478FF]/30" : "bg-white border-gray-100"
            }`}>
              <div className="w-8 h-8 rounded-xl bg-[#5478FF]/10 flex items-center justify-center">
                <Icon d={icons.users} size={16} className="text-[#5478FF]" />
              </div>
              <div>
                <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>16,500+</p>
                <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-500"}`}>Active Students</p>
              </div>
            </div>

            {/* Floating badge 2 */}
            <div className={`absolute top-6 right-6 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-xl border ${
              isDark ? "bg-[#111640] border-[#5478FF]/30" : "bg-white border-gray-100"
            }`}>
              <div className="w-7 h-7 rounded-lg bg-[#FFDE42]/20 flex items-center justify-center">
                <Icon d={icons.video} size={14} className="text-[#FFDE42]" />
              </div>
              <div>
                <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>7,500+</p>
                <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-500"}`}>Sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature strip ───────────────────────────────────────────────────────────
function FeatureStrip({ isDark }) {
  const items = [
    { icon: icons.book,    label: "Resource Sharing"   },
    { icon: icons.users,   label: "Study Groups"        },
    { icon: icons.video,   label: "Live Sessions"       },
    { icon: icons.message, label: "Session Feedback"    },
    { icon: icons.shield,  label: "Role-Based Access"   },
  ];

  return (
    <div className={`border-y ${isDark ? "bg-[#0D1235] border-[#5478FF]/15" : "bg-white border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-6">
          {items.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5478FF]/10 flex items-center justify-center flex-shrink-0">
                <Icon d={icon} size={17} className="text-[#5478FF]" />
              </div>
              <span className={`text-sm font-semibold whitespace-nowrap ${
                isDark ? "text-slate-200" : "text-gray-700"
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── About section ───────────────────────────────────────────────────────────
function About({ isDark }) {
  const checks = [
    "Manage faculty, programs & batch reps from one dashboard",
    "Join study groups and collaborate with batch mates",
    "Upload and access shared academic resources",
    "Attend live study sessions and submit feedback",
  ];

  return (
    <section id="about" className={`py-24 ${isDark ? "bg-[#0A0F2C]" : "bg-[#F0F4FF]"}`}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left — image grid */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            {/* Large image */}
            <div className={`col-span-1 row-span-2 rounded-3xl overflow-hidden aspect-[3/4] flex items-center justify-center border-2 ${
              isDark
                ? "bg-gradient-to-br from-[#111640] to-[#0D1235] border-[#5478FF]/20"
                : "bg-gradient-to-br from-[#E2E9FF] to-[#D0E4FF] border-[#5478FF]/15"
            }`}>
                <img
                src="/group.jpg"
                alt="group"
                className="w-full h-full object-cover"
                />
            </div>

            {/* Small image 1 */}
            <div className={`rounded-3xl overflow-hidden aspect-square flex items-center justify-center border-2 ${
              isDark
                ? "bg-gradient-to-br from-[#111640] to-[#0D1235] border-[#5478FF]/20"
                : "bg-gradient-to-br from-[#E2E9FF] to-[#D0E4FF] border-[#5478FF]/15"
            }`}>
              <img
                src="/SLIIT.jpg"
                alt="SLIIT"
                className="w-full h-full object-cover"
                />
            </div>

            {/* Small image 2 */}
            <div className={`rounded-3xl overflow-hidden aspect-square flex items-center justify-center border-2 ${
              isDark
                ? "bg-gradient-to-br from-[#111640] to-[#0D1235] border-[#5478FF]/20"
                : "bg-gradient-to-br from-[#E2E9FF] to-[#D0E4FF] border-[#5478FF]/15"
            }`}>
             <img
                src="/Sliit-Research-Facilities.jpg"
                alt="Sliit-Research-Facilities"
                className="w-full h-full object-cover"
                />
            </div>
          </div>

          {/* Experience badge */}
          <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-3xl flex flex-col items-center justify-center shadow-2xl border-2 ${
            isDark
              ? "bg-[#111640] border-[#5478FF]/40 shadow-[#5478FF]/20"
              : "bg-white border-[#5478FF]/20 shadow-[#5478FF]/10"
          }`}>
            <p className="text-[#5478FF] text-2xl font-black leading-none">5+</p>
            <p className={`text-[9px] font-bold text-center leading-tight mt-1 ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}>Years<br/>SLIIT</p>
          </div>
        </div>

        {/* Right */}
        <div>
          <p className="text-[#5478FF] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-8 h-px bg-[#5478FF]" />
            Get to know about us
          </p>
          <h2 className={`text-4xl font-black leading-tight mb-5 ${
            isDark ? "text-white" : "text-[#0A0F2C]"
          }`}>
            Dive into Smart Campus and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5478FF] to-[#53CBF3]">
              Ignite Your Learning!
            </span>
          </h2>
          <p className={`text-sm leading-relaxed mb-8 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            CampusConnect transforms the SLIIT experience by connecting students, batch reps,
            and admins in a single seamless platform. Collaborate, learn, and grow together.
          </p>

          <div className="space-y-3 mb-8">
            {checks.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-[#5478FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon d={icons.check} size={11} className="text-white" />
                </div>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>{item}</p>
              </div>
            ))}
          </div>

          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5478FF] text-white text-sm font-bold shadow-lg shadow-[#5478FF]/25 hover:opacity-90 transition-opacity">
            About More
            <Icon d={icons.arrowRight} size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Features section ────────────────────────────────────────────────────────
function Features({ isDark }) {
  const featureCategories = [
    { icon: icons.users,   label: "Study Groups",       count: "120+ Groups",  active: true  },
    { icon: icons.video,   label: "Live Sessions",       count: "80+ Sessions", active: false },
    { icon: icons.book,    label: "Resources",           count: "500+ Files",   active: false },
    { icon: icons.message, label: "Feedback",            count: "24/7 Open",    active: false },
  ];

  const cards = [
    {
      weeks: "STUDENTS",
      title: "Join Study Groups & Collaborate",
      image: "/study_group.jpg",
      lessons: 8,
      students: "500+",
      level: "All Levels",
      author: "Batch System",
      icon: icons.users,
      color: "#5478FF",
    },
    {
      weeks: "BATCH REP",
      title: "Manage Your Batch & Resources",
      image: "/resources.jpg",
      lessons: 5,
      students: "50+",
      level: "Batch Rep",
      author: "Admin Panel",
      icon: icons.award,
      color: "#53CBF3",
    },
    {
      weeks: "ADMIN",
      title: "Control Faculties & Programs",
      image: "/faculty.jpg",
      lessons: 10,
      students: "All",
      level: "Admin",
      author: "Dashboard",
      icon: icons.shield,
      color: "#FFDE42",
    },
    {
      weeks: "RESOURCES",
      title: "Upload & Share Study Materials",
      image: "study_metirials.jpg",
      lessons: 12,
      students: "200+",
      level: "Beginner",
      author: "Resource Hub",
      icon: icons.upload,
      color: "#5478FF",
    },
  ];

  return (
    <section id="features" className={`py-24 ${isDark ? "bg-[#070C24]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#5478FF] text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-[#5478FF]" />
            Platform Features
            <span className="w-6 h-px bg-[#5478FF]" />
          </p>
          <h2 className={`text-4xl font-black ${isDark ? "text-white" : "text-[#0A0F2C]"}`}>
            Everything You Need on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5478FF] to-[#53CBF3]">
              One Platform
            </span>
          </h2>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          {featureCategories.map(({ icon, label, count, active }) => (
            <button key={label} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              active
                ? "bg-[#5478FF] text-white border-[#5478FF] shadow-lg shadow-[#5478FF]/25"
                : isDark
                  ? "bg-[#111B3D] text-slate-300 border-[#2B3E7A] hover:border-[#5478FF]/50"
                  : "bg-[#F0F4FF] text-gray-600 border-gray-200 hover:border-[#5478FF]/40"
            }`}>
              <Icon d={icon} size={15} />
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                active ? "bg-white/20 text-white" : isDark ? "bg-[#0D1235] text-slate-400" : "bg-white text-gray-500"
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div key={card.title} className={`group rounded-2xl overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1 ${
              isDark
                ? "bg-[#111B3D] border-[#2B3E7A] hover:border-[#5478FF]/50 hover:shadow-[#5478FF]/10"
                : "bg-white border-gray-100 hover:border-[#5478FF]/20 hover:shadow-[#5478FF]/10"
            }`}>
              {/* Image placeholder */}
              <div className={`relative h-44 flex items-center justify-center overflow-hidden ${
                isDark ? "bg-[#0D1235]" : "bg-gradient-to-br from-[#EEF2FF] to-[#E0EBFF]"
              }`}
                style={{ background: `linear-gradient(135deg, ${card.color}18, ${card.color}08)` }}>
                    

               <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
                />

                <span className="absolute top-3 left-3 text-[9px] font-black px-2.5 py-1 rounded-lg"
                  style={{ background: card.color, color: "#fff" }}>
                  {card.weeks}
                </span>

                {/* Stars */}
                <div className="absolute bottom-3 left-3 flex items-center gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <Icon key={i} d={icons.star} size={10} className="text-[#FFDE42] fill-[#FFDE42]" />
                  ))}
                  <span className={`text-[10px] ml-1 font-semibold ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    4.7
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className={`font-bold text-sm leading-snug mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {card.title}
                </h3>
                <div className={`flex items-center gap-3 text-[10px] mb-3 ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                  <span className="flex items-center gap-1">
                    <Icon d={icons.book} size={11} /> {card.lessons} Modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon d={icons.users} size={11} /> {card.students} Users
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon d={icons.star} size={11} /> {card.level}
                  </span>
                </div>
                <div className={`flex items-center justify-between pt-3 border-t ${
                  isDark ? "border-[#1D2D68]" : "border-gray-100"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5478FF] to-[#111FA2] flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">CC</span>
                    </div>
                    <span className={`text-[11px] font-medium ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                      {card.author}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#5478FF]">FREE</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 font-bold text-sm transition-all hover:bg-[#5478FF] hover:text-white hover:border-[#5478FF] ${
            isDark
              ? "border-[#5478FF]/40 text-[#5478FF]"
              : "border-[#5478FF]/30 text-[#5478FF]"
          }`}>
            View All Features
            <Icon d={icons.arrowRight} size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Roles section ───────────────────────────────────────────────────────────
function Roles({ isDark, onGetStarted }) {
  const roles = [
    {
      role: "Student",
      color: "#5478FF",
      icon: icons.book,
      perks: ["Join study groups", "Access shared resources", "Attend live sessions", "Submit session feedback"],
    },
    {
      role: "Batch Rep",
      color: "#53CBF3",
      icon: icons.award,
      perks: ["Manage your batch", "Create study groups", "Upload resources", "Monitor attendance"],
    },
    {
      role: "Admin",
      color: "#FFDE42",
      icon: icons.shield,
      perks: ["Manage faculties & programs", "Approve/reject requests", "View all analytics", "Manage all users"],
    },
  ];

  return (
    <section className={`py-24 ${isDark ? "bg-[#0A0F2C]" : "bg-[#F0F4FF]"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[#5478FF] text-xs font-bold uppercase tracking-widest mb-3">
            Who Is It For?
          </p>
          <h2 className={`text-4xl font-black ${isDark ? "text-white" : "text-[#0A0F2C]"}`}>
            Built for Every Role on Campus
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ role, color, icon, perks }) => (
            <div key={role} className={`relative rounded-3xl p-7 border-2 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group ${
              isDark
                ? "bg-[#111640] border-[#2B3E7A] hover:shadow-[#5478FF]/10"
                : "bg-white border-gray-100"
            }`}
              style={{ borderColor: `${color}33` }}>
              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: color }} />

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                style={{ background: `${color}18`, border: `1.5px solid ${color}44` }}>
                <Icon d={icon} size={26} style={{ color }} className="" />
              </div>

              <h3 className={`text-xl font-black mb-4 ${isDark ? "text-white" : "text-[#0A0F2C]"}`}>
                {role}
              </h3>

              <ul className="space-y-2.5 mb-7">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${color}20` }}>
                      <Icon d={icons.check} size={10} style={{ color }} className="" />
                    </div>
                    <span className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>{perk}</span>
                  </li>
                ))}
              </ul>

              <button onClick={onGetStarted}
                className="flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                style={{ color }}>
                Get Started
                <Icon d={icons.arrowRight} size={14} style={{ color }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────
function Testimonials({ isDark }) {
  const items = [
    { name: "Kavisha Perera",  role: "IT Student, Y2",    text: "CampusConnect made it so easy to find study partners and access all our batch notes in one place. Highly recommended!", stars: 5 },
    { name: "Dilshan Ratna",   role: "Batch Rep, SE",     text: "Managing my batch has never been simpler. I can upload resources and track who has attended sessions effortlessly.", stars: 5 },
    { name: "Amaya Fernando",  role: "CS Student, Y3",    text: "The live session feedback feature is brilliant. The admin team actually responds to our suggestions!", stars: 4 },
  ];

  return (
    <section className={`py-24 ${isDark ? "bg-[#070C24]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[#5478FF] text-xs font-bold uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className={`text-4xl font-black ${isDark ? "text-white" : "text-[#0A0F2C]"}`}>
            What Our Students Say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(({ name, role, text, stars }) => (
            <div key={name} className={`rounded-2xl p-6 border transition-all hover:-translate-y-1 ${
              isDark
                ? "bg-[#111640] border-[#2B3E7A] hover:border-[#5478FF]/40"
                : "bg-[#F7F9FF] border-gray-100 hover:border-[#5478FF]/20"
            }`}>
              <div className="flex mb-4">
                {[...Array(stars)].map((_, i) => (
                  <Icon key={i} d={icons.star} size={14} className="text-[#FFDE42] fill-[#FFDE42]" />
                ))}
              </div>
              <p className={`text-sm leading-relaxed mb-5 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                "{text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t"
                style={{ borderColor: isDark ? "#2B3E7A" : "#f0f0f0" }}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5478FF] to-[#111FA2] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{name.charAt(0)}</span>
                </div>
                <div>
                  <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{name}</p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ──────────────────────────────────────────────────────────────
function CTABanner({ isDark, onGetStarted }) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#5478FF] to-[#111FA2]" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">Ready to Join?</p>
        <h2 className="text-4xl font-black text-white mb-5 leading-tight">
          Start Your Smart Campus Journey Today
        </h2>
        <p className="text-white/80 text-sm mb-8">
          Connect with thousands of SLIIT students. Study smarter, collaborate better, achieve more.
        </p>
        <button onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#FFDE42] text-[#111FA2] font-black text-sm shadow-xl hover:opacity-90 transition-all hover:scale-[1.02]">
          Get Started Now
          <Icon d={icons.arrowRight} size={16} />
        </button>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer({ isDark }) {
  return (
    <footer className={`border-t py-10 ${
      isDark ? "bg-[#0A0F2C] border-[#5478FF]/15" : "bg-white border-gray-100"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5478FF] to-[#111FA2] flex items-center justify-center">
            <span className="text-white font-black text-xs">CC</span>
          </div>
          <span className={`font-black ${isDark ? "text-white" : "text-[#111FA2]"}`}>
            Campus<span className="text-[#5478FF]">Connect</span>
          </span>
        </div>
        <p className={`text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}>
          © 2025 CampusConnect · SLIIT Smart Campus Platform
        </p>
        <div className="flex items-center gap-5">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" className={`text-xs font-medium transition-colors hover:text-[#5478FF] ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const goLogin = () => navigate("/campusconnect/login");

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0A0F2C]" : "bg-white"}`}>
      <NavBar isDark={isDark} toggleTheme={toggleTheme} onLogin={goLogin} />
      <Hero isDark={isDark} onGetStarted={goLogin} />
      <FeatureStrip isDark={isDark} />
      <About isDark={isDark} />
      <Features isDark={isDark} />
      <Roles isDark={isDark} onGetStarted={goLogin} />
      <Testimonials isDark={isDark} />
      <CTABanner isDark={isDark} onGetStarted={goLogin} />
      <Footer isDark={isDark} />
    </div>
  );
}