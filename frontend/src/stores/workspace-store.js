import {create} from "zustand/react";
import {persist} from "zustand/middleware";


const initialStore = {
    workspaces: null,
    activeWorkspace: null,
    activeProjects: null,
    activeMembers: null,
}

export const useWorkspaceStore = create(persist((set) => ({
    ...initialStore,

    setWorkspaces: (data) => set({workspaces: data}),
    setActiveWorkspace: (data) => set({activeWorkspace: data}),
    setActiveProjects: (data) => set({activeProjects: data}),
    setActiveMembers: (data) => set({activeMembers: data}),
    clearStore: () => set(initialStore)
}), {
    name: "workspace-store", getStorage: () => localStorage,
}))