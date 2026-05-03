import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/stores/auth-store.js";
import { useWorkspaceStore } from "@/stores/workspace-store.js";
import { useDraftStore } from "@/stores/draft-store.js";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const logTheUserOut = () => {
    useAuthStore?.getState()?.clearStore();
    useWorkspaceStore?.getState()?.clearStore();
    useDraftStore?.getState()?.clearStore();
};
