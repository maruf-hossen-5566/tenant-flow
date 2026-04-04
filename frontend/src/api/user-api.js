import client from "@/api/client.js";
import {getRefreshToken} from "@/lib/tokens.js";


export const getAccountDetails = () => {
    return client.get("/users/me")
}


export const updateAccountDetails = (data) => {
    return client.put("/users", data)
}

export const changePassword = (data) => {
    return client.put("/users/change-pass", data)
}

export const refreshToken = () => {
    const refreshToken = getRefreshToken()

    return client.post("/users/token-refresh", {refresh_token: refreshToken})
}

export const deleteAccount = () => {
    return client.delete("/users/")
}



