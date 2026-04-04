import React from "react";
import {WorkspaceSidebar} from "@/components/sidebar/workspace-sidebar.jsx";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Outlet} from "react-router-dom";


const WorkspaceLayout = () => {
    return (
        <SidebarProvider>
            <WorkspaceSidebar/>
            <SidebarInset>
                <SidebarTrigger className="absolute top-4 left-4"/>
                <div className="flex flex-1 flex-col gap-4">
                    <Outlet/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default WorkspaceLayout;
