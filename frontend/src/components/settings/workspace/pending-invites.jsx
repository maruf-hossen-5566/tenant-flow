import {
    deleteInvitation,
    getPendingInvitations,
} from "@/api/invitation-api.js";
import PaginationComp from "@/components/custom/workspace/pagination-comp.jsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
    Item,
    ItemContent,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item.jsx";
import { useAuthStore } from "@/stores/auth-store.js";
import { Ellipsis, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PendingInvites = () => {
    const [data, setData] = useState(null);
    const currentMember = useAuthStore((state) => state.member);
    const [canCrud, setCanCrud] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("query") || "";
    const skip = searchParams.get("skip") || 0;
    const [queryInput, setQueryInput] = useState(searchQuery);

    useEffect(() => {
        const isAdmin = currentMember?.role === "admin";
        setCanCrud(isAdmin);
    }, [data]);

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const res = await getPendingInvitations(searchQuery, skip);
                setData(res?.data);
            } catch (e) {
                console.log("Failed to fetch members: ", e);
                toast.error(
                    e?.response?.data?.detail || "Failed to fetch members",
                );
            }
        };
        fetchInvitations();
    }, [searchQuery, skip]);

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

    const handleDeleteInvite = async (iId) => {
        if (!confirm("Are you sure?")) return;

        try {
            await deleteInvitation(iId);
            const newMembers = data?.items?.filter((i) => i?.id !== iId);
            setData({
                ...data,
                ["items"]: newMembers,
                ["total"]: data?.total - 1,
            });
            setSearchParams(() => {
                const newParams = new URLSearchParams();
                newParams.set("skip", String(0));
                return newParams;
            });
            toast.success("Member removed successfully");
        } catch (e) {
            console.log("E: ", e);
            toast.error(e?.response?.data?.detail || "Failed to remove member");
        }
    };

    return (
        <div className="bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <h1 className="py-12 text-xl flex items-center gap-2 font-bold">
                    Pending invitations
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
                    {data?.items && data?.items?.length > 0 ? (
                        <>
                            <ItemGroup className="gap-2">
                                {data?.items?.map((i) => (
                                    <Item key={i?.id} variant="outline">
                                        <ItemMedia>
                                            <Avatar>
                                                <AvatarFallback className="capitalize">
                                                    {i?.email?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </ItemMedia>
                                        <ItemContent className="w-full flex flex-row items-center justify-between">
                                            <ItemTitle className="max-w-44 inline text-ellipsis overflow-x-hidden">
                                                {i?.email}
                                            </ItemTitle>
                                            <Badge className="bg-yellow-500/50 text-white capitalize ml-4 mr-auto">
                                                Pending
                                            </Badge>
                                        </ItemContent>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={
                                                        !canCrud &&
                                                        currentMember?.id !==
                                                            i?.id
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
                                                            handleDeleteInvite(
                                                                i?.id,
                                                            )
                                                        }
                                                    >
                                                        Revoke
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

export default PendingInvites;
