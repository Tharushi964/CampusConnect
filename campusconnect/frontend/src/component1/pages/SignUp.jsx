import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { colors } from "../../contexts/ColorContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Loading from "../../components/Loading";
import NotificationBanner from "../../components/NotificationBanner";
import {createUser} from "../../component1/utils/C1api";

// ── Dummy data (replace with API calls when ready) ──────────────
const ROLES = [
  { id: 1, label: "Student" },
  { id: 2, label: "Lecturer" },
  { id: 3, label: "Admin" },
];

const CAMPUSES = [
  { id: 1, label: "Malabe" },
  { id: 2, label: "Kandy" },
  { id: 3, label: "Matara" },
  { id: 4, label: "Kurunegala" },
];

const BATCHES = [
  { id: 1, label: "Batch 2021" },
  { id: 2, label: "Batch 2022" },
  { id: 3, label: "Batch 2023" },
  { id: 4, label: "Batch 2024" },
];

export default function SignUp() {
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    username: "",
    password: "",
    roleId: "",
    batchId: "",
    campusId: "",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ show: false, type: "", message: "" });
    setLoading(true);

    try {
      await createUser({
        ...form,
        roleId: Number(form.roleId),
        batchId: Number(form.batchId),
        campusId: Number(form.campusId),
      });

      setLoading(false);
      setNotification({ show: true, type: "success", message: "Account created successfully!" });

      setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1500);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setNotification({
        show: true,
        type: "error",
        message: error?.response?.data?.message ?? "Sign up failed. Please try again.",
      });
    }
  };

  const inputCls = `w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]
    ${theme.inputBg} ${theme.border} ${theme.text}`;

  const labelCls = `block text-xs font-medium mb-1.5 ${theme.textSecondary}`;

  return (
    <div className={`min-h-screen ${theme.background}`}>

      {loading && <Loading loading={loading} message="Creating account..." />}

      <NavBar
        isDark={isDark}
        toggleTheme={toggleTheme}
        activeSection={null}
        setActiveSection={() => {}}
      />

      <div className="flex items-center justify-center min-h-screen pt-16 pb-8 px-4">
        <form
          onSubmit={handleSubmit}
          className={`${theme.cardBg} p-8 rounded-2xl shadow-md w-full max-w-2xl border ${theme.border}`}
        >
          {/* Notification */}
          {notification && (
            <NotificationBanner
              show={notification.show}
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ show: false, type: "", message: "" })}
            />
          )}

          {/* Header */}
          <h2 className={`text-2xl font-bold mb-1 text-center ${theme.text}`}>
            Create account
          </h2>
          <p className={`text-sm text-center mb-6 ${theme.textSecondary}`}>
            Fill in the details below to register
          </p>

          {/* ── Two-column grid ── */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* First Name */}
            <div>
              <label className={labelCls}>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your First Name"
                value={form.firstName}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className={labelCls}>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your Last Name"
                value={form.lastName}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* Student ID */}
            <div>
              <label className={labelCls}>Student ID</label>
              <input
                type="text"
                name="studentId"
                placeholder="ITxxxxxxxx"
                value={form.studentId}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="someone@my.sliit.lk"
                value={form.email}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* Username */}
            <div>
              <label className={labelCls}>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your Username"
                value={form.username}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            {/* Role */}
            <div>
              <label className={labelCls}>Role</label>
              <select
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="" disabled>Select a role</option>
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Campus */}
            <div>
              <label className={labelCls}>Campus</label>
              <select
                name="campusId"
                value={form.campusId}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="" disabled>Select a campus</option>
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Batch — full width */}
            <div className="col-span-2">
              <label className={labelCls}>Batch</label>
              <select
                name="batchId"
                value={form.batchId}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="" disabled>Select a batch</option>
                {BATCHES.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full mt-6 bg-gradient-to-r ${theme.gradientPrimary} text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
          >
            Create Account
          </button>

          {/* Back to login */}
          <p className={`text-xs text-center mt-4 ${theme.textSecondary}`}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className={`font-semibold underline ${theme.link}`}
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}