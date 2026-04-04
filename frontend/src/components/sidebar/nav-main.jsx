import {ChevronRight, Plus} from "lucide-react";

import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible.jsx"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar.jsx"
import {Button} from "@/components/ui/button.jsx";
import React, {useEffect} from "react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.jsx";
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {Link, useLocation, useParams} from "react-router-dom";
import {toast} from "sonner";
import {getWorkingProjects} from "@/api/project-api.js";

export function NavMain() {
    const projects = useWorkspaceStore((state) => state.activeProjects);
    const setProjects = useWorkspaceStore((state) => state.setActiveProjects);
    const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace)
    const location = useLocation();
    const {wsId} = useParams()


    useEffect(() => {
        const fetchActiveProjects = async () => {
            try {
                const res = await getWorkingProjects();
                setProjects(res?.data?.length > 0 ? res?.data : null);
            } catch (e) {
                console.log("teams fetch error: ", e);
                toast.error(e?.response?.data?.detail || "Failed to fetch teams");
            }
        };
        fetchActiveProjects();
    }, [wsId, activeWorkspace]);


    return (
        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between gap-4">
                Projects
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 -mr-0.5 rounded"
                    asChild
                >
                    <Link to="./projects">
                        <Plus/>
                    </Link>
                </Button>
            </SidebarGroupLabel>
            {(projects || projects?.length > 1) ?
                <SidebarMenu>
                    {projects?.map((project) => (
                        <Collapsible
                            key={project?.id}
                            asChild
                            defaultOpen={true}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={project?.name}>
                                        <Avatar className="h-6 w-6 rounded-lg">
                                            <AvatarFallback
                                                className="rounded-lg"
                                            >{project?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="line-clamp-1">{project?.name}</span>
                                        <ChevronRight
                                            className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={location?.pathname?.endsWith(`${project?.id}`)}
                                            >
                                                <Link to={`./projects/${project?.id}`}>
                                                    <span>Details</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={location?.pathname?.endsWith(`${project?.id}/tasks`)}
                                            >
                                                <Link to={`./projects/${project?.id}/tasks`}>
                                                    <span>Tasks</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={location?.pathname?.endsWith(`${project?.id}/members`)}
                                            >
                                                <Link to={`./projects/${project?.id}/members`}>
                                                    <span>Members</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
                :
                <SidebarMenu>
                    <SidebarMenuItem>
                        <span className="text-sm border p-6 rounded-lg flex text-center w-full items-center justify-center">No working projects</span>
                    </SidebarMenuItem>
                </SidebarMenu>
            }
        </SidebarGroup>
    );
}
