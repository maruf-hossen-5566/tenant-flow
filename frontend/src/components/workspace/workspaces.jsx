import React, {useEffect, useState} from 'react';
import BackHome from "@/components/custom/auth/back-home.jsx";
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {
    Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle,
} from "@/components/ui/item"
import {toast} from "sonner";
import {ChevronRightIcon} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.jsx";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {fetchAndSetWorkspaces} from "@/lib/fetch-and-set-methods.js";
import {getMyInvitations, acceptInvitation} from "@/api/invitation-api.js";
import {Button} from "@/components/ui/button.jsx";
import {Separator} from "@/components/ui/separator.jsx";
import LoggedInAs from "@/components/custom/auth/logged-in-as.jsx";

const Workspaces = () => {
    const workspaces = useWorkspaceStore(state => state.workspaces)
    const setActiveWorkspace = useWorkspaceStore(state => state.setActiveWorkspace)
    const navigate = useNavigate()
    const [invites, setInvites] = useState(null)


    useEffect(() => {
        const getInvitations = async () => {
            try {
                const res = await getMyInvitations()
                setInvites(res?.data?.length ? res?.data : null)
            } catch (e) {
                console.log("E: ", e)
                toast.error(e?.response?.data?.detail || "Failed to get invitations")
            }
        }
        getInvitations()
    }, [])


    useEffect(() => {
        try {
            fetchAndSetWorkspaces()
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Failed to fetch tenants")
        }
    }, []);

    const handleWorkspaceClick = (space) => {
        if (space !== null) {
            setActiveWorkspace(space)
        }
        navigate(`${space?.id}/projects`)
    }

    const handleWorkspaceJoin = async (e, id) => {
        e.preventDefault()

        try {
            const res = await acceptInvitation(id)
            setActiveWorkspace(res?.data)
            const newInvites = invites?.filter(i => i.token !== id)
            setInvites(newInvites)
            navigate(`./${res?.data?.id}/projects`)
            toast.success(`Joined "${res?.data?.name}" successfully`)
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to join the workspace")
        }
    }


    return (<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
            <BackHome/>
            <LoggedInAs/>

            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex w-full max-w-md flex-col gap-4">
                    {
                        invites &&
                        <>
                            <h3 className="text-sm font-medium text-start text-muted-foreground">Invitations</h3>
                            <ItemGroup className="gap-2 mb-2 max-h-60 overflow-auto">
                                {invites?.map((invite) => (<Item
                                    key={invite?.id}
                                    variant="outline"
                                >
                                    <ItemMedia>
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarFallback
                                                className="rounded-lg capitalize"
                                            >{invite?.tenant?.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>{invite?.tenant?.name}</ItemTitle>
                                    </ItemContent>
                                    <ItemActions>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => handleWorkspaceJoin(e, invite?.id)}
                                        >
                                            Join
                                        </Button>
                                    </ItemActions>
                                </Item>))}
                            </ItemGroup>
                        </>
                    }

                    <h3 className="text-sm font-medium text-start text-muted-foreground">Workspaces</h3>
                    <ItemGroup className="gap-2 max-h-sm overflow-auto">
                        {workspaces ? (workspaces?.map((space) => (<Item
                            key={space?.id}
                            variant="outline"
                            className="hover:bg-sidebar"
                            onClick={() => handleWorkspaceClick(space)}
                        >
                            <ItemMedia>
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback
                                        className="rounded-lg"
                                    >{space?.name[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>{space?.name}</ItemTitle>
                                {space?.desc && <ItemDescription>
                                    {space?.desc}
                                </ItemDescription>}
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4"/>
                            </ItemActions>
                        </Item>))) : <div className="p-12 text-muted-foreground border rounded-md">
                            No workspaces
                        </div>}
                    </ItemGroup>
                    <Item className="px-0 -mt-4">
                        <Button
                            variant="outline"
                            asChild
                        >
                            <Link to="./new-workspace">
                                New workspace
                            </Link>
                        </Button>
                    </Item>
                </div>
            </div>
        </div>
    </div>);
};

export default Workspaces;