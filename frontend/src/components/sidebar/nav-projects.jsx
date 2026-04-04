import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar.jsx";
import {Link, useLocation, useParams} from "react-router-dom";
import React from "react";

export function NavProjects() {
    const {isMobile} = useSidebar();
    const location = useLocation();
    const {wsId} = useParams()


    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={location?.pathname?.endsWith(`${wsId}/projects`)}
                >
                    <Link to="projects">
                        <span>Projects</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={location?.pathname?.endsWith(`${wsId}/tasks`)}
                >
                    <Link to="tasks">
                        <span>Tasks</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={location?.pathname?.endsWith(`${wsId}/members`)}
                >
                    <Link to="members">
                        <span>Members</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
