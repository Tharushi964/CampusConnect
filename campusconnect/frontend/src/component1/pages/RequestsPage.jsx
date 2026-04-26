/**
 * RequestsPage.jsx
 * Student request center with create + history views.
 */

import { useMemo, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { T, SEED_REQUESTS } from "../../component1/pages/StudentData";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";

const REQUEST_TYPES = [
  "Batch Rep Registration",
  "Batch Rep Change",
  "Student Request",
];

const normalizeStatus = (status) => (status || "").toUpperCase();

const StatusBadge = ({ status }) => {
  const normalized = normalizeStatus(status);
  const variants = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-300",
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
    DELETED: "bg-slate-200 text-slate-700 border-slate-300",
  };

  const icon = {
    PENDING: <Clock size={11} />,
    APPROVED: <CheckCircle size={11} />,
    REJECTED: <XCircle size={11} />,
    DELETED: <Trash2 size={11} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        variants[normalized] || "bg-slate-100 text-slate-700 border-slate-300"
      }`}
    >
      {icon[normalized] || <Filter size={11} />}
      {normalized || "UNKNOWN"}
    </span>
  );
};

export default function RequestsPage() {
  const { isDark } = useTheme();
  const t = T(isDark);

  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [form, setForm] = useState({ type: "", comment: "" });

  const filtered = useMemo(() => {
    return requests
      .filter((req) => {
        const matchesSearch =
          !search ||
          req.type.toLowerCase().includes(search.toLowerCase()) ||
          (req.comment || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "ALL" || normalizeStatus(req.status) === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [requests, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => normalizeStatus(r.status) === "PENDING").length,
      approved: requests.filter((r) => normalizeStatus(r.status) === "APPROVED").length,
      rejected: requests.filter((r) => normalizeStatus(r.status) === "REJECTED").length,
    };
  }, [requests]);

  const submitRequest = () => {
    if (!form.type) return;
    const newRequest = {
      id: `req-${Date.now()}`,
      type: form.type,
      date: new Date().toISOString().split("T")[0],
      status: "PENDING",
      comment: form.comment.trim(),
    };
    setRequests((prev) => [newRequest, ...prev]);
    setForm({ type: "", comment: "" });
    setShowForm(false);
  };

  return (
    <div className={`min-h-full ${t.pageBg} p-6`}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-xl font-black flex items-center gap-2 ${t.textPrimary}`}>
            <ClipboardList size={20} className="text-[#5478FF]" /> My Requests
          </h2>
          <p className={`text-sm mt-0.5 ${t.textSecondary}`}>
            Track your submitted requests and create new ones
          </p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#5478FF] text-white rounded-xl text-sm font-bold hover:bg-[#4060ee] shadow-sm shadow-[#5478FF]/30 transition-colors"
        >
          <Plus size={14} />
          {showForm ? "Close Form" : "New Request"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: counts.total, color: "border-blue-500/20 bg-blue-500/10 text-blue-400" },
          { label: "Pending", value: counts.pending, color: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
          { label: "Approved", value: counts.approved, color: "border-green-500/20 bg-green-500/10 text-green-400" },
          { label: "Rejected", value: counts.rejected, color: "border-red-500/20 bg-red-500/10 text-red-400" },
        ].map((s) => (
          <div key={s.label} className={`${t.cardBg} rounded-2xl border ${t.cardBorder} p-4 flex items-center gap-3`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border text-xl font-black ${s.color}`}>
              {s.value}
            </div>
            <p className={`text-xs font-medium ${t.textSecondary}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-5 mb-5`}>
          <p className={`text-sm font-bold mb-4 ${t.textPrimary}`}>Create Request</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Request Type</label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className={`appearance-none w-full border rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/30 ${t.selectBg}`}
                >
                  <option value="">Select request type</option>
                  {REQUEST_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`} />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>Comment (optional)</label>
              <input
                value={form.comment}
                onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Add details for the admin"
                className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/30 ${t.inputBg}`}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setForm({ type: "", comment: "" });
                setShowForm(false);
              }}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold ${t.cardBorder} ${t.textSecondary} hover:opacity-80`}
            >
              Cancel
            </button>
            <button
              onClick={submitRequest}
              disabled={!form.type}
              className="px-4 py-2 rounded-xl bg-[#5478FF] text-white text-sm font-semibold hover:bg-[#4060ee] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div
          className="flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs"
          style={{ background: isDark ? "#0D1235" : "white", borderColor: isDark ? "rgba(84,120,255,0.3)" : "#e5e7eb" }}
        >
          <Search size={14} className={t.textMuted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            className="bg-transparent text-sm focus:outline-none flex-1"
            style={{ color: isDark ? "white" : "#374151" }}
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`appearance-none border rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer ${t.selectBg}`}
          >
            {["ALL", "PENDING", "APPROVED", "REJECTED", "DELETED"].map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All Statuses" : s}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${t.textMuted}`} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl py-16 text-center`}>
          <ClipboardList size={40} className={`mx-auto mb-3 ${t.textMuted}`} />
          <p className={`font-bold ${t.textPrimary}`}>No requests found</p>
          <p className={`text-sm mt-1 ${t.textSecondary}`}>Create a new request or change your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => (
            <div key={req.id} className={`${t.cardBg} rounded-2xl border ${t.cardBorder} p-4 hover:border-[#5478FF]/40 transition-colors`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm ${t.textPrimary}`}>{req.type}</p>
                  <p className={`text-xs mt-1 ${t.textSecondary}`}>Submitted on {req.date}</p>
                  {req.comment ? (
                    <p className={`text-xs mt-2 ${t.textSecondary}`}>Comment: {req.comment}</p>
                  ) : (
                    <p className={`text-xs mt-2 ${t.textMuted}`}>No comment provided</p>
                  )}
                </div>
                <StatusBadge status={req.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
