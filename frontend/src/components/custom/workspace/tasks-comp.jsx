import React, {useEffect, useState} from 'react';
import {Input} from "@/components/ui/input.jsx";
import {Sheet, SheetTrigger} from "@/components/ui/sheet.jsx";
import {Button} from "@/components/ui/button.jsx";
import {Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle} from "@/components/ui/item.jsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.jsx";
import PaginationComp from "@/components/custom/workspace/pagination-comp.jsx";
import {fetchAndSetMembers} from "@/lib/fetch-and-set-methods.js";
import {CircleSlash2, X} from "lucide-react";
import TaskDetails from "@/components/custom/workspace/task-details.jsx";
import NewTask from "@/components/custom/workspace/new-task.jsx";
import {useSearchParams} from "react-router-dom";
import {Badge} from "@/components/ui/badge.jsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.jsx";

const TasksComp = ({data, setData, showAddTaskBtn = true, emptyMessage = "No tasks"}) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const filter = searchParams?.get("filter_by")
    const searchQuery = searchParams?.get("query") || ""
    const [filterBy, setFilterBy] = useState(filter || "all")
    const [queryInput, setQueryInput] = useState(searchQuery)


    useEffect(() => {
        fetchAndSetMembers()
    }, []);

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

    const handleSortByChange = (value) => {
        setFilterBy(value)
        setSearchParams(() => {
            const newParams = new URLSearchParams();
            newParams.set("filter_by", String(value));
            return newParams;
        });
    }


    return (
        <div className="bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <h1 className="py-12 text-xl flex items-center gap-2 font-bold">
                    Tasks
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
                        {
                            showAddTaskBtn ?
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button>
                                            New task
                                        </Button>
                                    </SheetTrigger>
                                    <NewTask
                                        data={data}
                                        setData={setData}
                                    />
                                </Sheet>
                                :
                                <Select
                                    value={filterBy}
                                    onValueChange={(value) => handleSortByChange(value)}
                                >
                                    <SelectTrigger
                                        className="max-w-32 w-full"
                                    >
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup
                                            className="capitalize"
                                        >
                                            <SelectItem
                                                value="all"
                                            >All</SelectItem>
                                            <SelectItem
                                                value="assigned"
                                            >Assigned</SelectItem>
                                            <SelectItem
                                                value="created"
                                            >Created</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                        }
                    </div>
                    {
                        data && data?.items?.length > 0
                            ?
                            <>
                                <ItemGroup className="gap-2">
                                    {data?.items?.map((task) => (
                                        <Sheet key={`${task?.id}`}>
                                            <SheetTrigger asChild>
                                                <Item
                                                    asChild
                                                    variant="outline"
                                                    className="hover:bg-sidebar cursor-pointer"
                                                >
                                                    <ItemContent className="w-full flex flex-row items-center justify-between gap-12">
                                                        <ItemTitle className="max-w-sm line-clamp-1">{task?.name}</ItemTitle>
                                                        <div
                                                            className="ml-auto flex items-center gap-1"
                                                        >
                                                            {
                                                                task?.assigned
                                                                    ?
                                                                    <>
                                                                        <Avatar
                                                                            className="size-6"
                                                                        >
                                                                            <AvatarFallback
                                                                                className="text-xs"
                                                                            >{task?.assigned?.user?.name?.charAt(0)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="max-w-24 overflow-hidden text-ellipsis">{task?.assigned?.user?.email}</span>
                                                                    </>
                                                                    :
                                                                    <p className="flex items-center gap-1 text-muted-foreground">
                                                                        <CircleSlash2 size={16}/> No assignee
                                                                    </p>
                                                            }
                                                        </div>
                                                        <Badge className={`${task?.status === "done" ? "bg-green-500/50 text-accent-foreground" : task?.status === "doing" ? "bg-blue-500/50 text-accent-foreground" : ""} w-14 capitalize`}>{task?.status}</Badge>
                                                    </ItemContent>
                                                </Item>
                                            </SheetTrigger>
                                            <TaskDetails
                                                task={task}
                                                data={data}
                                                setData={setData}
                                                projectId={task?.project_id}
                                            />
                                        </Sheet>
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
                                {emptyMessage}
                            </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default TasksComp;