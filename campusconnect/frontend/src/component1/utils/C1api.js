import api from "../../utils/axiosInstance"

export const createUser = (data) => {
    return api.post(`/api/users/create`, data);
}
export const updateUser = (userId, data) => {
    return api.post(`/api/users/update?userId=${userId}`, data);
}
export const getAllUsers = () => {
    return api.get(`/api/users/all`);
}
export const getUserById = (userId) => {
    return api.get(`/api/users/get?userId=${userId}`);
}
export const deleteUser = (userId) => {
    return api.delete(`/api/users/delete?userId=${userId}`);
}

export const getAllRoles = () => {
    return api.get(`/api/roles/all`);
}

export const verifyEmailToken = (token) => {
  return axios.get(`/auth/verify-email?token=${token}`);
};


export const getPendingBatchRepRequests = () => {
    return api.get("/api/admin/batchrep/requests");
}
export const approveBatchRepRequest = (requestId) =>{
    return api.put(`/api/admin/batchrep/approve?requestId=${requestId}`);
}
export const rejectBatchRepRequest = (requestId) =>{
    return api.put(`/api/admin/batchrep/reject?requestId=${requestId}`); 
}


export const createResource = (data) => {
    return api.post("/api/resources/create", data);
}
export const updateResource = (id, data) => {
    return api.put(`/api/resources/update?resourseId=${id}`, data);
}
export const getResourceById = (id) => {
    return api.get(`/api/resources/get?resourseId=${id}`);
}
export const getAllResource = () => {
    return api.get(`/api/resources/all`);
}
export const getResourceBySubject = (id) => {
    return api.get(`/api/resources/getBySubject?subjectId=${id}`);
}
export const deleteResource = (id) => {
    return api.delete(`/api/resources/delete?resourceId=${id}`);
}

// Create or Update Rating
export const createOrUpdateRating = (data) => {
    return api.post("/api/ratings", data);
};

// Get Rating by ID
export const getRatingById = (id) => {
    return api.get(`/api/ratings/${id}`);
};

// Get Ratings by Entity (SUBJECT, RESOURCE, SESSION, GROUP)
export const getRatingsByEntity = (entityType, entityId) => {
    return api.get("/api/ratings/entity", {
        params: { entityType, entityId }
    });
};

// Get Ratings by User
export const getRatingsByUser = (userId) => {
    return api.get(`/api/ratings/user/${userId}`);
};

// Get All Ratings
export const getAllRatings = () => {
    return api.get("/api/ratings");
};

// Delete Rating
export const deleteRating = (id) => {
    return api.delete(`/api/ratings/${id}`);
};

// ─── FEEDBACK API — add this block to c1.api.js ────────────────────────────
// Import this alongside userAPI, bookingAPI, ticketAPI

export const feedbackAPI = {
  getAll: () =>
    api.get("/api/feedbacks"),

  getByFaculty: (facultyName) =>
    api.get(`/api/feedbacks/faculty/${encodeURIComponent(facultyName)}`),

  getByProgram: (programName) =>
    api.get(`/api/feedbacks/program/${encodeURIComponent(programName)}`),

  getByProgramAndYear: (programName, year) =>
    api.get(`/api/feedbacks/program/${encodeURIComponent(programName)}/year/${year}`),

  getByProgramYearSemester: (programName, year, semester) =>
    api.get(`/api/feedbacks/program/${encodeURIComponent(programName)}/year/${year}/semester/${semester}`),

  getById: (feedbackId) =>
    api.get(`/api/feedbacks/${feedbackId}`),
};


