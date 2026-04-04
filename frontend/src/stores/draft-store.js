import {create} from "zustand/react";
import {persist} from "zustand/middleware";


const initialStore = {
    project: {
        name: "",
        desc: "",
        tasks: [],
        lead: null,
        members: [],
        startDate: null,
        dueDate: null,
    },
    member: {
        emails: "",
        role: "member"
    },
    task: {
        name: "",
        desc: "",
        assignee: null,
        startDate: null,
        dueDate: null
    },
}

export const useDraftStore = create(persist((set) => ({
    project: initialStore.project,
    member: initialStore.member,
    task: initialStore.task,

    setProject: (field, value) => set((state) => ({project: {...state.project, [field]: value}})),
    setMember: (field, value) => set((state) => ({member: {...state.member, [field]: value}})),
    setTask: (field, value) => set((state) => ({task: {...state.task, [field]: value}})),
    clearProject: () => set({project: initialStore?.project}),
    clearMember: () => set({member: initialStore?.member}),
    clearTask: () => set({task: initialStore?.task}),
    clearStore: () => set({
        project: initialStore.project,
        member: initialStore.member,
        task: initialStore.task
    }),
}), {
    name: "draft-store", getStorage: () => localStorage
}))