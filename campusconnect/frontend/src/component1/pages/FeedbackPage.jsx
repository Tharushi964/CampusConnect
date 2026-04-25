import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { T } from "../../component1/pages/StudentData";
import {
  createFeedback,
  getAllSessions,
  getFeedbacksByUser,
} from "../../component1/utils/C1api";

const STAR_VALUES = [1, 2, 3, 4, 5];

function Stars({ value }) {
  return (
    <div className="flex items-center gap-1">
      {STAR_VALUES.map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= value ? "fill-amber-400 text-amber-400" : "text-slate-400"}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const t = T(isDark);

  const [sessions, setSessions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    sessionId: "",
    rating: 0,
    message: "",
  });

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => `${b.sessionDate} ${b.startTime}`.localeCompare(`${a.sessionDate} ${a.startTime}`)),
    [sessions]
  );

  const loadData = async () => {
    if (!user?.userId) {
      setLoading(false);
      setError("Please login to access feedback.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [sessionRes, feedbackRes] = await Promise.all([
        getAllSessions(),
        getFeedbacksByUser(user.userId),
      ]);

      const sessionData = sessionRes?.data ?? [];
      const feedbackData = feedbackRes?.data ?? [];

      setSessions(sessionData);
      setFeedbacks(feedbackData);

      setForm((prev) => ({
        ...prev,
        sessionId: prev.sessionId || (sessionData[0]?.sessionId ? String(sessionData[0].sessionId) : ""),
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load feedback data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.userId]);

  const submit = async () => {
    if (!user?.userId) {
      setError("Please login to submit feedback.");
      return;
    }

    if (!form.sessionId) {
      setError("Please select a session.");
      return;
    }

    if (!form.rating || form.rating < 1 || form.rating > 5) {
      setError("Please select a star rating between 1 and 5.");
      return;
    }

    if (!form.message.trim()) {
      setError("Please add a comment.");
      return;
    }

    setSaving(true);
    setNotice("");
    setError("");

    try {
      await createFeedback({
        feedbackType: "SESSION",
        rating: Number(form.rating),
        message: form.message.trim(),
        status: "ACTIVE",
        userId: Number(user.userId),
        sessionId: Number(form.sessionId),
      });

      setNotice("Feedback submitted successfully.");
      setForm((prev) => ({ ...prev, rating: 0, message: "" }));
      await loadData();
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.title;
      setError(apiMessage || "Failed to submit feedback.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-full ${t.pageBg} p-6 space-y-6`}>
      <div>
        <h2 className={`font-black text-xl flex items-center gap-2 ${t.textPrimary}`}>
          <MessageSquare size={18} className="text-[#5478FF]" />
          Session Feedback
        </h2>
        <p className={`text-sm mt-1 ${t.textSecondary}`}>
          Rate your sessions with stars and add comments.
        </p>
      </div>

      {notice && (
        <div className="px-3 py-2 rounded-xl text-sm border border-emerald-300/40 text-emerald-500 bg-emerald-500/10">
          {notice}
        </div>
      )}
      {error && (
        <div className="px-3 py-2 rounded-xl text-sm border border-red-300/40 text-red-400 bg-red-500/10">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 lg:col-span-2`}>
          <h3 className={`font-bold text-sm mb-3 ${t.textPrimary}`}>Add Feedback</h3>

          <div className="mb-3">
            <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Session *</label>
            <select
              value={form.sessionId}
              onChange={(e) => setForm((p) => ({ ...p, sessionId: e.target.value }))}
              className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 ${t.inputBg}`}
            >
              <option value="">Select session</option>
              {sortedSessions.map((s) => (
                <option key={s.sessionId} value={s.sessionId}>
                  {`${s.sessionName} (${s.sessionDate} ${s.startTime})`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Rating *</label>
            <div className="flex items-center gap-1">
              {STAR_VALUES.map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, rating: star }))}
                  className="p-1 rounded-lg hover:bg-amber-500/10"
                  aria-label={`Set rating ${star}`}
                >
                  <Star
                    size={22}
                    className={star <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-400"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Comment *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={4}
              placeholder="Share your experience about this session..."
              className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 resize-none ${t.inputBg}`}
            />
          </div>

          <button
            onClick={submit}
            disabled={saving || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5478FF] text-white text-sm font-bold hover:bg-[#4060ee] disabled:opacity-60"
          >
            <Send size={14} /> Submit Feedback
          </button>
        </div>

        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 lg:col-span-3`}>
          <h3 className={`font-bold text-sm mb-3 ${t.textPrimary}`}>My Feedback</h3>

          {loading ? (
            <p className={`text-sm ${t.textMuted}`}>Loading feedback...</p>
          ) : feedbacks.length === 0 ? (
            <p className={`text-sm ${t.textMuted}`}>No feedback submitted yet.</p>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {feedbacks
                .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
                .map((fb) => {
                  const session = sessions.find((s) => String(s.sessionId) === String(fb.sessionId));
                  return (
                    <div key={fb.feedbackId} className={`${t.innerBg} ${t.innerBorder} border rounded-xl p-3`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-xs font-bold ${t.textPrimary}`}>
                          {session?.sessionName || `Session #${fb.sessionId}`}
                        </p>
                        <Stars value={fb.rating || 0} />
                      </div>
                      <p className={`text-xs ${t.textSecondary}`}>{fb.message}</p>
                      <p className={`text-[11px] mt-1 ${t.textMuted}`}>
                        {session?.sessionDate ? `Session date: ${session.sessionDate}` : ""}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
