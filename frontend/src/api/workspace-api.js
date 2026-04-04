import client from "@/api/client.js";

export const getWorkspaces = () => {
    return client.get("/tenants")
}

export const activeWorkspaceDetails = () => {
    return client.get("/tenants/details")
}

export const createWorkspace = (data) => {
    return client.post("/tenants", data)
}

export const updateWorkspace = (data) => {
    return client.put("/tenants", data)
}

export const deleteWorkspace = () => {
    return client.delete(`/tenants`)
}
