import client from "@/api/client.js";

export const getWorkspaces = () => {
    return client.get("/members/tenants")
}

export const getActiveMembers = (query = "", skip = 0, limit = 10) => {
    return client.get("/members", {
        params: {
            "query": query,
            "skip": skip,
            "limit": limit
        }
    })
}

export const getCurrentMember = () => {
    return client.get("members/current-member")
}

export const addMember = (data) => {
    return client.post("/members", data)
}

export const changeMemberRole = (memberId, data) => {
    return client.put(`/members/${memberId}/change-role`, data)
}

export const removeMember = (memberId) => {
    return client.delete(`/members/${memberId}`)
}

