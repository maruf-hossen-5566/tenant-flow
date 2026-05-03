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
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Sheet, SheetTrigger } from "@/components/ui/sheet.jsx";
import NewMember from "@/components/custom/workspace/new-member.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { Ellipsis, X } from "lucide-react";
import PaginationComp from "@/components/custom/workspace/pagination-comp.jsx";
import {
    changeMemberRole,
    getActiveMembers,
    removeMember,
} from "@/api/membership-api.js";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.jsx";
import { useWorkspaceStore } from "@/stores/workspace-store.js";
import { useAuthStore } from "@/stores/auth-store.js";
import { logTheUserOut } from "@/lib/utils";

const WorkspaceMembers = () => {
    const { wsId } = useParams();
    const [data, setData] = useState(null);
    const currentMember = useAuthStore((state) => state.member);
    const setCurrentMember = useAuthStore((state) => state.setMember);
    const activeMembers = useWorkspaceStore((state) => state.activeMembers);
    const setActiveMembers = useWorkspaceStore(
        (state) => state.setActiveMembers,
    );
    const clearWorkspaceStore = useWorkspaceStore((state) => state.clearStore);
    const [canCrud, setCanCrud] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("query") || "";
    const skip = searchParams.get("skip") || 0;
    const [queryInput, setQueryInput] = useState(searchQuery);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await getActiveMembers(searchQuery, skip);
                setData(res?.data);
                res?.data?.items?.forEach((m) => {
                    if (m?.id === currentMember?.id) {
                        setCurrentMember(m);
                    }
                });
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

    const handleRemoveMember = async (mId) => {
        if (!confirm("Are you sure?")) return;

        try {
            await removeMember(mId);
            const newMembers = activeMembers?.filter((m) => m?.id !== mId);
            setActiveMembers(
                newMembers && newMembers?.length > 0 ? newMembers : null,
            );
            setSearchParams(() => {
                const newParams = new URLSearchParams();
                newParams.set("skip", String(0));
                return newParams;
            });
            window.location.reload();

            if (currentMember?.id === mId) {
                clearWorkspaceStore();
                navigate("./workspaces");
            }

            toast.success("Member removed successfully");
        } catch (e) {
            console.log("E: ", e);
            toast.error(e?.response?.data?.detail || "Failed to remove member");
        }
    };
    const handleMemberRoleChange = async (value, memberId) => {
        try {
            const res = await changeMemberRole(memberId, { role: value });
            const newMembers = activeMembers?.map((m) =>
                m?.id === memberId ? res?.data : m,
            );
            setActiveMembers(
                newMembers && newMembers?.length > 0 ? newMembers : null,
            );
            if (res?.data?.id === currentMember?.id) {
                setCurrentMember(res?.data);
            }
            toast.success("Member role changed successfully");
        } catch (e) {
            console.log("E: ", e);
            toast.error(
                e?.response?.data?.detail || "Failed to change the role",
            );
        }
    };

    useEffect(() => {
        const isAdmin = currentMember?.role === "admin";
        setCanCrud(isAdmin);
    }, [data, activeMembers]);

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
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button>Invite member</Button>
                            </SheetTrigger>
                            <NewMember data={data} setData={setData} />
                        </Sheet>
                    </div>
                    {activeMembers && activeMembers?.length > 0 ? (
                        <>
                            <ItemGroup className="gap-2">
                                {activeMembers?.map((m) => (
                                    <Item key={m?.id} variant="outline">
                                        <ItemMedia>
                                            <Avatar>
                                                <AvatarFallback>
                                                    {m?.user?.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </ItemMedia>
                                        <ItemContent className="w-full flex flex-row items-center justify-between">
                                            <div className="">
                                                <ItemTitle className="flex flex-col items-start gap-0">
                                                    <span>{m?.user?.name}</span>
                                                    <span className="text-muted-foreground">
                                                        {m?.user?.email}
                                                    </span>
                                                </ItemTitle>
                                                <ItemDescription>
                                                    <span>
                                                        {m?.user?.emails}
                                                    </span>
                                                </ItemDescription>
                                            </div>
                                            <div className="flex items-center justify-end gap-4">
                                                <Select
                                                    value={m?.role}
                                                    onValueChange={(value) =>
                                                        handleMemberRoleChange(
                                                            value,
                                                            m?.id,
                                                        )
                                                    }
                                                    disabled={!canCrud}
                                                >
                                                    <SelectTrigger
                                                        className={`${m?.role === "admin" ? "text-blue-500" : m?.role === "guest" ? "text-slate-500" : ""} capitalize border-none bg-transparent! hover:bg-input/50!`}
                                                        disabled={!canCrud}
                                                    >
                                                        <SelectValue
                                                            placeholder={
                                                                m?.role
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="admin">
                                                                Admin
                                                            </SelectItem>
                                                            <SelectItem value="member">
                                                                Member
                                                            </SelectItem>
                                                            <SelectItem value="guest">
                                                                Guest
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {(canCrud ||
                                                    currentMember?.id ===
                                                        m?.id) && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                disabled={
                                                                    !canCrud &&
                                                                    currentMember?.id !==
                                                                        m?.id
                                                                }
                                                            >
                                                                <Ellipsis />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            className="w-56"
                                                            align="end"
                                                        >
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        handleRemoveMember(
                                                                            m?.id,
                                                                        )
                                                                    }
                                                                >
                                                                    {currentMember?.id ===
                                                                    m?.id
                                                                        ? "Leave"
                                                                        : "Remove"}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
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

export default WorkspaceMembers;
