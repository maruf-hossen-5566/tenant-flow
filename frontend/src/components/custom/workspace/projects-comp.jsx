import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Sheet, SheetTrigger } from "@/components/ui/sheet.jsx";
import { Button } from "@/components/ui/button.jsx";
import NewProject from "@/components/custom/workspace/new-project.jsx";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemGroup,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item.jsx";
import { Link, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.jsx";
import PaginationComp from "@/components/custom/workspace/pagination-comp.jsx";
import { useAuthStore } from "@/stores/auth-store.js";
import { toast } from "sonner";
import { joinProject } from "@/api/project-api.js";
import {
    fetchAndSetMembers,
    fetchAndSetProjects,
} from "@/lib/fetch-and-set-methods.js";
import { X } from "lucide-react";

const ProjectsComp = ({ data, setData }) => {
    const user = useAuthStore((state) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams?.get("query") || "";
    const [queryInput, setQueryInput] = useState(searchQuery);

    const handleProjectJoin = async (e, projectId) => {
        e.preventDefault();

        try {
            const res = await joinProject(projectId);
            const newProjects = data?.items?.map((p) =>
                p?.id === res?.data?.id ? res?.data : p,
            );
            setData({ ...data, ["items"]: newProjects });
        } catch (e) {
            console.log(e);
            toast.error(
                e?.response?.data?.detail || "Failed to join the project",
            );
            return;
        }

        try {
            await fetchAndSetProjects();
        } catch (e) {
            console.log(e);
            toast.error(`Failed to fetch and set active project ${String(e)}`);
        }
    };

    useEffect(() => {
        fetchAndSetMembers();
    }, []);

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
                    Projects
                    {data && (
                        <div className="py-1 px-3 rounded-full bg-accent">
                            {data?.total || 0}
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
                                <Button>New project</Button>
                            </SheetTrigger>
                            <NewProject data={data} setData={setData} />
                        </Sheet>
                    </div>
                    {data?.items && data?.items?.length ? (
                        <>
                            <ItemGroup className="gap-2">
                                {data?.items?.map((project) => (
                                    <Item
                                        key={`${project?.id}`}
                                        variant="outline"
                                        asChild
                                    >
                                        <Link to={`./${project?.id}`}>
                                            <ItemContent className="w-full flex flex-row items-center justify-between gap-12">
                                                <ItemTitle className="max-w-sm line-clamp-1">
                                                    {project?.name}
                                                </ItemTitle>
                                                {project?.members && (
                                                    <div className="ml-auto mr-4 items-center justify-end *:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                                                        {project?.members?.map(
                                                            (m) => (
                                                                <Avatar
                                                                    key={m?.id}
                                                                    className="size-6"
                                                                >
                                                                    <AvatarFallback className="text-xs">
                                                                        {m?.user?.name?.charAt(
                                                                            0,
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </ItemContent>
                                            <ItemActions>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        !project?.members?.some(
                                                            (_m) =>
                                                                _m?.user_id ===
                                                                user?.id,
                                                        )
                                                            ? "outline"
                                                            : "destructive"
                                                    }
                                                    onClick={(e) =>
                                                        handleProjectJoin(
                                                            e,
                                                            project?.id,
                                                        )
                                                    }
                                                >
                                                    {!project.members.some(
                                                        (_m) =>
                                                            _m.user_id ===
                                                            user.id,
                                                    )
                                                        ? "Join"
                                                        : "Leave"}
                                                </Button>
                                            </ItemActions>
                                        </Link>
                                    </Item>
                                ))}
                            </ItemGroup>
                            {data && data?.total > 10 && (
                                <PaginationComp data={data} />
                            )}
                        </>
                    ) : (
                        <div className="py-12 px-4 flex items-center justify-center border-t">
                            No projects
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectsComp;
