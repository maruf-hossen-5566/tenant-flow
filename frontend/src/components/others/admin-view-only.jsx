import React from 'react';
import {ShieldUser} from "lucide-react";

const AdminViewOnly = () => {
    return (
        <div className="size-full flex flex-col items-center justify-center">
            <ShieldUser className="size-12 mb-4 text-red-500"/>
            <h1 className="text-2xl">
                This page is admin view only
            </h1>
        </div>
    );
};

export default AdminViewOnly;