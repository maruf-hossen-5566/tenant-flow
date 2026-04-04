import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.jsx";
import {Outlet} from "react-router-dom";
import React from "react";
import SettingsSidebar from "@/components/sidebar/settings-sidebar.jsx";

const SettingsLayout = () => {
    return (
        <SidebarProvider>
            <SettingsSidebar/>
            <SidebarInset>
                <SidebarTrigger className="absolute top-4 left-4"/>
                <div className="flex flex-1 flex-col gap-4">
                    <Outlet/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default SettingsLayout;