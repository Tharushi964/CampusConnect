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

export const getAllCampus = () => {
    return api.get(`/api/campus/all`);
}

export const createCampus = (data) => {
    return api.post("/api/campus", data);
}

export const updateCampus = (campusId, data) => {
    return api.put(`/api/campus?campusId=${campusId}`, data);
}

export const activateCampus = (campusId) => {
    return api.put(`/api/campus/activate?campusId=${campusId}`);
}

export const deactivateCampus = (campusId) => {
    return api.put(`/api/campus/deactivate?campusId=${campusId}`);
}

export const createFaculty = (data) => {
    return api.post("/api/faculties/create", data);
}
export const updateFaculty = (id, data) => {
    return api.put(`/api/faculties/update?id=${id}`, data);
}
export const getFaculty = (id) =>{
 return api.get(`/api/faculties/get?id=${id}`);
}
export const getAllFaculties = () => {
    return api.get("/api/faculties/all");
}
export const deleteFaculty = (id) => {
    return api.delete(`/api/faculties/delete?id=${id}`);
}


export const createProgram = (data) => {
    return api.post("/api/programs/create", data);
}
export const updateProgram = (programId, data) => {
    return api.put(`/api/programs/update?programId=${programId}`, data);
}
export const getProgram = (programId) => {
    return api.get(`/api/programs/get?programId=${programId}`);
}
export const getAllPrograms = () => {
    return api.get("/api/programs/all");
}
export const deleteProgram = (programId) => {
    return api.delete(`/api/programs/delete?programId=${programId}`);
}


export const createBatch = (data) => {
    return api.post("/api/batches/create", data);
}
export const updateBatch = (batchId, data) => {
    return api.put(`/api/batches/update?batchId=${batchId}`, data);
}
export const getBatch = (batchId) => {
    return api.get(`/api/batches/get?batchId=${batchId}`);
}
export const getAllBatches = () => {
    return api.get("/api/batches/all");
}
export const deleteBatch = (batchId) => {
    return api.delete(`/api/batches/delete?batchId=${batchId}`);
}

export const getAllSemesters = () => {
    return api.get("/api/semesters/all");
}

export const createSemester = (data) => {
    return api.post("/api/semesters/create", data);
}

export const getAllCurriculums = () => {
    return api.get("/api/curriculums/all");
}

export const createCurriculum = (data) => {
    return api.post("/api/curriculums/create", data);
}

export const updateCurriculum = (curriculumId, data) => {
    return api.put(`/api/curriculums/update?curriculumId=${curriculumId}`, data);
}

export const createSubject = (data) => {
    return api.post("/api/subjects/create", data);
}

export const getAllSubjects = () => {
    return api.get("/api/subjects/all");
}

export const getSubjectsBySemester = (semesterId) => {
    return api.get(`/api/subjects/getBySemester?semesterId=${semesterId}`);
}


export const getPendingBatchRepRequests = () => {
    return api.get("/api/admin/batchrep/requests");
}
export const approveBatchRepRequest = (requestId) =>{
    return api.put(`/api/admin/batchrep/approve?requestId=${requestId}`);
}
export const rejectBatchRepRequest = (requestId) =>{
    return api.put(`/api/admin/batchrep/reject?requestId=${requestId}`); 
}

export const createStudyGroup = (data) => {
    return api.post("/api/groups/create", data);
}

export const updateStudyGroup = (groupId, data) => {
    return api.put(`/api/groups/update?id=${groupId}`, data);
}

export const deleteStudyGroup = (groupId) => {
    return api.delete(`/api/groups/delete?id=${groupId}`);
}

export const getAllStudyGroups = () => {
    return api.get("/api/groups/all");
}

export const getStudyGroupsBySemester = (semesterId) => {
    return api.get(`/api/groups/getBySemester?semesterId=${semesterId}`);
}

export const getStudyGroupsByOrganizer = (userId) => {
    return api.get(`/api/groups/getByOrganizer?userId=${userId}`);
}

export const createSession = (data) => {
    return api.post("/api/sessions/create", data);
}

export const updateSession = (sessionId, data) => {
    return api.put(`/api/sessions/update?id=${sessionId}`, data);
}

export const deleteSession = (sessionId) => {
    return api.delete(`/api/sessions/delete?id=${sessionId}`);
}

export const getAllSessions = () => {
    return api.get("/api/sessions/all");
}

export const getSessionsByGroup = (groupId) => {
    return api.get(`/api/sessions/getByGroup?groupId=${groupId}`);
}

export const getSessionsByOrganizer = (userId) => {
    return api.get(`/api/sessions/getByOrganizer?userId=${userId}`);
}

export const getPastSessionsByGroup = (groupId) => {
    return api.get(`/api/sessions/pastByGroup?groupId=${groupId}`);
}

export const createFeedback = (data) => {
    return api.post("/api/feedbacks", data);
}

export const getFeedbacksByUser = (userId) => {
    return api.get(`/api/feedbacks/user/${userId}`);
}

export const getFeedbacksBySession = (sessionId) => {
    return api.get(`/api/feedbacks/session/${sessionId}`);
}

export const getAllFeedbacks = () => {
    return api.get("/api/feedbacks");
}
  
