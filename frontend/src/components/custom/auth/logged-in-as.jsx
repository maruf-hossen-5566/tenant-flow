import React from 'react';
import {useAuthStore} from "@/stores/auth-store.js";
import {Button} from "@/components/ui/button.jsx";

const LoggedInAs = () => {
    const currentUser = useAuthStore(state => state.user)

    if (!currentUser) {
        return null
    }

    return (
        <div className="fixed top-8 right-8 md:right-16 pointer-events-none">
            <Button variant="outline" className="h-max flex flex-col items-start justify-start gap-1">
                <span className="text-sm">{currentUser?.name}</span>
                <span className="-mt-1 text-sm text-muted-foreground">{currentUser?.email}</span>
            </Button>
        </div>
    );
};

export default LoggedInAs;