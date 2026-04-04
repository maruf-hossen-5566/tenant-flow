import * as React from "react";

import {NavMain} from "@/components/sidebar/nav-main.jsx";
import {NavProjects} from "@/components/sidebar/nav-projects.jsx";
import {NavUser} from "@/components/sidebar/nav-user.jsx";
import {WorkspaceSwitcher} from "@/components/sidebar/workspace-switcher.jsx";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,} from "@/components/ui/sidebar.jsx";


export function WorkspaceSidebar({...props}) {
    return (
        <Sidebar
            collapsible="icon"
            {...props}>
            <SidebarHeader>
                <WorkspaceSwitcher/>
                <NavProjects/>
            </SidebarHeader>
            <SidebarContent>
                <NavMain/>
            </SidebarContent>
            <SidebarFooter className="border-t">
                <NavUser/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
}
