import React, {useEffect, useState} from "react";
import {useParams, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import {useAuthStore} from "@/stores/auth-store.js";
import {getCurrentMember} from "@/api/membership-api.js";
import TasksComp from "@/components/custom/workspace/tasks-comp.jsx";
import {getAllTasks} from "@/api/task-api.js";

const Views = () => {
    const {wsId} = useParams();
    const [data, setData] = useState(null)
    const [searchParams] = useSearchParams()
    const query = searchParams.get("query") || ""
    const filterBy = searchParams.get("filter_by") || "all"
    const skip = searchParams.get("skip") || 0
    const setMember = useAuthStore(state => state.setMember)


    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await getAllTasks(query, skip, 10, filterBy);
                setData(res?.data && res?.data)
            } catch (e) {
                console.log("Failed to fetch data: ", e)
                toast.error(e?.response?.data?.detail || "Failed to fetch data")
            }
        }
        fetchTasks()
    }, [wsId, query, skip, filterBy]);


    useEffect(() => {
        const fetchCurrentMember = async () => {
            try {
                const res = await getCurrentMember()
                setMember(res?.data)
            } catch (e) {
                console.log("E: ", e?.response?.data?.detail || "Failed to set current member")
                toast.error(e?.response?.data?.detail || "Failed to set current member")
            }
        }

        fetchCurrentMember()
    }, [])

    return <TasksComp
        data={data}
        setData={setData}
        showAddTaskBtn={false}
    />
};


export default Views;