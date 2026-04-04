import React, {useEffect, useState} from "react";
import {useParams, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import ProjectsComp from "@/components/custom/workspace/projects-comp.jsx";
import {getProjects} from "@/api/project-api.js";
import {useAuthStore} from "@/stores/auth-store.js";
import {getCurrentMember} from "@/api/membership-api.js";

const Projects = () => {
    const {wsId} = useParams();
    const [data, setData] = useState(null)
    const [searchParams] = useSearchParams()
    const query = searchParams.get("query") || ""
    const skip = searchParams.get("skip") || 0
    const setMember = useAuthStore(state => state.setMember)


    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await getProjects(query, skip);
                setData(res?.data && res?.data)
            } catch (e) {
                console.log("Failed to fetch data: ", e)
                toast.error(e?.response?.data?.detail || "Failed to fetch data")
            }
        }

        fetchProjects()
    }, [wsId, query, skip]);


    return <ProjectsComp
        data={data}
        setData={setData}
    />
};

export default Projects;
