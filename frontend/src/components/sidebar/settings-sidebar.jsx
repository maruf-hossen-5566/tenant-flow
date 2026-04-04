import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar.jsx";
import {Link, useLocation, useParams} from "react-router-dom";
import {CalendarClock, ChevronLeft, CircleUserRound, Layers, Shield, Users} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";

const SettingsSidebar = () => {
    const location = useLocation()
    const {wsId} = useParams()

    return (
        <Sidebar>
            <SidebarHeader>
                <Button
                    variant="ghost"
                    className="pl-1! pr-2 w-max"
                    asChild
                >
                    <Link to={`/workspaces/${wsId}/projects`}>
                        <ChevronLeft/>
                        Back
                    </Link>
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location?.pathname?.endsWith(`${wsId}/settings`)}
                                    asChild
                                >
                                    <Link to=".">
                                        <CircleUserRound/>
                                        <span>Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location?.pathname?.endsWith(`${wsId}/settings/security`)}
                                    asChild
                                >
                                    <Link to="security">
                                        <Shield/>
                                        <span>Security</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location?.pathname?.endsWith(`${wsId}/settings/workspace`)}
                                    asChild
                                >
                                    <Link to="workspace">
                                        <Layers/>
                                        <span>Workspace</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location?.pathname?.endsWith(`${wsId}/settings/workspace/members`)}
                                    asChild
                                >
                                    <Link to="workspace/members">
                                        <Users/>
                                        <span>Members</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location?.pathname?.endsWith(`${wsId}/settings/workspace/pending-invites`)}
                                    asChild
                                >
                                    <Link to="workspace/pending-invites">
                                        <CalendarClock/>
                                        <span>Pending invites</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default SettingsSidebar;