import client from "@/api/client.js";

export const createTask = (data) => {
    return client.post("/tasks", data)
}

export const getTasks = (projectId, query="", skip = 0, limit = 10) => {
    return client.get(`/tasks/${projectId}`, {
        params: {
            "query": query,
            "skip": skip,
            "limit": limit,
        }
    })
}


export const getAllTasks = (query = "", skip = 0, limit = 10, filterBy = "all") => {
    return client.get(`/tasks`, {
        params: {
            "query": query,
            "skip": skip,
            "limit": limit,
            "filter_by": filterBy
        }
    })
}


export const updateTask = (taskId, projectId, data) => {
    return client.put(`/tasks/${taskId}/${projectId}`, data)
}

export const getTaskMember = (taskId) => {
    return client.get(`/tasks/${taskId}/members`)
}


export const getTaskProject = (taskId) => {
    return client.get(`/tasks/${taskId}/project`)
}

export const deleteTask = (taskId, projectId) => {
    return client.delete(`/tasks/${taskId}/${projectId}`)
}