import { useState, useEffect } from "react";
import {
  ClipboardList, Clock, CheckCircle, XCircle,
  Trash2, Loader2, RefreshCw, CheckCircle2, Ban
} from "lucide-react";

import {
  getPendingBatchRepRequests,
  approveBatchRepRequest,
  rejectBatchRepRequest
} from "../utils/C1api";

import { StatCard, ThemedModal, T, StatusBadge } from "../components/AdminUiComponents";

// ─── Constants ────────────────────────────────────────────────────
const STATUS_FLOW = {
  PENDING:  { next: ["APPROVED", "REJECTED"] },
  APPROVED: { next: [] },
  REJECTED: { next: ["DELETED"] },
  DELETED:  { next: [] },
};

const FILTER_BTNS = [
  { key:"ALL",      label:"All",
    active:"bg-slate-700 text-white",
    inactiveD:"bg-[#0B1230] text-slate-300 border border-[#2B3E7A] hover:bg-[#1C2C5A]",
    inactiveL:"bg-white text-gray-600 border border-gray-200 hover:bg-gray-50" },
  { key:"PENDING",  label:"Pending",
    active:"bg-amber-500 text-white",
    inactiveD:"bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20",
    inactiveL:"bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" },
  { key:"APPROVED", label:"Approved",
    active:"bg-emerald-500 text-white",
    inactiveD:"bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20",
    inactiveL:"bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" },
  { key:"REJECTED", label:"Rejected",
    active:"bg-red-500 text-white",
    inactiveD:"bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20",
    inactiveL:"bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" },
  { key:"DELETED",  label:"Deleted",
    active:"bg-slate-500 text-white",
    inactiveD:"bg-[#0B1230] text-slate-400 border border-[#2B3E7A] hover:bg-[#1C2C5A]",
    inactiveL:"bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100" },
];

const TYPE_STYLES = {
  "Batch Rep Registration": {
    accent: "border-l-blue-400",
    hdrD: "bg-blue-500/10", hdrL: "bg-blue-50",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
  },
  "Batch Rep Change": {
    accent: "border-l-purple-400",
    hdrD: "bg-purple-500/10", hdrL: "bg-purple-50",
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
  },
  "Student Request": {
    accent: "border-l-teal-400",
    hdrD: "bg-teal-500/10", hdrL: "bg-teal-50",
    dot: "bg-teal-500",
    badge: "bg-teal-100 text-teal-800 border-teal-300",
  },
};

const ACTION_STYLES = {
  APPROVED: {
    btn: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200",
    icon: CheckCircle2,
    confirm: "bg-emerald-500 hover:bg-emerald-600",
    banner: "bg-emerald-100 text-emerald-800 border-emerald-300",
    bannerIcon: CheckCircle2,
  },
  REJECTED: {
    btn: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
    icon: Ban,
    confirm: "bg-red-500 hover:bg-red-600",
    banner: "bg-red-100 text-red-800 border-red-300",
    bannerIcon: XCircle,
  },
  DELETED: {
    btn: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
    icon: Trash2,
    confirm: "bg-slate-600 hover:bg-slate-700",
    banner: "bg-slate-100 text-slate-600 border-slate-200",
    bannerIcon: Trash2,
  },
};

// ─── Skeleton card ────────────────────────────────────────────────
const SkeletonCard = ({ isDark }) => (
  <div className={`rounded-2xl border overflow-hidden animate-pulse ${isDark ? "bg-[#111B3D] border-[#2B3E7A]" : "bg-white border-gray-200"}`}>
    <div className={`h-10 ${isDark ? "bg-[#0B1230]" : "bg-slate-50"}`}/>
    <div className="p-5 space-y-2">
      <div className={`h-3.5 w-2/5 rounded-full ${isDark ? "bg-[#1C2C5A]" : "bg-gray-100"}`}/>
      <div className={`h-3 w-1/4 rounded-full ${isDark ? "bg-[#1C2C5A]" : "bg-gray-100"}`}/>
      <div className={`h-3 w-1/3 rounded-full mt-3 ${isDark ? "bg-[#1C2C5A]" : "bg-gray-100"}`}/>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
export default function SectionRequests({ notify, isDark }) {
  const t = T(isDark);

  const [requests,     setRequests]     = useState([]);
  const [statusFilt,   setStatusFilt]   = useState("ALL");
  const [commentModal, setCommentModal] = useState(null);
  const [comment,      setComment]      = useState("");
  const [loading,      setLoading]      = useState(true);
  const [actioning,    setActioning]    = useState(false);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getPendingBatchRepRequests();
      setRequests(res.data.map(r => ({
        id:     r.requestId,
        from:   r.username,
        date:   new Date(r.createdAt).toLocaleString(),
        status: r.status,
        type:   "Batch Rep Registration",
        raw:    r,
      })));
    } catch (error) {
      if (error?.response?.status === 403) {
        notify?.("error", "Access denied. Please log in as an admin account.");
      } else {
        notify?.("error", "Failed to load requests");
      }
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    PENDING:  requests.filter(r => r.status === "PENDING").length,
    APPROVED: requests.filter(r => r.status === "APPROVED").length,
    REJECTED: requests.filter(r => r.status === "REJECTED").length,
    DELETED:  requests.filter(r => r.status === "DELETED").length,
  };

  const displayed = statusFilt === "ALL" ? requests : requests.filter(r => r.status === statusFilt);
  const actionLabel = (a) => ({ APPROVED:"Approve", REJECTED:"Reject", DELETED:"Delete" }[a] ?? a);

  const executeAction = async () => {
    const { id, action } = commentModal;
    setActioning(true);
    try {
      if (action === "APPROVED") await approveBatchRepRequest(id);
      else if (action === "REJECTED") await rejectBatchRepRequest(id);
      notify?.(action === "APPROVED" ? "success" : "info", `Request ${action.toLowerCase()}.`);
      loadRequests();
    } catch (error) {
      if (error?.response?.status === 403) {
        notify?.("error", "Access denied. Please log in as an admin account.");
      } else {
        notify?.("error", "Action failed. Please try again.");
      }
    } finally {
      setActioning(false);
      setCommentModal(null);
      setComment("");
    }
  };

  const modalAction = commentModal ? ACTION_STYLES[commentModal.action] : null;

  // ──────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-full ${t.pageBg} p-6 space-y-6`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black flex items-center gap-2.5 ${t.textPrimary}`}>
            <div className="h-8 w-8 rounded-xl bg-[#5478FF]/15 border border-[#5478FF]/30 flex items-center justify-center">
              <ClipboardList size={16} className="text-[#5478FF]"/>
            </div>
            Request Overview
          </h2>
          <p className={`text-xs mt-0.5 ml-10 ${t.textMuted}`}>Review and action incoming batch rep requests</p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${isDark ? "border-[#2B3E7A] text-slate-400 hover:text-white hover:bg-[#1C2C5A]" : "border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Pending"  value={counts.PENDING}  icon={Clock}       colorKey="amber" isDark={isDark}/>
        <StatCard label="Approved" value={counts.APPROVED} icon={CheckCircle} colorKey="green" isDark={isDark}/>
        <StatCard label="Rejected" value={counts.REJECTED} icon={XCircle}     colorKey="red"   isDark={isDark}/>
        <StatCard label="Deleted"  value={counts.DELETED}  icon={Trash2}      colorKey="gray"  isDark={isDark}/>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_BTNS.map(btn => (
          <button
            key={btn.key}
            onClick={() => setStatusFilt(btn.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilt === btn.key ? btn.active : (isDark ? btn.inactiveD : btn.inactiveL)}`}
          >
            {btn.label}
            <span className="ml-1.5 opacity-75">
              ({btn.key === "ALL" ? requests.length : counts[btn.key] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} isDark={isDark}/>)}
        </div>
      ) : displayed.length === 0 ? (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl py-16 text-center shadow-sm`}>
          <ClipboardList size={36} className={`mx-auto mb-3 ${t.textMuted} opacity-30`}/>
          <p className={`text-sm font-semibold ${t.textMuted}`}>No requests found</p>
          <p className={`text-xs mt-1 ${t.textMuted} opacity-60`}>
            {statusFilt !== "ALL" ? `No ${statusFilt.toLowerCase()} requests` : "All clear — nothing to action"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(r => {
            const rc = TYPE_STYLES[r.type] ?? TYPE_STYLES["Student Request"];
            const sc = STATUS_FLOW[r.status] ?? {};

            return (
              <div
                key={r.id}
                className={`${t.cardBg} rounded-2xl border border-l-4 ${rc.accent} ${t.cardBorder} shadow-sm overflow-hidden`}
              >
                {/* Card header strip */}
                <div className={`${isDark ? rc.hdrD : rc.hdrL} px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 border-b ${t.divider}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${rc.dot}`}/>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rc.badge}`}>{r.type}</span>
                    <span className={`text-[10px] font-mono ${t.textMuted}`}>#{r.id}</span>
                  </div>
                  <StatusBadge status={r.status}/>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1 min-w-0">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#5478FF] to-[#53CBF3] flex items-center justify-center text-white text-[11px] font-black shrink-0">
                        {r.from?.slice(0,2).toUpperCase() ?? "??"}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${t.textPrimary}`}>{r.from}</p>
                        <p className={`text-[10px] flex items-center gap-1 ${t.textMuted}`}>
                          <Clock size={10}/>{r.date}
                        </p>
                      </div>
                    </div>

                    {/* Raw detail chips */}
                    {r.raw && (
                      <div className="flex gap-2 flex-wrap mt-2 pl-11">
                        {r.raw.batchName && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? "bg-[#0B1230] border-[#2B3E7A] text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                            {r.raw.batchName}
                          </span>
                        )}
                        {r.raw.facultyName && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? "bg-[#0B1230] border-[#2B3E7A] text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                            {r.raw.facultyName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {sc.next?.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {sc.next.map(ns => {
                        const as = ACTION_STYLES[ns];
                        const Icon = as.icon;
                        return (
                          <button
                            key={ns}
                            onClick={() => { setComment(""); setCommentModal({ id:r.id, action:ns }); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${as.btn}`}
                          >
                            <Icon size={12}/>{actionLabel(ns)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Action confirmation modal ── */}
      <ThemedModal
        open={!!commentModal}
        onClose={() => !actioning && setCommentModal(null)}
        title={commentModal ? `${actionLabel(commentModal.action)} Request` : ""}
        isDark={isDark}
      >
        {commentModal && modalAction && (() => {
          const BannerIcon = modalAction.bannerIcon;
          return (
            <>
              {/* Action banner */}
              <div className={`flex items-start gap-2.5 rounded-xl p-3 mb-4 text-sm font-medium border ${modalAction.banner}`}>
                <BannerIcon size={16} className="mt-0.5 shrink-0"/>
                <span>
                  Mark this request as <strong>{commentModal.action}</strong>.
                  {commentModal.action === "DELETED" ? " This cannot be undone." : ""}
                </span>
              </div>

              {/* Comment */}
              <div className="mb-5">
                <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                  Comment / Feedback <span className={`font-normal ${t.textMuted}`}>(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the requester…"
                  className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 resize-none ${t.inputBg}`}
                />
              </div>

              {/* Footer */}
              <div className={`flex justify-end gap-2 pt-4 border-t ${t.divider}`}>
                <button
                  onClick={() => setCommentModal(null)}
                  disabled={actioning}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80 disabled:opacity-40 ${isDark ? "border-[#2B3E7A] text-slate-300" : "border-gray-200 text-gray-600"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={actioning}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-60 ${modalAction.confirm}`}
                >
                  {actioning && <Loader2 size={13} className="animate-spin"/>}
                  Confirm {actionLabel(commentModal.action)}
                </button>
              </div>
            </>
          );
        })()}
      </ThemedModal>
    </div>
  );
}