import React from 'react';
import {useAuthStore} from "@/stores/auth-store.js";
import {Button} from "@/components/ui/button.jsx";
import {ChevronDown, CircleUserRound} from "lucide-react";
import {logTheUserOut} from "@/lib/utils.js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ProfileButton = () => {
    const user = useAuthStore(state => state.user)

    const handleLogout = () => {
        if (!confirm("Are you sure?")) return
        logTheUserOut()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex flex-row items-center justify-center"
                >
                    <CircleUserRound/>
                    <span className="max-w-24 leading-normal text-ellipsis overflow-hidden">
                    {user && user?.email}
                </span>
                    <ChevronDown/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                align="end"
            >
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={handleLogout}
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ProfileButton;