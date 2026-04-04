import {getCurrentMember, getActiveMembers} from "@/api/membership-api.js";
import {getWorkspaces} from "@/api/workspace-api.js";
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {deleteProject, getProjects, getWorkingProjects} from "@/api/project-api.js";
import {getTasks} from "@/api/task-api.js";
import projects from "@/components/workspace/projects.jsx";
import {useAuthStore} from "@/stores/auth-store.js";


export const fetchAndSetWorkspaces = async () => {
    try {
        console.log("Setting workspaces...")
        const res = await getWorkspaces();
        useWorkspaceStore?.setState({workspaces: res?.data?.length > 0 ? res?.data : null})
    } catch (e) {
        new Error(e)
    }
}

export const fetchAndSetCurrentMember = async () => {
    try {
        const res = await getCurrentMember();
        useAuthStore?.setState({member: res?.data ? res?.data : null})
    } catch (e) {
        new Error(e)
    }
}

export const fetchAndSetMembers = async () => {
    try {
        const res = await getActiveMembers("", 0, 9 ** 9);
        useWorkspaceStore.setState({activeMembers: res?.data?.items?.length > 0 ? res?.data?.items : null})
    } catch (e) {
        new Error(e)
    }
}


export const fetchAndSetProjects = async () => {
    try {
        const res = await getWorkingProjects();
        useWorkspaceStore.setState({activeProjects: res?.data?.length > 0 ? res?.data : null})
    } catch (e) {
        new Error(e)
    }
}

export const fetchAndSetTasks = async (projectId, skip = 0, limit = 10) => {
    try {
        const res = await getTasks(projectId, skip, limit);
        useWorkspaceStore.setState({activeTasks: res?.data?.length > 0 ? res?.data : null})
    } catch (e) {
        new Error(e)
    }
}

export const deleteAndSetProjects = async (projectId) => {
    await deleteProject(projectId)
    const projects = useWorkspaceStore.getState().activeProjects
    const newProjects = projects ? projects?.filter((p) => p?.id !== projectId) : null
    useWorkspaceStore.setState({activeProjects: newProjects})
    return newProjects
}