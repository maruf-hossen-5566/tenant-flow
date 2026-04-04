import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import {acceptInvitation, getInvitationInfo} from "@/api/invitation-api.js";
import {Button} from "@/components/ui/button.jsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import BackHome from "@/components/custom/auth/back-home.jsx";
import LoggedInAs from "@/components/custom/auth/logged-in-as.jsx";
import {useWorkspaceStore} from "@/stores/workspace-store.js";

const AcceptInvites = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const [inviteInfo, setInviteInfo] = useState(null)
    const workspaces = useWorkspaceStore(state => state.workspaces)
    const setActiveWorkspace = useWorkspaceStore(state => state.setActiveWorkspace)
    const navigate = useNavigate()
    const [invites, setInvites] = useState(null)

    useEffect(() => {
        const fetchInvitationInfo = async () => {
            try {
                const res = await getInvitationInfo(token)
                setInviteInfo(res?.data)
            } catch (e) {
                console.log("E: ", e)
                if (e?.response?.status === 410) {
                    navigate("../invalid-link/invalid-link/invalid-link")
                }
                toast.error(e?.response?.data?.detail || "Failed to get invitation info")
            }

        }

        fetchInvitationInfo()
    }, [token])

    const acceptInvitationClick = async (e) => {
        e.preventDefault()

        try {
            const res = await acceptInvitation(inviteInfo?.id)
            setActiveWorkspace(res?.data)
            const newInvites = invites?.filter(i => i.token !== token)
            setInvites(newInvites)
            navigate(`../${res?.data?.id}/projects`)
            toast.success(`Joined "${res?.data?.name}" successfully`)
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to join the workspace")
        }

    }

    if (!inviteInfo) return null

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <BackHome/>
            <LoggedInAs/>

            <Card
                className="mx-auto w-full max-w-sm"
            >
                <CardHeader>
                    <CardTitle>Workspace invitation</CardTitle>
                    <CardDescription className="hidden">
                    </CardDescription>
                </CardHeader>
                <CardContent className="-mt-4">
                    <p>
                        <span className="text-blue-500">
                            {inviteInfo?.inviter}
                        </span>{" "}invited you to join{" "}
                        <span className="text-blue-500">
                            {inviteInfo?.tenant?.name}
                        </span>
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full cursor-pointer"
                        onClick={acceptInvitationClick}
                    >
                        Accept invitation
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AcceptInvites;