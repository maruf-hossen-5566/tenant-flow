import client from "@/api/client.js";

export const signup = (data) => {
    return client.post("/auth/register", data)
}

export const login = (data) => {
    return client.post("/auth/login", data, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    })
}

