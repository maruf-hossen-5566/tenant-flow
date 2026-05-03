import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import React, { useEffect, useState } from "react";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item.jsx";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Sheet, SheetTrigger } from "@/components/ui/sheet.jsx";
import NewMember from "@/components/custom/workspace/new-member.jsx";
import { ChevronDown, X } from "lucide-react";
import PaginationComp from "@/components/custom/workspace/pagination-comp.jsx";
import { getActiveMembers } from "@/api/membership-api.js";
import { useWorkspaceStore } from "@/stores/workspace-store.js";
import { useAuthStore } from "@/stores/auth-store.js";

const Members = () => {
    const { wsId } = useParams();
    const [data, setData] = useState(null);
    const activeMembers = useWorkspaceStore((state) => state.activeMembers);
    const setActiveMembers = useWorkspaceStore(
        (state) => state.setActiveMembers,
    );
    const currentUser = useAuthStore((state) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("query") || "";
    const skip = searchParams.get("skip") || 0;
    const [queryInput, setQueryInput] = useState(searchQuery);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await getActiveMembers(searchQuery, skip);
                setData(res?.data);
                setActiveMembers(res?.data?.items);
            } catch (e) {
                console.log("Failed to fetch members: ", e);
                toast.error(
                    e?.response?.data?.detail || "Failed to fetch members",
                );
            }
        };
        fetchMembers();
    }, [wsId, searchQuery, skip]);

    const handleQuerySubmit = (e) => {
        e.preventDefault();

        setSearchParams(() => {
            const newParams = new URLSearchParams();
            newParams.set("query", queryInput);
            return newParams;
        });
    };

    const clearInput = (e) => {
        e.preventDefault();

        setQueryInput("");
        setSearchParams(() => {
            const newParams = new URLSearchParams();
            newParams.set("query", "");
            return newParams;
        });
    };

    return (
        <div className="bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <h1 className="py-12 text-xl flex items-center gap-2 font-bold">
                    Members
                    {data && (
                        <div className="py-1 px-3 rounded-full bg-accent">
                            {data?.total}
                        </div>
                    )}
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
                                onChange={(e) => setQueryInput(e.target.value)}
                            />
                        </form>
                        {(queryInput || searchQuery) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-auto"
                                onClick={clearInput}
                            >
                                <X />
                            </Button>
                        )}
                    </div>
                    {activeMembers && activeMembers?.length > 0 ? (
                        <>
                            <ItemGroup className="gap-2">
                                {activeMembers?.map((m) => (
                                    <Item key={m?.id} variant="outline">
                                        <ItemMedia>
                                            <Avatar>
                                                <AvatarFallback className="capitalize">
                                                    {m?.user?.name?.charAt(0) ||
                                                        m?.user_email?.charAt(
                                                            0,
                                                        )}
                                                </AvatarFallback>
                                            </Avatar>
                                        </ItemMedia>
                                        <ItemContent className="w-full flex flex-row items-center justify-between">
                                            <div className="">
                                                <ItemTitle className="flex flex-col items-start gap-0">
                                                    {m?.user?.name}
                                                </ItemTitle>
                                                <ItemDescription>
                                                    <span>
                                                        {m?.user?.email ||
                                                            m?.user_email}
                                                    </span>
                                                </ItemDescription>
                                            </div>
                                            {m?.user?.id ===
                                                currentUser?.id && (
                                                <Badge className="mr-auto ml-4">
                                                    You
                                                </Badge>
                                            )}
                                            {m?.member_projects?.length > 0 && (
                                                <HoverCard>
                                                    <HoverCardTrigger
                                                        className="flex items-center justify-end gap-1"
                                                        asChild
                                                    >
                                                        <Button variant="ghost">
                                                            {m?.member_projects
                                                                ?.slice(0, 1)
                                                                ?.map((p) => (
                                                                    <Badge
                                                                        key={
                                                                            p?.id
                                                                        }
                                                                        className="bg-accent text-accent-foreground max-w-24 text-ellipsis line-clamp-1"
                                                                    >
                                                                        {
                                                                            p?.name
                                                                        }
                                                                    </Badge>
                                                                ))}
                                                            {m?.member_projects
                                                                ?.length >
                                                                1 && (
                                                                <span className="text-xs ml-0.5 mr-1.5">
                                                                    +
                                                                    {m
                                                                        ?.member_projects
                                                                        ?.length -
                                                                        1}
                                                                </span>
                                                            )}
                                                            <ChevronDown />
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="flex flex-wrap overflow-hidden gap-2">
                                                        {m?.member_projects?.map(
                                                            (p) => (
                                                                <Badge
                                                                    key={p?.id}
                                                                    variant="secondary"
                                                                    className="text-ellipsis line-clamp-1"
                                                                >
                                                                    {p?.name}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </HoverCardContent>
                                                </HoverCard>
                                            )}
                                        </ItemContent>
                                    </Item>
                                ))}
                            </ItemGroup>
                            {data && data?.total > 10 && (
                                <PaginationComp data={data} />
                            )}
                        </>
                    ) : (
                        <div className="py-12 px-4 flex items-center justify-center border-t">
                            No members
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Members;
