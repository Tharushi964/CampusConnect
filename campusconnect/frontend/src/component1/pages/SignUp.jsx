import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { colors } from "../../contexts/ColorContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Loading from "../../components/Loading";
import NotificationBanner from "../../components/NotificationBanner";
import {
  createUser,
  getAllBatches,
  getAllCampus,
  getAllFaculties,
  getAllPrograms,
  getAllRoles,
  getAllSemesters,
} from "../../component1/utils/C1api";

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
    facultyId: "",
    programId: "",
    semesterId: "",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    const fetchLookups = async () => {
      setLookupLoading(true);
      try {
        const [rolesRes, campusesRes, batchesRes, facultiesRes, programsRes, semestersRes] = await Promise.allSettled([
          getAllRoles(),
          getAllCampus(),
          getAllBatches(),
          getAllFaculties(),
          getAllPrograms(),
          getAllSemesters(),
        ]);

        const getData = (result) =>
          result.status === "fulfilled" ? result.value?.data ?? [] : [];

        setRoles(getData(rolesRes));
        setCampuses(getData(campusesRes));
        setBatches(getData(batchesRes));
        setFaculties(getData(facultiesRes));
        setPrograms(getData(programsRes));
        setSemesters(getData(semestersRes));

        const failedLookups = [rolesRes, campusesRes, batchesRes, facultiesRes, programsRes, semestersRes]
          .filter((result) => result.status === "rejected");

        if (failedLookups.length > 0) {
          setNotification({
            show: true,
            type: "error",
            message: "Some form options could not be loaded. You can still continue with available fields.",
          });
        }
      } catch (error) {
        console.error(error);
        setNotification({
          show: true,
          type: "error",
          message: "Failed to load form data. Please refresh and try again.",
        });
      } finally {
        setLookupLoading(false);
      }
    };

    fetchLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "facultyId") {
        next.programId = "";
      }

      if (name === "batchId") {
        next.semesterId = "";
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ show: false, type: "", message: "" });
    setLoading(true);

    try {
      const selectedRole = roles.find((role) => String(role.roleId) === String(form.roleId));
      const isAdmin = selectedRole?.roleName?.toUpperCase() === "ADMIN";

      const toOptionalNumber = (value) => {
        if (value === "" || value === null || value === undefined) return null;
        const numeric = Number(value);
        return Number.isNaN(numeric) ? null : numeric;
      };

      const roleId = toOptionalNumber(form.roleId);
      const campusId = toOptionalNumber(form.campusId);
      const batchId = isAdmin ? null : toOptionalNumber(form.batchId);
      const facultyId = isAdmin ? null : toOptionalNumber(form.facultyId);
      const programId = isAdmin ? null : toOptionalNumber(form.programId);
      const semesterId = isAdmin ? null : toOptionalNumber(form.semesterId);

      if (!roleId || !campusId) {
        throw new Error("Role and campus are required.");
      }

      if (!isAdmin && (!batchId || !facultyId || !programId || !semesterId)) {
        throw new Error("Batch, faculty, program, and semester are required for non-admin signup.");
      }

      await createUser({
        ...form,
        roleId,
        campusId,
        batchId,
        facultyId,
        programId,
        semesterId,
      });

      setLoading(false);
      setNotification({ show: true, type: "success", message: "Account created successfully!" });

      setTimeout(() => {
        navigate("/campusconnect/login", { replace: true });
      }, 1500);
    } catch (error) {
      console.error(error);
      setLoading(false);

      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.title ||
        error?.message;

      setNotification({
        show: true,
        type: "error",
        message: apiMessage || "Sign up failed. Please try again.",
      });
    }
  };

  const inputCls = `w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]
    ${theme.inputBg} ${theme.border} ${theme.text}`;

  const labelCls = `block text-xs font-medium mb-1.5 ${theme.textSecondary}`;
  const selectedRole = roles.find((role) => String(role.roleId) === String(form.roleId));
  const isAdmin = selectedRole?.roleName?.toUpperCase() === "ADMIN";
  const matchedPrograms = programs.filter(
    (program) => !form.facultyId || String(program.facultyId) === String(form.facultyId)
  );
  const matchedSemesters = semesters.filter(
    (semester) => !form.batchId || String(semester.batchId) === String(form.batchId)
  );
  const filteredPrograms = form.facultyId && matchedPrograms.length === 0 ? programs : matchedPrograms;
  const filteredSemesters = form.batchId && matchedSemesters.length === 0 ? semesters : matchedSemesters;
  const hasAcademicLookupData =
    faculties.length > 0 && programs.length > 0 && batches.length > 0 && semesters.length > 0;
  const cannotCreateSelectedRole = !isAdmin && !hasAcademicLookupData;

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

          {lookupLoading && (
            <p className={`text-xs text-center mb-4 ${theme.textSecondary}`}>Loading form options...</p>
          )}

          {cannotCreateSelectedRole && (
            <p className={`text-xs text-center mb-4 ${theme.textSecondary}`}>
              Batch, semester, faculty, or program data is missing. Ask an admin to create those records first.
            </p>
          )}

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
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
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
                {campuses.map((campus) => (
                  <option key={campus.campusId} value={campus.campusId}>
                    {campus.campusName}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty */}
            <div>
              <label className={labelCls}>Faculty</label>
              <select
                name="facultyId"
                value={form.facultyId}
                onChange={handleChange}
                required={!isAdmin}
                disabled={isAdmin}
                className={inputCls}
              >
                <option value="" disabled>Select a faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.facultyId} value={faculty.facultyId}>
                    {faculty.facultyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Program */}
            <div>
              <label className={labelCls}>Program</label>
              <select
                name="programId"
                value={form.programId}
                onChange={handleChange}
                required={!isAdmin}
                disabled={isAdmin || programs.length === 0}
                className={inputCls}
              >
                <option value="" disabled>Select a program</option>
                {filteredPrograms.map((program) => (
                  <option key={program.programId} value={program.programId}>
                    {program.programName}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch — full width */}
            <div>
              <label className={labelCls}>Batch</label>
              <select
                name="batchId"
                value={form.batchId}
                onChange={handleChange}
                required={!isAdmin}
                disabled={isAdmin}
                className={inputCls}
              >
                <option value="" disabled>Select a batch</option>
                {batches.map((batch) => (
                  <option key={batch.batchId} value={batch.batchId}>
                    {batch.batchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className={labelCls}>Semester</label>
              <select
                name="semesterId"
                value={form.semesterId}
                onChange={handleChange}
                required={!isAdmin}
                disabled={isAdmin || semesters.length === 0}
                className={inputCls}
              >
                <option value="" disabled>Select a semester</option>
                {filteredSemesters.map((semester) => (
                  <option key={semester.semesterId} value={semester.semesterId}>
                    {`Year ${semester.yearNumber} - Semester ${semester.semesterNumber}`}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div className="col-span-2">
                <p className={`text-xs ${theme.textSecondary}`}>
                  Admin accounts do not require faculty, program, batch, or semester.
                </p>
              </div>
            )}

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || lookupLoading || cannotCreateSelectedRole}
            className={`w-full mt-6 bg-gradient-to-r ${theme.gradientPrimary} text-white py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90`}
          >
            Create Account
          </button>

          {/* Back to login */}
          <p className={`text-xs text-center mt-4 ${theme.textSecondary}`}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/campusconnect/login")}
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