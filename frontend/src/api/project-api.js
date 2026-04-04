import client from "@/api/client.js";

export const getProjects = (query = "", skip = 0, limit = 10) => {
    return client.get("/projects",
        {
            params: {
                "query": query,
                "skip": skip,
                "limit": limit
            }
        }
    )
}

export const getWorkingProjects = () => {
    return client.get("/projects/working")
}

export const getProjectDetails = (projectId) => {
    return client.get(`/projects/${projectId}`)
}

export const getProjectMembers = (projectId, query = "", skip = 0, limit = 10) => {
    return client.get(`/projects/${projectId}/members`,
        {
            params: {
                "query": query,
                "skip": skip,
                "limit": limit
            }
        }
    )
}

export const createProject = (data) => {
    return client.post("/projects", data)
}

export const updateProject = (projectId, data) => {
    return client.put(`/projects/${projectId}`, data)
}
export const deleteProject = (projectId) => {
    return client.delete(`/projects/${projectId}`)
}

export const joinProject = (projectId) => {
    return client.put(`projects/${projectId}/join`)
}

export const removeMember = (projectId, memberId) => {
    return client.delete(`projects/${projectId}/member/${memberId}`)
}