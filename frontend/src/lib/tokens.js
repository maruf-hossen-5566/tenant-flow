export const setTokens = (tokes) => {
    const accessToken = Object.hasOwn(tokes, "access_token") ? tokes["access_token"] : null
    const refreshToken = Object.hasOwn(tokes, "refresh_token") ? tokes["refresh_token"] : null

    if (accessToken) {
        localStorage.setItem("access-token", JSON.stringify(accessToken))
    }
    if (refreshToken) {
        localStorage.setItem("refresh-token", JSON.stringify(refreshToken))
    }
}

export const getTokens = () => {
    return {
        "access-token": getAccessToken(), "refresh-token": getRefreshToken(),
    }
}

export const removeTokens = () => {
    localStorage.removeItem("access-token")
    localStorage.removeItem("refresh-token")
}


export const getAccessToken = () => {
    return JSON.parse(localStorage.getItem("access-token")) || null
}

export const getRefreshToken = () => {
    return JSON.parse(localStorage.getItem("refresh-token")) || null
}

