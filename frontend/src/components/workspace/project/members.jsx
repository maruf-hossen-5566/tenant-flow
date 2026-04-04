import React, {useEffect, useState} from 'react';
import {toast} from "sonner";
import {useParams, useSearchParams} from "react-router-dom";
import MembersComp from "@/components/custom/workspace/members-comp.jsx";
import {getProjectDetails, getProjectMembers} from "@/api/project-api.js";

export const Members = () => {
    const [data, setData] = useState(null)
    const [project, setProject] = useState(null)
    const {projectId} = useParams();
    const [searchParams] = useSearchParams()
    const query = searchParams.get("query") || ""
    const skip = searchParams.get("skip") || 0

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await getProjectMembers(projectId, query, skip)
                setData(res?.data ? res?.data : null)
            } catch (e) {
                toast.error(e?.response?.data?.detail || "Failed to fetch data")
            }
        }
        const fetchProject = async () => {
            try {
                const res = await getProjectDetails(projectId)
                setProject(res?.data ? res?.data : null)
            } catch (e) {
                console.log("Failed to fetch project: ", e)
                toast.error(e?.response?.data?.detail || "Failed to fetch project")
            }
        }
        fetchMembers()
        fetchProject()
    }, [projectId, skip, query]);


    return (<MembersComp
        project={project}
        data={data}
        setData={setData}
    />)
};

