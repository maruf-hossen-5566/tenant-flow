import React from 'react';
import {useAuthStore} from "@/stores/auth-store.js";
import {Navigate, Outlet} from "react-router-dom";

const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to={"/login"} replace/>
    }

    return <Outlet/>
};

export default ProtectedRoute;