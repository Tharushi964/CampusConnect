import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { T } from "../../component1/pages/StudentData";
import {
  getAllSessions,
  getAllStudyGroups,
  getSessionsByOrganizer,
  getStudyGroupsByOrganizer,
} from "../../component1/utils/C1api";

const QUICK_QUESTIONS = [
  "session info",
  "group info",
  "deadlines",
  "reminders",
];

const GREETING =
  "Hi! I am your Study Assistant. Ask me about session info, group info, deadlines, or reminders.";

function normalizeStatus(status) {
  return (status || "").toUpperCase();
}

function getSessionDateTime(session) {
  if (!session?.sessionDate || !session?.startTime) {
    return null;
  }
  return new Date(`${session.sessionDate}T${session.startTime}`);
}

function formatSessionLine(session) {
  return `${session.sessionName} on ${session.sessionDate} at ${session.startTime}`;
}

function detectIntent(message) {
  const text = message.toLowerCase();
  if (text.includes("session")) return "session";
  if (text.includes("group")) return "group";
  if (text.includes("deadline") || text.includes("due")) return "deadline";
  if (text.includes("reminder") || text.includes("email")) return "reminder";
  if (text.includes("help")) return "help";
  return "unknown";
}

export default function StudentChatbot() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const t = T(isDark);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: GREETING },
  ]);

  const normalizedRole = (user?.role || "").toLowerCase();

  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, text }]);
  };

  const loadSessions = async () => {
    if ((normalizedRole === "batchrep" || normalizedRole === "admin") && user?.userId) {
      const res = await getSessionsByOrganizer(user.userId);
      return res?.data ?? [];
    }
    const res = await getAllSessions();
    return res?.data ?? [];
  };

  const loadGroups = async () => {
    if ((normalizedRole === "batchrep" || normalizedRole === "admin") && user?.userId) {
      const res = await getStudyGroupsByOrganizer(user.userId);
      return res?.data ?? [];
    }
    const res = await getAllStudyGroups();
    return res?.data ?? [];
  };

  const buildSessionInfo = async () => {
    const sessions = await loadSessions();
    if (sessions.length === 0) {
      return "No sessions found right now.";
    }

    const now = new Date();
    const upcomingScheduled = sessions
      .filter((s) => normalizeStatus(s.status) === "SCHEDULED")
      .filter((s) => {
        const dt = getSessionDateTime(s);
        return dt && dt >= now;
      })
      .sort((a, b) => `${a.sessionDate} ${a.startTime}`.localeCompare(`${b.sessionDate} ${b.startTime}`));

    if (upcomingScheduled.length === 0) {
      return `You have ${sessions.length} total sessions, but no upcoming scheduled sessions.`;
    }

    const next = upcomingScheduled[0];
    const preview = upcomingScheduled.slice(0, 3).map((s) => `- ${formatSessionLine(s)}`).join("\n");
    return `Upcoming scheduled sessions: ${upcomingScheduled.length}\nNext: ${formatSessionLine(next)}\n\nTop upcoming:\n${preview}`;
  };

  const buildGroupInfo = async () => {
    const groups = await loadGroups();
    if (groups.length === 0) {
      return "No study groups found at the moment.";
    }

    const active = groups.filter((g) => normalizeStatus(g.status) === "ACTIVE").length;
    const inactive = groups.length - active;
    const sample = groups.slice(0, 3).map((g) => `- ${g.groupName} (${g.status})`).join("\n");

    return `Total study groups: ${groups.length}\nActive: ${active}\nInactive: ${inactive}\n\nSample groups:\n${sample}`;
  };

  const buildDeadlineInfo = async () => {
    const sessions = await loadSessions();
    if (sessions.length === 0) {
      return "No session deadlines found right now.";
    }

    const now = new Date();
    const next7 = new Date(now);
    next7.setDate(next7.getDate() + 7);

    const deadlines = sessions
      .filter((s) => normalizeStatus(s.status) === "SCHEDULED")
      .filter((s) => {
        const dt = getSessionDateTime(s);
        return dt && dt >= now && dt <= next7;
      })
      .sort((a, b) => `${a.sessionDate} ${a.startTime}`.localeCompare(`${b.sessionDate} ${b.startTime}`));

    if (deadlines.length === 0) {
      return "No scheduled session deadlines in the next 7 days.";
    }

    const list = deadlines.slice(0, 5).map((s) => `- ${formatSessionLine(s)}`).join("\n");
    return `Upcoming deadlines (next 7 days): ${deadlines.length}\n${list}`;
  };

  const buildReminderInfo = async () => {
    return "Session reminder emails are automated for SCHEDULED sessions. By default, reminders are sent about 60 minutes before session start (backend configurable).";
  };

  const resolveReply = async (message) => {
    const intent = detectIntent(message);

    if (intent === "session") return buildSessionInfo();
    if (intent === "group") return buildGroupInfo();
    if (intent === "deadline") return buildDeadlineInfo();
    if (intent === "reminder") return buildReminderInfo();
    if (intent === "help") {
      return "Try these prompts: session info, group info, deadlines, reminders.";
    }

    return "I can help with: session info, group info, deadlines, and reminders. Type one of these to continue.";
  };

  const sendMessage = async (value) => {
    const message = (value || "").trim();
    if (!message || busy) return;

    appendMessage("user", message);
    setInput("");
    setBusy(true);

    try {
      const reply = await resolveReply(message);
      appendMessage("assistant", reply);
    } catch (error) {
      appendMessage("assistant", error?.response?.data?.message || "Unable to fetch details right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[70] w-[calc(100vw-2rem)] sm:w-[380px] max-h-[70vh]">
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl shadow-2xl overflow-hidden`}>
            <div className="px-4 py-3 border-b border-[#5478FF]/20 bg-gradient-to-r from-[#111FA2] via-[#5478FF] to-[#53CBF3] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <p className="text-sm font-bold">Study Assistant</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close chatbot"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3 space-y-2 max-h-[46vh] overflow-y-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[92%] whitespace-pre-line text-xs px-3 py-2 rounded-xl ${m.role === "user" ? "ml-auto bg-[#5478FF] text-white" : `${t.innerBg} ${t.textPrimary} border ${t.innerBorder}`}`}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className={`max-w-[92%] text-xs px-3 py-2 rounded-xl ${t.innerBg} ${t.textPrimary} border ${t.innerBorder}`}>
                  Thinking...
                </div>
              )}
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-2 border-t border-[#5478FF]/15 pt-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-[#5478FF]/30 bg-[#5478FF]/10 text-[#53CBF3] hover:bg-[#5478FF]/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-3 pt-2 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about sessions, groups, deadlines..."
                className={`flex-1 p-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={busy}
                className="h-9 w-9 rounded-xl bg-[#5478FF] text-white flex items-center justify-center hover:bg-[#4060ee] disabled:opacity-60"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 sm:right-6 z-[70] h-14 w-14 rounded-[18px] bg-gradient-to-br from-[#0EA5E9] via-[#14B8A6] to-[#22C55E] text-white shadow-2xl shadow-[#14B8A6]/45 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open study chatbot"
      >
        <Bot size={23} className="text-[#ECFEFF]" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-md">
          <Sparkles size={11} />
        </span>
      </button>
    </>
  );
}
