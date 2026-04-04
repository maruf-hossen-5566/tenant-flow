import client from "@/api/client.js";

export const getPendingInvitations = (query = "", skip = 0, limit = 10) => {
    return client.get("/invitations/pending", {
        params: {
            "query": query,
            "skip": skip,
            "limit": limit
        }
    })
}

export const getMyInvitations = () => {
    return client.get("/invitations")
}

export const getInvitationInfo = (invitationId) => {
    return client.get(`/invitations/${invitationId}`)
}

export const acceptInvitation = (invitationId) => {

    return client.post(`/invitations/${invitationId}/accept-invite` )
}

export const deleteInvitation = (inviteId) => {
    return client.delete(`/invitations/${inviteId}`)
}