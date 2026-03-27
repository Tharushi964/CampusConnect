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

export const createFaculty = (data) => {
    api.post("/api/faculties/create", data);
}
export const updateFaculty = (id, data) => {
    api.put(`/api/faculties/update?id=${id}`, data);
}
export const getFaculty = (id) =>{
 api.get(`/api/faculties/get?id=${id}`);
}
export const getAllFaculties = () => {
    return api.get("/api/faculties/all");
}
export const deleteFaculty = (id) => {
    api.delete(`/api/faculties/delete?id=${id}`);
}


export const createProgram = (data) => {
    api.post("/api/programs/create", data);
}
export const updateProgram = (programId, data) => {
    api.put(`/api/programs/update?programId=${programId}`, data);
}
export const getProgram = (programId) => {
    api.get(`/api/programs/get?programId=${programId}`);
}
export const getAllPrograms = () => {
    return api.get("/api/programs/all");
}
export const deleteProgram = (programId) => {
    api.delete(`/api/programs/delete?programId=${programId}`);
}


export const createBatch = (data) => {
    api.post("/api/batches/create", data);
}
export const updateBatch = (batchId, data) => {
    api.put(`/api/batches/update?batchId=${batchId}`, data);
}
export const getBatch = (batchId) => {
    api.get(`/api/batches/get?batchId=${batchId}`);
}
export const getAllBatches = () => {
    api.get("/api/batches/all");
}
export const deleteBatch = (batchId) => {
    api.delete(`/api/batches/delete?batchId=${batchId}`);
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
  
