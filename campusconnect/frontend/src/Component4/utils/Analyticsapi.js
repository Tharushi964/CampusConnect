// Analyticsapi.js
import api from "../../utils/axiosInstance";

// ── Raw API calls (re-exported for direct use elsewhere) ──────────
export const getAllUsers      = ()           => api.get("/api/users/all");
export const getUserById      = (userId)     => api.get(`/api/users/get?userId=${userId}`);
export const createUser       = (data)       => api.post("/api/users/create", data);
export const updateUser       = (userId, d)  => api.post(`/api/users/update?userId=${userId}`, d);
export const deleteUser       = (userId)     => api.delete(`/api/users/delete?userId=${userId}`);

export const getAllRoles       = ()           => api.get("/api/roles/all");

export const getAllCampus      = ()           => api.get("/api/campus/all");
export const getCampusById    = (id)         => api.get(`/api/campus/getById?campusId=${id}`);

export const getAllFaculties   = ()           => api.get("/api/faculties/all");
export const getFaculty        = (id)         => api.get(`/api/faculties/get?id=${id}`);
export const getFacultyByCampus= (id)         => api.get(`/api/faculties/getByCampus?id=${id}`);
export const createFaculty    = (data)       => api.post("/api/faculties/create", data);
export const updateFaculty    = (id, data)   => api.put(`/api/faculties/update?id=${id}`, data);
export const deleteFaculty    = (id)         => api.delete(`/api/faculties/delete?id=${id}`);

export const getAllPrograms    = ()           => api.get("/api/programs/all");
export const getProgram       = (id)         => api.get(`/api/programs/get?programId=${id}`);
export const getProgramsByFaculty = (id)     => api.get(`/api/programs/getByFaculty?facultyId=${id}`);
export const createProgram    = (data)       => api.post("/api/programs/create", data);
export const updateProgram    = (id, data)   => api.put(`/api/programs/update?programId=${id}`, data);
export const deleteProgram    = (id)         => api.delete(`/api/programs/delete?programId=${id}`);

export const getAllBatches     = ()           => api.get("/api/batches/all");
export const getBatch         = (id)         => api.get(`/api/batches/get?batchId=${id}`);
export const getBatchByCurriculum = (id)     => api.get(`/api/batches/getByCurriculum?curriculumId=${id}`);
export const createBatch      = (data)       => api.post("/api/batches/create", data);
export const updateBatch      = (id, data)   => api.put(`/api/batches/update?batchId=${id}`, data);
export const deleteBatch      = (id)         => api.delete(`/api/batches/delete?batchId=${id}`);

export const getAllSemesters   = ()           => api.get("/api/semesters/all");
export const getSemester      = (id)         => api.get(`/api/semesters/get?semesterId=${id}`);
export const getSemesterByBatch=(id)         => api.get(`/api/semesters/getByBatch?batchId=${id}`);
export const createSemester   = (data)       => api.post("/api/semesters/create", data);
export const updateSemester   = (id, data)   => api.put(`/api/semesters/update?semesterId=${id}`, data);
export const deleteSemester   = (id)         => api.delete(`/api/semesters/delete?semesterId=${id}`);

export const getAllSubjects    = ()           => api.get("/api/subjects/all");
export const getSubjectById   = (id)         => api.get(`/api/subjects/get?subjectId=${id}`);
export const getSubjectsBySemester = (id)    => api.get(`/api/subjects/getBySemester?semesterId=${id}`);
export const createSubject    = (data)       => api.post("/api/subjects/create", data);
export const updateSubject    = (id, data)   => api.put(`/api/subjects/update?subjectId=${id}`, data);
export const deleteSubject    = (id)         => api.delete(`/api/subjects/delete?subjectId=${id}`);

export const getAllResources   = ()           => api.get("/api/resources/all");
export const getResourceById  = (id)         => api.get(`/api/resources/get?id=${id}`);
export const getResourcesBySubject = (id)    => api.get(`/api/resources/getBySubject?subjectId=${id}`);
export const createResource   = (data)       => api.post("/api/resources/create", data);
export const updateResource   = (id, data)   => api.put(`/api/resources/update?id=${id}`, data);
export const deleteResource   = (id)         => api.delete(`/api/resources/delete?id=${id}`);

export const getAllCurriculum  = ()           => api.get("/api/curriculums/all");
export const getCurriculum    = (id)         => api.get(`/api/curriculums/get?curriculumId=${id}`);
export const getCurriculumByProgram = (id)   => api.get(`/api/curriculums/getByProgram?programId=${id}`);
export const createCurriculum = (data)       => api.post("/api/curriculums/create", data);
export const updateCurriculum = (id, data)   => api.put(`/api/curriculums/update?curriculumId=${id}`, data);
export const deleteCurriculum = (id)         => api.delete(`/api/curriculums/delete?curriculumId=${id}`);

export const getPendingBatchRepRequests = ()       => api.get("/api/admin/batchrep/requests");
export const approveBatchRepRequest     = (id)     => api.put(`/api/admin/batchrep/approve?requestId=${id}`);
export const rejectBatchRepRequest      = (id)     => api.put(`/api/admin/batchrep/reject?requestId=${id}`);

export const getResourceRecommendations = (subjectId)        => api.get(`/api/ratings/top-resources-by-subject?subjectId=${subjectId}`);
export const getSubjectRecommendations = (semesterId)        => api.get(`/api/ratings/top-subjects?semesterId=${semesterId}`);


// ── Analytics API object used by AnalyticsDashboard ──────────────
export const analyticsApi = {

  getDashboardData: async () => {
    // Fire all independent calls in parallel
    const [
      usersRes,
      facultiesRes,
      programsRes,
      batchesRes,
      semestersRes,
      subjectsRes,
      resourcesRes,
      campusRes,
      batchRepRes,
    ] = await Promise.allSettled([
      getAllUsers(),
      getAllFaculties(),
      getAllPrograms(),
      getAllBatches(),
      getAllSemesters(),
      getAllSubjects(),
      getAllResources(),
      getAllCampus(),
      getPendingBatchRepRequests()
    ]);

    // Safe unwrap — falls back to [] on error
    const ok   = (r) => r.status === "fulfilled" ? (r.value?.data ?? []) : [];
    const users      = ok(usersRes);
    const faculties  = ok(facultiesRes);
    const programs   = ok(programsRes);
    const batches    = ok(batchesRes);
    const semesters  = ok(semestersRes);
    const subjects   = ok(subjectsRes);
    const resources  = ok(resourcesRes);
    const campuses   = ok(campusRes);
    const batchRepRequests = ok(batchRepRes);

    // ── Derived counts ──────────────────────────────────────
    const students   = users.filter(u => u.roleId === 3 || u.role === "student");
    const admins     = users.filter(u => u.roleId === 1   || u.role === "admin");
    const batchReps  = users.filter(u => u.roleId === 2 || u.role === "BATCHREP" || u.role === "BATCH_REP");
    const activePrograms = programs.filter(p => p.status === "ACTIVE" || p.isActive === true || p.active === true);
    const pendingRequests  = batchRepRequests.filter(r => r.status === "PENDING"  || r.status === "pending").length;

    // ── Batch stats (students per batch) ────────────────────
    const batchStats = batches.map(b => {
      const batchStudents = students.filter(u =>
        u.batchId === b.batchId || u.batch_id === b.batchId
      );
      const batchRepsCount = batchReps.filter(u =>
        u.batchId === b.batchId
      ).length;
      const max = Math.max(...batches.map(x =>
        students.filter(u => u.batchId === x.batchId).length
      ), 1);
      return {
        batchName:           b.batchName ?? b.name ?? `Batch ${b.batchId}`,
        startDate:           b.startDate ?? b.start_date ?? "",
        endDate:             b.endDate   ?? b.end_date   ?? "",
        studentCount:        batchStudents.length,
        representativeCount: batchRepsCount,
        percentage:          Math.round((batchStudents.length / max) * 100),
      };
    });

    // ── Faculty stats (programs + students per faculty) ──────
    const facultyStats = faculties.map(f => {
      const facultyPrograms = programs.filter(p =>
        p.facultyId === f.id || p.faculty_id === f.id ||
        p.facultyId === f.facultyId
      );
      const facultyStudents = students.filter(u =>
        u.faculyId === f.id || u.facultyId === f.id ||
        u.faculyId === f.facultyId
      );
      return {
        name:         f.facultyName ?? f.name ?? `Faculty ${f.id}`,
        programCount: facultyPrograms.length,
        studentCount: facultyStudents.length,
      };
    });

    // ── Program stats (batches + students per program) ───────
    const programStats = programs.map(p => {
      const programBatches  = batches.filter(b =>
        b.programId === p.programId || b.program_id === p.programId
      );
      const programStudents = students.filter(u =>
        u.programId === p.programId
      );
      const isActive =
        p.status === "ACTIVE" || p.isActive === true || p.active === true;
      return {
        programName:  p.programName ?? p.name ?? `Program ${p.programId}`,
        batchCount:   programBatches.length,
        studentCount: programStudents.length,
        isActive,
      };
    });

    // ── Users by role ────────────────────────────────────────
    const usersByRole = [
      { role: "Admin",     count: admins.length,   color: "bg-red-500"   },
      { role: "Student",   count: students.length,  color: "bg-blue-500"  },
      { role: "Batch Rep", count: batchReps.length, color: "bg-green-500" },
    ];

    // ── Users per campus ─────────────────────────────────────
    const usersPerCampus = campuses.map(c => ({
      campus: c.campusName ?? c.name ?? `Campus ${c.campusId}`,
      count:  users.filter(u =>
        u.campusId === c.campusId || u.campus_id === c.campusId
      ).length,
    }));

    // ── Users per batch ──────────────────────────────────────
    const usersPerBatch = batches.map(b => ({
      batch: b.batchName ?? b.name ?? `Batch ${b.batchId}`,
      count: users.filter(u => u.batchId === b.batchId).length,
    }));

    // ── Semester + subject counts ────────────────────────────
    const subjectsPerSemester = semesters.map(s => ({
      label: s.semesterName ?? `Y${s.yearNumber} S${s.semesterNumber}` ?? `Sem ${s.semesterId}`,
      count: subjects.filter(sub =>
        sub.semesterId === s.semesterId
      ).length,
    }));

    // ── Resources per subject (top 6) ────────────────────────
    const resourcesPerSubject = subjects.slice(0, 6).map(sub => ({
      label: sub.subjectName ?? sub.name ?? `Subject ${sub.subjectId}`,
      count: resources.filter(r => r.subjectId === sub.subjectId).length,
    }));

    return {
      // Summary counts
      totalStudents:   students.length,
      totalFaculties:  faculties.length,
      activePrograms:  activePrograms.length,
      totalBatches:    batches.length,
      totalUsers:      users.length,
      totalSemesters:  semesters.length,
      totalSubjects:   subjects.length,
      totalResources:  resources.length,
      pendingRequests: pendingRequests.length,

      // Detailed lists
      batchStats,
      facultyStats,
      programStats,
      usersByRole,
      usersPerCampus,
      usersPerBatch,
      subjectsPerSemester,
      resourcesPerSubject,

      // Raw lists (for tables in sub-components)
      users,
      batches,
      faculties,
      programs,
      semesters,
      subjects,
      resources,
      campuses,

      // Registration trend — derived from user createdAt if available
      userRegistrationTrend: {
        weekly:  buildWeeklyTrend(users),
        monthly: buildMonthlyTrend(users),
      },

      // Study groups / sessions / attendance — kept as empty arrays
      // until those API endpoints exist
      totalStudyGroups: 0, activeStudyGroups: 0,
      totalGroupMembers: 0, totalGroupSessions: 0,
      studyGroups: [],
      totalSessions: 0, upcomingSessions: 0, completedSessions: 0,
      sessions: [],
      peakSessionHour: "—",
      sessionsPerDay: [],
      attendance: { averageRate: 0, totalRecords: 0, sessionsWithAttendance: 0 },
      studentAttendance: [],
      batchRepRequests,          // ← real data now
      pendingRequests, approvedRequests: 0, rejectedRequests: 0,
      activeBatchReps: batchReps.length,
      totalStudyGroupsCount: 0,
      totalSessionsCount: 0,
    };
  },

  // ── Recommendations + Popular Batches (keep dummy as requested) ──
  getRecommendations: async (userId) => {
    try {
      const response = await api.get(`/recommendations/${userId}`);
      return response.data;
    } catch {
      return [
        { programName: "Advanced Web Development",    faculty: "Faculty of Computing",   description: "Learn modern web technologies including React, Node.js, and Cloud Computing", matchScore: 95, enrolledStudents: 45 },
        { programName: "Data Science & Analytics",    faculty: "Faculty of Computing",   description: "Master data analysis, machine learning, and visualization techniques",        matchScore: 88, enrolledStudents: 52 },
        { programName: "Mobile App Development",      faculty: "Faculty of Engineering", description: "Build iOS and Android apps using React Native and Flutter",                    matchScore: 82, enrolledStudents: 38 },
        { programName: "Cloud Computing",             faculty: "Faculty of Computing",   description: "AWS, Azure, and Google Cloud Platform fundamentals",                           matchScore: 78, enrolledStudents: 41 },
        { programName: "Cyber Security Fundamentals", faculty: "Faculty of Engineering", description: "Learn security principles, ethical hacking, and network security",             matchScore: 75, enrolledStudents: 34 },
      ];
    }
  },

  getPopularBatches: async () => {
    try {
      const response = await api.get("/batches/popular");
      return response.data;
    } catch {
      return [
        { batchName: "Batch 2024A", programName: "Computer Science",     studentCount: 52, popularityScore: 4.8 },
        { batchName: "Batch 2024B", programName: "Software Engineering", studentCount: 48, popularityScore: 4.5 },
        { batchName: "Batch 2024C", programName: "Data Science",         studentCount: 35, popularityScore: 4.2 },
        { batchName: "Batch 2023D", programName: "Cyber Security",       studentCount: 42, popularityScore: 4.0 },
        { batchName: "Batch 2024E", programName: "AI & ML",              studentCount: 38, popularityScore: 4.3 },
      ];
    }
  },
};

// ── Trend helpers ─────────────────────────────────────────────────
function buildWeeklyTrend(users) {
  // Count registrations per day for the last 7 days
  const counts = Array(7).fill(0);
  const now = Date.now();
  users.forEach(u => {
    const created = u.createdAt ?? u.created_at ?? u.registeredAt;
    if (!created) return;
    const diffDays = Math.floor((now - new Date(created).getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) counts[6 - diffDays]++;
  });
  return counts;
}

function buildMonthlyTrend(users) {
  // Count registrations per month for the last 8 months
  const counts = Array(8).fill(0);
  const now = new Date();
  users.forEach(u => {
    const created = u.createdAt ?? u.created_at ?? u.registeredAt;
    if (!created) return;
    const d = new Date(created);
    const diffMonths =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diffMonths >= 0 && diffMonths < 8) counts[7 - diffMonths]++;
  });
  return counts;
}


