import {Outlet, ScrollRestoration} from "react-router-dom";
import {useLayoutEffect} from "react";
import {useGlobalStore} from "@/stores/global-store.js";
import {Toaster} from "@/components/ui/sonner.jsx";

const Base = () => {
    const isDark = useGlobalStore(state => state.isDark)

    useLayoutEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }

    }, [isDark])

    return (
        <>
            <Outlet/>
            <Toaster
                expand
                position="bottom-right"
                closeButton={true}
                visibleToasts={10}
            />
            <ScrollRestoration/>
        </>
    );
};

export default Base;