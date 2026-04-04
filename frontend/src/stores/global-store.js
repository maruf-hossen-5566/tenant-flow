import {persist} from "zustand/middleware";
import {create} from "zustand/react";


const initialStore = {
    isDark: true,
    isLoading: false
}

export const useGlobalStore = create(persist((set) => ({
    ...initialStore,

    setIsDark: (value) => set({
        isDark: value
    }),
    setIsLoading: (value) => set({
        isLoading: value
    }),
    clearStore: () => set(initialStore)
}), {
    name: "global-storage", getStorage: () => localStorage,
}))