import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import api from "../utils/axiosInstance"; // your existing axios instance

// ─── Emoji → feedbackType mapping ────────────────────────────────
// API accepts: POSITIVE | NEUTRAL | NEGATIVE
const RATING_TO_TYPE = {
  1: "NEGATIVE",
  2: "NEGATIVE",
  3: "NEUTRAL",
  4: "POSITIVE",
  5: "POSITIVE",
};

const EMOJIS = [
  { val: 1, emoji: "😢", title: "Very bad"  },
  { val: 2, emoji: "😕", title: "Bad"       },
  { val: 3, emoji: "😐", title: "Neutral"   },
  { val: 4, emoji: "🙂", title: "Good"      },
  { val: 5, emoji: "😄", title: "Great"     },
];

const CATEGORIES = [
  { key: "Suggestion", label: "Suggestion"          },
  { key: "Issue",      label: "Something's not right"},
  { key: "Compliment", label: "Compliment"           },
];

const MAX_CHARS = 500;

/**
 * FeedbackForm — session-end popup for STUDENT / BATCH_REP
 *
 * Props:
 *   open      {boolean}   — controls visibility
 *   onClose   {function}  — called when the user closes / cancels / after submit
 *   isDark    {boolean}   — from useTheme()
 *   userId    {number}    — from useAuth()  e.g. auth.userId
 *   sessionId {number}    — ID of the session the user just left
 *
 * Usage:
 *   <FeedbackForm
 *     open={feedbackOpen}
 *     onClose={() => setFeedbackOpen(false)}
 *     isDark={isDark}
 *     userId={auth.userId}
 *     sessionId={currentSessionId}
 *   />
 */
export default function FeedbackForm({ open, onClose, isDark, userId, sessionId }) {
  const [rating,    setRating]    = useState(null);
  const [category,  setCategory]  = useState(null);
  const [text,      setText]      = useState("");
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const textareaRef = useRef(null);

  // Reset whenever the modal re-opens
  useEffect(() => {
    if (open) {
      setRating(null);
      setCategory(null);
      setText("");
      setError("");
      setSubmitted(false);
      setLoading(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleTextChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!rating)      { setError("Please select a rating.");     return; }
    if (!category)    { setError("Please select a category.");   return; }
    if (!text.trim()) { setError("Please write your feedback."); return; }
    setError("");

    try {
      setLoading(true);

      // ─── POST /api/feedbacks ──────────────────────────────────
      await api.post("/api/feedbacks", {
        feedbackType: RATING_TO_TYPE[rating], // "POSITIVE" | "NEUTRAL" | "NEGATIVE"
        message:      text.trim(),
        status:       "ACTIVE",
        userId:       userId,
        sessionId:    sessionId,
      });
      // ─────────────────────────────────────────────────────────

      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // ─── Theme tokens (mirrors your T() helper) ──────────────────────
  const card    = isDark ? "bg-[#111B3D] border-[#2B3E7A]"      : "bg-white border-gray-200";
  const divider = isDark ? "border-[#2B3E7A]"                    : "border-gray-100";
  const txtPrim = isDark ? "text-white"                           : "text-gray-900";
  const txtSec  = isDark ? "text-slate-300"                       : "text-gray-600";
  const txtMute = isDark ? "text-slate-500"                       : "text-gray-400";
  const inputBg = isDark
    ? "bg-[#0B1230] border-[#2B3E7A] text-white placeholder-slate-500 focus:border-[#5478FF]"
    : "bg-slate-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#5478FF]";
  const catBase = isDark
    ? "border-[#2B3E7A] bg-[#0B1230] text-slate-300 hover:border-[#5478FF]/60"
    : "border-gray-200 bg-slate-50 text-gray-600 hover:border-[#5478FF]/50";
  const catActive = "border-[#5478FF] bg-[#5478FF]/10 text-[#5478FF] font-semibold";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — pinned to top-center */}
      <div className="fixed inset-0 z-[80] flex items-start justify-center pt-8 px-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${card}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5478FF] inline-block" />
              <p className={`font-bold text-sm ${txtPrim}`}>Your feedback</p>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-[#1C2C5A]"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          {submitted ? (
            // ── Success state ────────────────────────────────────
            <div className="px-6 py-10 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className={`font-bold text-base mb-1 ${txtPrim}`}>Thanks for your feedback!</p>
              <p className={`text-sm ${txtSec}`}>Your response has been recorded.</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060EE] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            // ── Form state ───────────────────────────────────────
            <div className="px-5 py-5 space-y-5">
              <p className={`text-xs text-center ${txtSec}`}>
                We'd love to hear your thoughts to help us improve.
              </p>

              {/* Emoji rating */}
              <div>
                <p className={`text-xs font-semibold mb-2.5 text-center ${txtSec}`}>
                  How would you rate your experience?
                </p>
                <div className="flex justify-center gap-3">
                  {EMOJIS.map(({ val, emoji, title }) => (
                    <button
                      key={val}
                      title={title}
                      onClick={() => setRating(val)}
                      className="transition-all duration-150"
                      style={{
                        fontSize: 28,
                        lineHeight: 1,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        opacity:  rating === val ? 1 : rating ? 0.3 : 0.4,
                        filter:   rating === val ? "grayscale(0)" : "grayscale(0.8)",
                        transform: rating === val ? "scale(1.28)" : "scale(1)",
                        padding: "2px 4px",
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <p className={`text-xs font-semibold mb-2 ${txtSec}`}>Feedback category</p>
                <div className="flex gap-2">
                  {CATEGORIES.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`flex-1 py-2 px-1 text-xs rounded-xl border transition-all ${
                        category === key ? catActive : catBase
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text area */}
              <div>
                <p className={`text-xs font-semibold mb-1.5 ${txtSec}`}>
                  Leave your feedback below
                </p>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Tell us what you think…"
                  rows={4}
                  className={`w-full p-3 border rounded-xl text-sm outline-none resize-none transition-colors ${inputBg}`}
                />
                <p className={`text-right text-[10px] mt-0.5 ${txtMute}`}>
                  {text.length} / {MAX_CHARS}
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 font-medium -mt-2">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={onClose}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                    isDark
                      ? "border-[#2B3E7A] text-slate-300 hover:text-white hover:bg-[#1C2C5A]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#5478FF] hover:bg-[#4060EE] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}