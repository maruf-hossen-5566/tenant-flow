import React, {useEffect, useState} from 'react';
import {Input} from "@/components/ui/input.jsx";
import {Button} from "@/components/ui/button.jsx";
import {Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle} from "@/components/ui/item.jsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.jsx";
import PaginationComp from "@/components/custom/workspace/pagination-comp.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.jsx";
import {Ellipsis, X} from "lucide-react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import {removeMember} from "@/api/project-api.js";
import {useAuthStore} from "@/stores/auth-store.js";
import {fetchAndSetProjects} from "@/lib/fetch-and-set-methods.js";
import {Badge} from "@/components/ui/badge.jsx";

const MembersComp = ({project, data, setData}) => {
    const {projectId} = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams?.get("query") || ""
    const [queryInput, setQueryInput] = useState(searchQuery)
    const currentMember = useAuthStore(state => state.member)
    const currentUser = useAuthStore(state => state.user)
    const [canCrud, setCanCrud] = useState(false)
    const navigate = useNavigate()


    const handleLeaveOrRemoveMember = async (memberId) => {
        if (!confirm("Are you sure?")) return
        try {
            await removeMember(projectId, memberId)

            const newMembers = data?.items?.filter(m => m?.id !== memberId)
            setData({...data, ["items"]: newMembers})
            toast.success("Member removed/leaved successfully")
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to remove member")
            return
        }
        if (memberId === currentMember?.id) {
            try {
                await fetchAndSetProjects()
            } catch (e) {
                console.log(e)
                toast.error(`Failed to fetch and set active project ${String(e)}`)
            }
            navigate(`../projects`)
        }
    }

    const handleQuerySubmit = (e) => {
        e.preventDefault()

        setSearchParams(() => {
            const newParams = new URLSearchParams();
            newParams.set('query', queryInput);
            return newParams;
        });
    }

    const clearInput = (e) => {
        e.preventDefault()

        setQueryInput("")
        setSearchParams(() => {
            const newParams = new URLSearchParams();
            newParams.set('query', "");
            return newParams;
        });
    }

    useEffect(() => {
        const isAdmin = currentMember?.role === "admin"
        const projectCreator = currentMember?.id === project?.creator?.id
        const projectLead = currentMember?.id === project?.lead?.id

        setCanCrud(isAdmin || projectCreator || projectLead)
    }, [project, data]);


    return (
        <div className="bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <h1 className="py-12 text-xl flex items-center gap-2 font-bold">
                    <span>Project members</span>
                    {data &&
                        <div className="py-1 px-3 rounded-full bg-accent">{data?.total}</div>
                    }
                </h1>
                <div className="flex w-full flex-col">
                    <div className="w-full mb-12 flex justify-between gap-4">
                        <form
                            className="max-w-sm w-full flex items-center gap-1"
                            onSubmit={handleQuerySubmit}
                        >
                            <Input
                                placeholder="Search"
                                className="w-full"
                                value={queryInput}
                                onChange={e => setQueryInput(e.target.value)}
                            />
                        </form>
                        {
                            (queryInput || searchQuery) &&
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-auto"
                                onClick={clearInput}
                            >
                                <X/>
                            </Button>
                        }
                    </div>
                    {
                        data?.items && data?.items?.length
                            ?
                            <>
                                <ItemGroup className="gap-2">
                                    {data?.items?.map((m) => (
                                        <Item
                                            key={m?.id}
                                            variant="outline"
                                        >
                                            <ItemMedia>
                                                <Avatar>
                                                    <AvatarFallback>{m?.user?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </ItemMedia>
                                            <ItemContent className="w-full flex flex-row items-center justify-between">
                                                <div className="">
                                                    <ItemTitle className="flex flex-col items-start gap-0">
                                                        <span>{m?.user?.name}</span>
                                                        <span className="text-muted-foreground">{m?.user?.email}</span>
                                                    </ItemTitle>
                                                    <ItemDescription>
                                                        <span>{m?.user?.emails}</span>
                                                    </ItemDescription>
                                                </div>
                                                {
                                                    m?.user?.id === currentUser?.id &&
                                                    <Badge className="mr-auto ml-4">
                                                        You
                                                    </Badge>
                                                }
                                                <div className="flex items-center justify-end gap-4">
                                                    {
                                                        (canCrud || currentMember?.id === m?.id) &&
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    disabled={!canCrud && currentMember?.id !== m?.id}
                                                                >
                                                                    <Ellipsis/>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                className="w-56"
                                                                align="end"
                                                            >
                                                                <DropdownMenuGroup>
                                                                    {
                                                                        <DropdownMenuItem
                                                                            variant="destructive"
                                                                            onClick={() => handleLeaveOrRemoveMember(m?.id)}
                                                                        >
                                                                            {
                                                                                currentMember?.id === m?.id ? "Leave" : "Remove"
                                                                            }
                                                                        </DropdownMenuItem>
                                                                    }
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    }
                                                </div>
                                            </ItemContent>
                                        </Item>
                                    ))}
                                </ItemGroup>
                                {data && data?.total > 10 &&
                                    <PaginationComp
                                        data={data}
                                    />
                                }
                            </>
                            :
                            <div className="py-12 px-4 flex items-center justify-center border-t">
                                No members
                            </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default MembersComp;