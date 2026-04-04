import React, {useEffect, useState} from 'react';
import {toast} from "sonner";
import {getTasks} from "@/api/task-api.js";
import {useParams, useSearchParams} from "react-router-dom";
import TasksComp from "@/components/custom/workspace/tasks-comp.jsx";

export const Tasks = () => {
    const [data, setData] = useState(null)
    const {projectId} = useParams();
    const [searchParams, _] = useSearchParams()
    const query = searchParams?.get("query") || ""
    const skip = searchParams?.get("skip") || 0

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await getTasks(projectId, query, skip)
                setData(res?.data)
            } catch (e) {
                console.log("Failed to fetch data: ", e)
                toast.error(e?.response?.data?.detail || "Failed to fetch data")
            }
        }
        fetchTasks()
    }, [projectId, query, skip]);


    return (<TasksComp
        data={data}
        setData={setData}
    />)
};

