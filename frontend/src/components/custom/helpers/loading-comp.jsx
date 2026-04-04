import React from 'react';
import {Spinner} from "@/components/ui/spinner.jsx";
import {cn} from "@/lib/utils.js";

const LoadingComp = ({className}) => {
    return (
        <div className={cn("w-full flex-1 flex items-center justify-center", className)}>
            <Spinner className="size-8"/>
        </div>
    );
};

export default LoadingComp;