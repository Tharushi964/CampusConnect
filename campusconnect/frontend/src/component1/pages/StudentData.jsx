/**
 * studentData.js
 * Seed data + theme token helper for the Student Portal
 * Place in: src/utils/studentData.js
 */

// ── Theme token helper ───────────────────────────────────────────
export const T = (isDark) => ({
  pageBg:       isDark ? "bg-[#0A0F2C]"         : "bg-[#F0F4FF]",
  cardBg:       isDark ? "bg-[#111640]"         : "bg-white",
  cardBorder:   isDark ? "border-[#5478FF]/20"  : "border-gray-200",
  innerBg:      isDark ? "bg-[#0D1235]"         : "bg-gray-50",
  innerBorder:  isDark ? "border-[#5478FF]/15"  : "border-gray-100",
  rowHover:     isDark ? "hover:bg-[#5478FF]/10": "hover:bg-blue-50/40",
  rowAlt:       isDark ? "bg-[#0D1235]/60"      : "bg-gray-50/50",
  textPrimary:  isDark ? "text-white"            : "text-[#111FA2]",
  textSecondary:isDark ? "text-white/60"         : "text-gray-500",
  textMuted:    isDark ? "text-white/30"         : "text-gray-400",
  textAccent:   isDark ? "text-[#53CBF3]"        : "text-[#5478FF]",
  inputBg:      isDark
    ? "bg-[#0D1235] border-[#5478FF]/40 text-white placeholder-white/30"
    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400",
  selectBg:     isDark
    ? "bg-[#0D1235] border-[#5478FF]/40 text-white"
    : "bg-white border-gray-200 text-gray-700",
  divider:      isDark ? "border-[#5478FF]/15"  : "border-gray-100",
  headerBg:     isDark ? "bg-[#111640]/90"      : "bg-white/90",
  headerBorder: isDark ? "border-[#5478FF]/20"  : "border-gray-200",
  sidebarBg:    isDark ? "bg-[#111640]"         : "bg-white",
  sidebarBorder:isDark ? "border-[#5478FF]/20"  : "border-gray-200",
  sidebarGroup: isDark ? "text-white/20"         : "text-gray-400",
  sidebarItem:  isDark
    ? "text-white/40 hover:text-white hover:bg-white/5"
    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
  sidebarActive:isDark
    ? "bg-[#5478FF] text-white shadow-lg shadow-[#5478FF]/30"
    : "bg-[#5478FF] text-white shadow-md",
  tableHead:    isDark ? "bg-[#0D1235]/80 text-[#53CBF3]" : "bg-gray-50 text-gray-500",
  modalBg:      isDark ? "bg-[#111640] border-[#5478FF]/40" : "bg-white border-gray-100",
  modalHeader:  isDark ? "border-[#5478FF]/30"  : "border-gray-100",
  modalClose:   isDark
    ? "text-[#53CBF3] hover:text-white hover:bg-white/10"
    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
});

// ── Seed data ────────────────────────────────────────────────────

export const SEED_SEMESTERS = [
  {
    id: "s1",
    name: "Semester 1 — 2025",
    year: "2025",
    period: "Jan – May",
    active: false,
    weeks: 16,
    subjects: [
      { id: "sub1", code: "IT1010", name: "Programming Fundamentals",  credits: 3, section: "A", color: "#5478FF", progress: 72 },
      { id: "sub2", code: "IT1020", name: "Mathematics for Computing",  credits: 3, section: "A", color: "#53CBF3", progress: 68 },
      { id: "sub3", code: "IT1030", name: "Database Systems",           credits: 3, section: "B", color: "#A78BFA", progress: 55 },
      { id: "sub4", code: "IT1040", name: "Computer Networks",          credits: 2, section: "A", color: "#FB923C", progress: 80 },
    ],
  },
  {
    id: "s2",
    name: "Semester 2 — 2025",
    year: "2025",
    period: "Jun – Oct",
    active: true,
    weeks: 16,
    subjects: [
      { id: "sub5", code: "IT2010", name: "Data Structures & Algorithms", credits: 3, section: "A", color: "#5478FF", progress: 40 },
      { id: "sub6", code: "IT2020", name: "Software Engineering",         credits: 3, section: "B", color: "#34D399", progress: 25 },
      { id: "sub7", code: "IT2030", name: "Operating Systems",            credits: 3, section: "A", color: "#F87171", progress: 33 },
      { id: "sub8", code: "IT2040", name: "Web Technologies",             credits: 2, section: "C", color: "#FFDE42", progress: 50 },
      { id: "sub9", code: "IT2050", name: "Human Computer Interaction",   credits: 2, section: "B", color: "#A78BFA", progress: 20 },
    ],
  },
  {
    id: "s3",
    name: "Semester 3 — 2024",
    year: "2024",
    period: "Jun – Oct",
    active: false,
    weeks: 16,
    subjects: [
      { id: "sub10", code: "IT3010", name: "Machine Learning",   credits: 3, section: "A", color: "#5478FF", progress: 100 },
      { id: "sub11", code: "IT3020", name: "Cloud Computing",    credits: 3, section: "A", color: "#53CBF3", progress: 100 },
      { id: "sub12", code: "IT3030", name: "Cyber Security",     credits: 2, section: "B", color: "#F87171", progress: 100 },
    ],
  },
];

export const SEED_RESOURCES = [
  { id: "r1", subjectId: "sub5", subjectName: "Data Structures & Algorithms", title: "Week 1 - Introduction to DSA",        type: "pdf", size: "2.4 MB", uploadedBy: "admin", date: "2025-06-10", url: "#" },
  { id: "r2", subjectId: "sub5", subjectName: "Data Structures & Algorithms", title: "Week 2 - Arrays & Linked Lists",       type: "pdf", size: "3.1 MB", uploadedBy: "admin", date: "2025-06-17", url: "#" },
  { id: "r3", subjectId: "sub6", subjectName: "Software Engineering",         title: "SE Lecture Notes - Part 1",            type: "pdf", size: "1.8 MB", uploadedBy: "admin", date: "2025-06-11", url: "#" },
  { id: "r4", subjectId: "sub7", subjectName: "Operating Systems",            title: "OS Chapter 1 - Process Management",    type: "pdf", size: "4.2 MB", uploadedBy: "admin", date: "2025-06-12", url: "#" },
  { id: "r5", subjectId: "sub8", subjectName: "Web Technologies",             title: "HTML & CSS Foundations",               type: "pdf", size: "2.9 MB", uploadedBy: "admin", date: "2025-06-13", url: "#" },
  { id: "r6", subjectId: "sub5", subjectName: "Data Structures & Algorithms", title: "Week 3 - Stacks and Queues",           type: "pdf", size: "2.0 MB", uploadedBy: "student", date: "2025-06-24", url: "#" },
];

export const SEED_REQUESTS = [
  { id: "req1", type: "Batch Rep Registration", date: "2025-06-01", status: "PENDING",  comment: "" },
  { id: "req2", type: "Batch Rep Change",        date: "2025-05-15", status: "APPROVED", comment: "Approved by admin." },
  { id: "req3", type: "Student Request",         date: "2025-04-20", status: "REJECTED", comment: "Duplicate request." },
  { id: "req4", type: "Student Request",         date: "2025-03-10", status: "DELETED",  comment: "Spam." },
];

export const SEED_NOTIFICATIONS = [
  { id: "n1", type: "resource", title: "New resource uploaded",        body: "Week 3 notes added to Data Structures & Algorithms", time: "2 hours ago",  read: false },
  { id: "n2", type: "admin",    title: "Announcement from Admin",      body: "Mid-semester exams scheduled for Week 9",            time: "1 day ago",   read: false },
  { id: "n3", type: "session",  title: "New session added",            body: "Extra lecture for Software Engineering — Fri 3 PM",  time: "2 days ago",  read: true  },
  { id: "n4", type: "resource", title: "Resource updated",             body: "OS Chapter 1 has been updated with new content",     time: "3 days ago",  read: true  },
  { id: "n5", type: "admin",    title: "Holiday notice",               body: "Campus closed on 14th July (National Holiday)",      time: "5 days ago",  read: true  },
];