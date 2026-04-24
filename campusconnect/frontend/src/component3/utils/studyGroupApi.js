import api from "../../utils/axiosInstance";

/* =========================================================
   STUDY GROUP APIs
========================================================= */

// Create Study Group
export const createGroup = (data) => {
    return api.post("/api/groups/create", data);
};

// Update Study Group
export const updateGroup = (groupId, data) => {
    return api.put("/api/groups/update", data, {
        params: { id: groupId }
    });
};

// Get All Study Groups
export const getAllGroups = () => {
    return api.get("/api/groups/all");
};

// Get Group By ID
export const getGroupById = (groupId) => {
    return api.get("/api/groups/getById", {
        params: { id: groupId }
    });
};

export const getBySemester = (semesterId) => {
    return api.get("/api/groups/getBysemester", {
        params: { semesterId: semesterId }
    });
};

// Delete Study Group
export const deleteGroup = (groupId) => {
    return api.delete("/api/groups/delete", {
        params: { id: groupId }
    });
};

/* =========================================================
    GROUP MEMBER APIs
========================================================= */

// Join Group
export const joinGroup = (data) => {
    return api.post("/api/group-members/join", data);
};

// Leave Group
export const leaveGroup = (groupId, userId) => {
    return api.delete("/api/group-members/leave", {
        params: { groupId, userId }
    });
};

// Get Members of a Group
export const getGroupMembers = (groupId) => {
    return api.get("/api/group-members/getMembers", {
        params: { groupId }
    });
};