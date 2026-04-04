import React from 'react';
import {Button} from "@/components/ui/button.jsx";
import {useGlobalStore} from "@/stores/global-store.js";

const ThemeButton = () => {
    const {isDark, setIsDark} = useGlobalStore()

    return (
        <Button
            size="icon"
            onClick={() => setIsDark(!isDark)}
        >
            {
                isDark ? <Sun/> : <Moon/>
            }
        </Button>
    );
};

export default ThemeButton;