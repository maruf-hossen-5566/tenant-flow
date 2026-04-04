import React from 'react';
import {Button} from "@/components/ui/button.jsx";
import {Link} from "react-router-dom";
import {useAuthStore} from "@/stores/auth-store.js";
import ProfileButton from "@/components/custom/header/profile-button.jsx";
import {useWorkspaceStore} from "@/stores/workspace-store.js";

const AuthButtons = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace)


    return (
        <div className="w-max flex items-center gap-2">
            {
                !isAuthenticated ?
                    <>
                        <Button
                            variant="ghost"
                            asChild
                        >
                            <Link to="login">
                                Log in
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link to="signup">
                                Sign up
                            </Link>
                        </Button>
                    </>
                    :
                    <>
                        <Button
                            variant="ghost"
                            asChild
                        >
                            <Link to={`workspaces/${activeWorkspace ? activeWorkspace.id : ""}`}>
                                Workspace
                            </Link>
                        </Button>
                        <ProfileButton/>
                    </>
            }
        </div>

    );
};

export default AuthButtons;