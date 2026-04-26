import { useState, useEffect } from "react";
import {
  Users, CheckCircle, XCircle,
  Plus, Pencil, Trash2, ToggleRight, ToggleLeft,
  Search, X, AlertTriangle, Loader2
} from "lucide-react";

import {
  getAllUsers,
  getAllRoles,
  getAllCampus,
  getAllBatches,
  getAllSemesters,
  getAllFaculties,
  getAllPrograms,
  createUser,
  deleteUser,
  updateUser
} from "../utils/C1api";

import {
  StatCard,
  ThemedModal,
  ThemedField,
  T
} from "../components/AdminUiComponents";

// ─── Role Badge ────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    Admin:       "bg-purple-100 text-purple-800 border-purple-200",
    "Batch Rep": "bg-amber-100  text-amber-800  border-amber-200",
    Student:     "bg-sky-100    text-sky-800    border-sky-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[role] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {role}
    </span>
  );
};

// ─── Status Pill ───────────────────────────────────────────────────
const StatusPill = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-400"}`}/>
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── Delete Confirm Modal ──────────────────────────────────────────
const DeleteConfirm = ({ open, onCancel, onConfirm, isDark }) => {
  const t = T(isDark);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onCancel}/>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className={`w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden ${isDark ? "bg-[#111B3D] border-[#2B3E7A]" : "bg-white border-gray-200"}`}>
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={22} className="text-red-600"/>
            </div>
            <h3 className={`font-bold text-base ${t.textPrimary}`}>Delete User?</h3>
            <p className={`text-sm mt-1 ${t.textSecondary}`}>This will permanently remove the user account.</p>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onCancel} className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold hover:opacity-80 ${isDark ? "border-[#2B3E7A] text-slate-300" : "border-gray-200 text-gray-600"}`}>Cancel</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">Yes, Delete</button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Section Label ─────────────────────────────────────────────────
const FormSection = ({ label, isDark }) => {
  const t = T(isDark);
  return (
    <div className={`flex items-center gap-2 mb-3 mt-5 first:mt-0`}>
      <p className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>{label}</p>
      <div className={`flex-1 h-px ${isDark ? "bg-[#1D2D68]" : "bg-gray-100"}`}/>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────
export default function SectionUsers({ notify, isDark }) {
  const t = T(isDark);

  const [users,     setUsers]     = useState([]);
  const [roles,     setRoles]     = useState([]);
  const [campuses,  setCampuses]  = useState([]);
  const [batches,   setBatches]   = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [programs,  setPrograms]  = useState([]);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null);
  const [confirm,   setConfirm]   = useState(null);
  const [form,      setForm]      = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, roleRes, campusRes, batchRes, semRes, facRes, progRes] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
        getAllCampus(),
        getAllBatches(),
        getAllSemesters(),
        getAllFaculties(),
        getAllPrograms(),
      ]);
      setUsers(userRes.data);
      setRoles(roleRes.data);
      setCampuses(campusRes?.data || []);
      setBatches(batchRes?.data || []);
      setSemesters(semRes?.data || []);
      setFaculties(facRes?.data || []);
      setPrograms(progRes?.data || []);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role) => ({ ADMIN:"Admin", BATCHREP:"Batch Rep", STUDENT:"Student" }[role] ?? role);

  const mappedUsers = users.map(u => {
    const role = roles.find(r => r.roleId === u.roleId);
    return {
      id:       u.userId,
      name:     `${u.firstName} ${u.lastName}`,
      firstName: u.firstName,
      lastName:  u.lastName,
      username:  u.username,
      email:     u.email,
      studentId: u.studentId,
      active:    u.status === "ACTIVE",
      role:      formatRole(role?.roleName),
      roleId:    u.roleId,
      batchId:   u.batchId,
      campusId:  u.campusId,
      facultyId: u.facultyId,
      programId: u.programId,
      semesterId:u.semesterId,
    };
  });

  const displayed = mappedUsers.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const total    = mappedUsers.length;
  const active   = mappedUsers.filter(u => u.active).length;
  const inactive = total - active;

  const hc = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Derived option lists from fetched data
  const roleOptions    = roles.map(r => ({ label: formatRole(r.roleName), value: r.roleId }));
  const campusOptions  = campuses.map(c => ({ label: c.campusName ?? c.name, value: c.campusId ?? c.id }));
  const batchOptions   = batches.map(b => ({ label: b.batchName ?? b.name, value: b.batchId ?? b.id }));
  const facultyOptions = faculties.map(f => ({ label: f.facultyName ?? f.name, value: f.facultyId ?? f.id }));
  const programOptions = programs
    .filter(p => !form.facultyId || String(p.facultyId) === String(form.facultyId))
    .map(p => ({ label: p.programName ?? p.name, value: p.programId ?? p.id }));
  const semesterOptions = semesters
    .filter(s => !form.batchId || String(s.batchId) === String(form.batchId))
    .map(s => ({ label: `Year ${s.yearNumber} - Semester ${s.semesterNumber}`, value: s.semesterId }));

  const selectedRole = roles.find(r => String(r.roleId) === String(form.roleId));
  const isAdmin = selectedRole?.roleName?.toUpperCase() === "ADMIN";

  // ─── Open modals ───────────────────────────────────────────────
  const openAdd = () => {
    setForm({
      firstName: "", lastName: "", studentId: "",
      email: "", username: "", password: "",
      roleId: "", campusId: "", facultyId: "",
      batchId: "", programId: "", semesterId: "",
    });
    setModal({ mode: "add" });
  };

  const openEdit = (u) => {
    setForm({
      firstName:  u.firstName,
      lastName:   u.lastName,
      studentId:  u.studentId ?? "",
      email:      u.email,
      username:   u.username,
      password:   "",            // never pre-fill password
      roleId:     u.roleId ?? "",
      campusId:   u.campusId ?? "",
      facultyId:  u.facultyId ?? "",
      batchId:    u.batchId ?? "",
      programId:  u.programId ?? "",
      semesterId: u.semesterId ?? "",
    });
    setModal({ mode: "edit", id: u.id });
  };

  // ─── Save (create / update) ────────────────────────────────────
  const save = async () => {
    try {
      const toOptionalNumber = (value) => {
        if (value === "" || value === null || value === undefined) return null;
        const num = Number(value);
        return Number.isNaN(num) ? null : num;
      };

      const firstName = (form.firstName ?? "").trim();
      const lastName = (form.lastName ?? "").trim();
      const email = (form.email ?? "").trim();
      const username = (form.username ?? "").trim();
      const password = (form.password ?? "").trim();
      const studentId = (form.studentId ?? "").trim();

      const roleId = toOptionalNumber(form.roleId);
      const campusId = toOptionalNumber(form.campusId);
      const facultyId = isAdmin ? null : toOptionalNumber(form.facultyId);
      const batchId = isAdmin ? null : toOptionalNumber(form.batchId);
      const programId = isAdmin ? null : toOptionalNumber(form.programId);
      const semesterId = isAdmin ? null : toOptionalNumber(form.semesterId);

      if (!firstName || !lastName || !email || !username || !roleId || !campusId) {
        notify("error", "First name, last name, email, username, role, and campus are required.");
        return;
      }

      if (modal?.mode === "add" && !password) {
        notify("error", "Password is required when creating a user.");
        return;
      }

      if (!isAdmin && (!facultyId || !batchId || !programId || !semesterId)) {
        notify("error", "Faculty, program, batch, and semester are required for non-admin users.");
        return;
      }

      setSaving(true);

      const payload = {
        firstName,
        lastName,
        studentId,
        email,
        username,
        roleId,
        campusId,
        facultyId,
        batchId,
        programId,
        semesterId,
        ...(password && { password }),
      };

      if (modal.mode === "add") {
        await createUser(payload);
        notify("success", "User created successfully.");
      } else {
        await updateUser(modal.id, payload);
        notify("success", "User updated successfully.");
      }

      setModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.title;
      notify("error", apiMessage || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle active (placeholder — wire to your status API) ────
  const toggleActive = (id) => {
    notify("info", "Connect status toggle to your API.");
  };

  // ─── Delete ────────────────────────────────────────────────────
  const doDelete = async (id) => {
    try {
      await deleteUser(id);
      notify("success", "User deleted.");
      fetchData();
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.title;
      notify("error", apiMessage ?? "Failed to delete user.");
    } finally {
      setConfirm(null);
    }
  };

  // ─── Skeleton loader row ───────────────────────────────────────
  const SkeletonRow = () => (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-3.5 rounded-full animate-pulse ${isDark ? "bg-[#1C2C5A]" : "bg-gray-100"}`} style={{ width: `${[70,50,80,45,40,30][i]}%` }}/>
        </td>
      ))}
    </tr>
  );

  // ─── Themed select helper (inline, no extra component dep) ────
  const TSelect = ({ label, name, value, options, required }) => (
    <div className="mb-4">
      <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={hc}
        required={required}
        className={`w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]/40 appearance-none ${t.inputBg}`}
      >
        <option value="">Select…</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-full ${t.pageBg} p-6 space-y-6`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black flex items-center gap-2.5 ${t.textPrimary}`}>
            <div className="h-8 w-8 rounded-xl bg-[#5478FF]/15 border border-[#5478FF]/30 flex items-center justify-center">
              <Users size={16} className="text-[#5478FF]"/>
            </div>
            User Management
          </h2>
          <p className={`text-xs mt-0.5 ml-10 ${t.textMuted}`}>Manage student, rep, and admin accounts</p>
        </div>
        <button
          onClick={fetchData}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${isDark ? "border-[#2B3E7A] text-slate-400 hover:text-white hover:bg-[#1C2C5A]" : "border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
        >
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Users"    value={total}    icon={Users}       colorKey="blue"  isDark={isDark}/>
        <StatCard label="Active Users"   value={active}   icon={CheckCircle} colorKey="green" isDark={isDark} sub={total ? `${Math.round((active/total)*100)}% of total` : ""}/>
        <StatCard label="Inactive Users" value={inactive} icon={XCircle}     colorKey="red"   isDark={isDark} sub={total ? `${Math.round((inactive/total)*100)}% of total` : ""}/>
      </div>

      {/* Table Card */}
      <div className={`${t.cardBg} rounded-2xl border ${t.cardBorder} shadow-sm overflow-hidden`}>

        {/* Toolbar */}
        <div className={`flex items-center justify-between gap-3 px-5 py-4 border-b ${t.divider} flex-wrap`}>
          <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 w-64 ${isDark ? "bg-[#0B1230] border-[#2B3E7A] text-white" : "bg-white border-gray-200 text-gray-900"}`}>
            <Search size={13} className={t.textMuted + " shrink-0"}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or username…"
              className="bg-transparent text-sm focus:outline-none flex-1 min-w-0"
            />
            {search && (
              <button onClick={() => setSearch("")} className={`shrink-0 ${t.textMuted} hover:opacity-70`}><X size={12}/></button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${t.textMuted}`}>
              <span className={`font-bold ${t.textSecondary}`}>{displayed.length}</span> of {total} users
            </span>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5478FF] hover:bg-[#4060ee] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#5478FF]/30 transition-colors"
            >
              <Plus size={13}/>Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-[11px] uppercase tracking-wider font-semibold border-b ${t.divider} ${isDark ? "bg-[#0B1230] text-sky-300" : "bg-slate-50 text-gray-500"}`}>
                {["Name","Username","Email","Role","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i}/>)
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-16 text-center ${t.textMuted}`}>
                    <Users size={32} className="mx-auto mb-2 opacity-30"/>
                    <p className="text-sm">{search ? "No users match your search" : "No users found"}</p>
                  </td>
                </tr>
              ) : (
                displayed.map((u, i) => (
                  <tr key={u.id} className={`border-t ${t.divider} transition-colors ${i % 2 === 1 ? (isDark ? "bg-[#0D1535]" : "bg-slate-50/60") : ""} ${isDark ? "hover:bg-[#1C2C5A]" : "hover:bg-blue-50/50"}`}>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#5478FF] to-[#53CBF3] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                          {u.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold text-xs whitespace-nowrap ${t.textPrimary}`}>{u.name}</p>
                          {u.studentId && <p className={`text-[10px] ${t.textMuted}`}>{u.studentId}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sky-500 text-xs font-medium">@{u.username}</td>
                    <td className={`px-4 py-3 text-xs ${t.textSecondary}`}>{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role}/></td>
                    <td className="px-4 py-3"><StatusPill active={u.active}/></td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-500/10 transition-colors"><Pencil size={13}/></button>
                        <button onClick={() => toggleActive(u.id)} title={u.active ? "Deactivate" : "Activate"} className={`p-1.5 rounded-lg transition-colors ${u.active ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}>
                          {u.active ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>}
                        </button>
                        <button onClick={() => setConfirm(u.id)} title="Delete" className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && displayed.length > 0 && (
          <div className={`px-5 py-3 border-t ${t.divider} flex items-center justify-between`}>
            <p className={`text-xs ${t.textMuted}`}>Showing {displayed.length} user{displayed.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-3 text-[11px] font-semibold">
              <span className="text-emerald-500">{active} active</span>
              <span className={t.textMuted}>·</span>
              <span className="text-red-400">{inactive} inactive</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <ThemedModal
        open={!!modal}
        onClose={() => !saving && setModal(null)}
        title={modal?.mode === "add" ? "Add New User" : "Edit User"}
        isDark={isDark}
        wide
      >
        {/* Personal info */}
        <FormSection label="Personal Info" isDark={isDark}/>
        <div className="grid grid-cols-2 gap-x-4">
          <ThemedField label="First Name" name="firstName" value={form.firstName ?? ""} onChange={hc} isDark={isDark} required placeholder="Rehan"/>
          <ThemedField label="Last Name"  name="lastName"  value={form.lastName  ?? ""} onChange={hc} isDark={isDark} required placeholder="Peter"/>
        </div>
        <ThemedField label="Student ID" name="studentId" value={form.studentId ?? ""} onChange={hc} isDark={isDark} placeholder="IT21234567"/>

        {/* Account */}
        <FormSection label="Account" isDark={isDark}/>
        <div className="grid grid-cols-2 gap-x-4">
          <ThemedField label="Username" name="username" value={form.username ?? ""} onChange={hc} isDark={isDark} required placeholder="rehan"/>
          <ThemedField label="Email"    name="email"    value={form.email    ?? ""} onChange={hc} isDark={isDark} required type="email" placeholder="rehan@my.sliit.lk"/>
        </div>
        <ThemedField
          label={modal?.mode === "edit" ? "New Password (leave blank to keep)" : "Password"}
          name="password"
          value={form.password ?? ""}
          onChange={hc}
          isDark={isDark}
          required={modal?.mode === "add"}
          type="password"
          placeholder="••••••••"
        />

        {/* Role & Campus */}
        <FormSection label="Role & Campus" isDark={isDark}/>
        <div className="grid grid-cols-2 gap-x-4">
          <TSelect label="Role"   name="roleId"   value={form.roleId   ?? ""} options={roleOptions}   required/>
          <TSelect label="Campus" name="campusId" value={form.campusId ?? ""} options={campusOptions} required/>
        </div>

        {/* Academic */}
        {!isAdmin && (
          <>
            <FormSection label="Academic" isDark={isDark}/>
            <div className="grid grid-cols-2 gap-x-4">
              <TSelect label="Faculty" name="facultyId" value={form.facultyId ?? ""} options={facultyOptions} required/>
              <TSelect label="Program" name="programId" value={form.programId ?? ""} options={programOptions} required/>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <TSelect label="Batch" name="batchId" value={form.batchId ?? ""} options={batchOptions} required/>
              <TSelect label="Semester" name="semesterId" value={form.semesterId ?? ""} options={semesterOptions} required/>
            </div>
          </>
        )}

        {/* Footer */}
        <div className={`flex justify-end gap-2 mt-5 pt-4 border-t ${t.divider}`}>
          <button
            onClick={() => setModal(null)}
            disabled={saving}
            className={`px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80 disabled:opacity-40 ${isDark ? "border-[#2B3E7A] text-slate-300" : "border-gray-200 text-gray-600"}`}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5478FF] hover:bg-[#4060ee] disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin"/>}
            {modal?.mode === "add" ? "Create User" : "Save Changes"}
          </button>
        </div>
      </ThemedModal>

      {/* Delete Confirm */}
      <DeleteConfirm
        open={!!confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={() => doDelete(confirm)}
        isDark={isDark}
      />
    </div>
  );
}