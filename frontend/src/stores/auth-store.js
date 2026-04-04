import {create} from "zustand/react";
import {persist} from "zustand/middleware";


const initialStore = {
    isAuthenticated: false,
    tokens: null,
    user: null,
    member: null,
}

export const useAuthStore = create(persist((set) => ({
    ...initialStore,

    setIsAuthenticated: (value) => set({isAuthenticated: value}),
    setUser: (data) => set({user: data}),
    setMember: (data) => set({member: data}),
    setTokens: (data) => set({tokens: data}),
    clearStore: () => set(initialStore)
}), {
    name: "auth-store", getStorage: () => localStorage,
}))