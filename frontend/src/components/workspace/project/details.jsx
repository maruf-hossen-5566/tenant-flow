import React, {useEffect, useState} from 'react';
import {Textarea} from "@/components/ui/textarea.jsx";
import moment from "moment";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.jsx";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.jsx";
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {ChevronDown, ChevronDownIcon, ChevronLeft, CircleSlash2, Ellipsis, XIcon} from "lucide-react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {getProjectDetails, updateProject} from "@/api/project-api.js";
import {Button} from "@/components/ui/button.jsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.jsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.jsx";
import {Calendar} from "@/components/ui/calendar.jsx";
import {deleteAndSetProjects, fetchAndSetMembers} from "@/lib/fetch-and-set-methods.js";
import {validateStartAndEndDate} from "@/lib/form-validation.js";
import {Item, ItemContent, ItemGroup, ItemTitle} from "@/components/ui/item.jsx";
import {getTasks} from "@/api/task-api.js";
import {useAuthStore} from "@/stores/auth-store.js";


export const Details = () => {
    const {projectId} = useParams()
    const [oldProject, setOldProject] = useState(null)
    const [projectDetails, setProjectDetails] = useState(null)
    const [projectTasks, setProjectTasks] = useState(null)
    const members = useWorkspaceStore((state) => state.activeMembers);
    const [openDueDatePicker, setOpenDueDatePicker] = useState(false)
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false)
    const navigate = useNavigate()
    const currentMember = useAuthStore(state => state.member)
    const [canCrud, setCanCrud] = useState(false)


    useEffect(() => {
        const fetchProjectDatils = async () => {
            try {
                const res = await getProjectDetails(projectId)
                setProjectDetails(res?.data)
                setOldProject(res?.data)
            } catch (e) {
                if (e?.response?.status === 403) {
                    toast.error("Not a member of this project, Please try after joining")
                    navigate("../projects")
                }
                console.log("E: ", e)
                toast.error(e?.response?.data?.detail || "Failed to fetch project details")
            }
        }

        const fetchProjectTasks = async () => {
            try {
                const res = await getTasks(projectId, "", 0, 5)
                setProjectTasks(res?.data)
            } catch (e) {
                console.log("E: ", e)
                toast.error(e?.response?.data?.detail || "Failed to fetch project task")
            }
        }

        fetchProjectDatils()
        fetchProjectTasks()
        fetchAndSetMembers()
    }, [projectId]);

    useEffect(() => {
        const isAdmin = currentMember?.role === "admin"
        const projectCreator = currentMember?.id === projectDetails?.creator?.id
        const projectLead = currentMember?.id === projectDetails?.lead?.id

        setCanCrud(isAdmin || projectCreator || projectLead)
    }, [projectDetails]);


    const handleMemberAdd = (m) => {
        const memberExists = projectDetails?.members?.some(i => i?.id === m?.id)
        if (memberExists) {
            setProjectDetails({
                ...projectDetails,
                ["members"]: projectDetails?.members?.filter(i => i?.id !== m?.id)
            })
        } else {
            setProjectDetails({...projectDetails, ["members"]: [...projectDetails.members, m]})
        }
    }

    const handleProjectUpdate = async () => {
        const cleanedData = {}
        try {
            cleanedData["name"] = projectDetails?.name
            cleanedData["desc"] = projectDetails?.desc
            cleanedData["lead"] = projectDetails?.lead ? projectDetails?.lead?.id : null
            cleanedData["status"] = projectDetails?.status
            cleanedData["members"] = projectDetails?.members?.map(i => i.id)

            const {sd, dd} = validateStartAndEndDate(projectDetails?.start_date, projectDetails?.due_date)
            cleanedData["startDate"] = sd
            cleanedData["dueDate"] = dd
        } catch (e) {
            console.log("E: ", e)
            toast.error(String(e) || "Failed to clean date")
            return
        }


        try {
            const res = await updateProject(projectId, cleanedData)
            setOldProject(res?.data)
            setProjectDetails(res?.data)
            toast.success("Project updated successfully")
        } catch (e) {
            setProjectDetails(oldProject)
            console.log("Update error: ", e)
            toast.error(e?.response?.data?.detail || "Failed to update project")
        }
    }

    const handleDeleteProject = async () => {
        if (!confirm("Are you sure?")) return

        try {
            await deleteAndSetProjects(projectId)
            toast.success("Post deleted successfully")
            navigate("../projects")
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Failed to delete project")
        }
    }

    console.log("Recent Tasks: ", projectTasks)


    if (!projectDetails) {
        return null
    }

    return (
        <div className="bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <div className="mb-12 w-full flex items-center justify-between gap-4">
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-3"
                    >
                        <Link to="../projects">
                            <ChevronLeft/>
                            Projects
                        </Link>
                    </Button>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            disabled={oldProject === projectDetails || !canCrud}
                            onClick={handleProjectUpdate}
                        >
                            Save changes
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={!canCrud}
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
                                        canCrud &&
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={handleDeleteProject}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    }
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="mt-8 mb-12 flex flex-col  items-start justify-start gap-6">
                    <div className="w-full flex flex-col  items-start justify-start gap-3">
                        <textarea
                            placeholder="Project name..."
                            maxLength="99"
                            className="text-xl! w-full font-medium p-0 rounded-none h-auto! bg-transparent! field-sizing-content ring-0! outline-none! border-none resize-none"
                            value={projectDetails?.name}
                            onChange={(e) => setProjectDetails({...projectDetails, ["name"]: e?.target?.value})}
                            spellCheck={false}
                        />
                        <Textarea
                            maxLength="999"
                            placeholder="Project description..."
                            className="p-0 text-base! w-full rounded-none text-muted-foreground disabled:opacity-100 disabled:cursor-auto bg-transparent! field-sizing-content ring-0! outline-none! border-none resize-none"
                            value={projectDetails?.desc}
                            onChange={(e) => setProjectDetails({...projectDetails, ["desc"]: e?.target?.value})}
                            spellCheck={false}
                        />
                    </div>
                    <div className="w-full text-sm pt-8 border-t flex flex-col items-start justify-start gap-6">
                        <h4 className="text-base font-medium text-muted-foregroun">Properties</h4>
                        <div className="w-full flex flex-col justify-center gap-8">
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Lead</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        asChild
                                        disabled={!canCrud}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="col-start-2 col-span-full opacity-100! w-max flex items-center gap-1"
                                        >
                                            {projectDetails?.lead ? <>
                                                <Avatar className="size-6">
                                                    <AvatarFallback
                                                        className="text-xs"
                                                    >{projectDetails?.lead?.user?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{projectDetails?.lead?.user?.email}</span>
                                            </> : <span className="py-0.5 px-1 text-yellow-500">No lead</span>}
                                            <ChevronDown
                                                className="ml-auto self-center my-auto size-4 text-muted-foreground"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="max-w-xs overflow-hidden">
                                        {members?.map((m) => (<DropdownMenuCheckboxItem
                                            key={m?.id}
                                            value={m}
                                            checked={projectDetails?.lead?.id === m?.id}
                                            onCheckedChange={() => setProjectDetails({
                                                ...projectDetails,
                                                ["lead"]: projectDetails?.lead?.id === m?.id ? null : m
                                            })}
                                        >
                                            <div className="flex items-center gap-1">
                                                <Avatar
                                                    className="size-6"
                                                >
                                                    <AvatarFallback
                                                        className="text-xs"
                                                    >{m?.user?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{m?.user?.email}</span>
                                            </div>
                                        </DropdownMenuCheckboxItem>))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Members</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        asChild
                                        disabled={!canCrud}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="col-start-2 col-span-full opacity-100! w-fit flex flex-wrap items-start justify-start gap-3 h-max"
                                        >
                                            {(projectDetails?.members && projectDetails?.members?.length > 0) ? projectDetails?.members?.map((m) => (
                                                <div
                                                    key={m?.id}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Avatar
                                                        className="size-6"
                                                    >
                                                        <AvatarFallback
                                                            className="text-xs"
                                                        >{m?.user?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{m?.user?.email?.slice(0, 8)}...</span>
                                                </div>)) : <p className="py-0.5 px-1 text-yellow-500">No members</p>}
                                            <ChevronDown
                                                className="ml-2 self-center my-auto size-4 text-muted-foreground"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    {members && <DropdownMenuContent className="max-w-xs min-w-xs w-full">
                                        {members?.map((_m) => (<DropdownMenuCheckboxItem
                                            key={_m?.id}
                                            checked={projectDetails?.members?.some(i => i?.id === _m?.id)}
                                            onCheckedChange={() => handleMemberAdd(_m)}
                                        >
                                            <div className="flex items-center gap-1">
                                                <Avatar
                                                    className="size-6"
                                                >
                                                    <AvatarFallback
                                                        className="text-xs"
                                                    >{_m?.user?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="overflow-hidden text-ellipsis block w-full">{_m?.user?.email}</span>
                                            </div>
                                        </DropdownMenuCheckboxItem>))}
                                    </DropdownMenuContent>}
                                </DropdownMenu>
                            </div>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Created by</p>
                                <div
                                    className="col-start-2 col-span-full px-3 py-1 w-fit flex flex-wrap items-start justify-start gap-3"
                                >
                                    {projectDetails?.creator ?
                                        <div className="flex items-center gap-1">
                                            <Avatar
                                                className="size-6"
                                            >
                                                <AvatarFallback
                                                    className="text-xs"
                                                >{projectDetails?.creator?.user?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{projectDetails?.creator?.user?.email}</span>
                                        </div>
                                        :
                                        <p className="py-0.5 px-1">NULL / DELETED</p>
                                    }
                                </div>
                            </div>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Start date</p>
                                <Popover
                                    open={openStartDatePicker}
                                    onOpenChange={setOpenStartDatePicker}
                                >
                                    <PopoverTrigger
                                        asChild
                                        disabled={!canCrud}
                                    >
                                        <Button
                                            variant="ghost"
                                            className={`${!projectDetails?.start_date && "text-muted-foreground"} opacity-100! w-max`}
                                        >
                                            {projectDetails?.start_date ? moment(projectDetails?.start_date).format("MMM DD, YYYY") : "No start date"}
                                            <ChevronDownIcon/>
                                        </Button>
                                    </PopoverTrigger>
                                    {projectDetails?.start_date && <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setProjectDetails({...projectDetails, ["start_date"]: null})}
                                    >
                                        <XIcon/>
                                    </Button>}
                                    <PopoverContent
                                        className="w-auto overflow-hidden p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={projectDetails?.start_date}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                setProjectDetails({...projectDetails, ["start_date"]: date})
                                                setOpenStartDatePicker(false)
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Due date</p>
                                <Popover
                                    open={openDueDatePicker}
                                    onOpenChange={setOpenDueDatePicker}
                                >
                                    <PopoverTrigger
                                        asChild
                                        disabled={!canCrud}
                                    >
                                        <Button
                                            variant="ghost"
                                            className={`${!projectDetails?.due_date && "text-muted-foreground"} opacity-100! w-max`}
                                        >
                                            {projectDetails?.due_date ? moment(projectDetails?.due_date).format("MMM DD, YYYY") : "No due date"}
                                            <ChevronDownIcon/>
                                        </Button>
                                    </PopoverTrigger>
                                    {projectDetails?.due_date && <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setProjectDetails({...projectDetails, ["due_date"]: null})}
                                    >
                                        <XIcon/>
                                    </Button>}
                                    <PopoverContent
                                        className="w-auto overflow-hidden p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={projectDetails?.due_date}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                setProjectDetails({...projectDetails, ["due_date"]: date})
                                                setOpenDueDatePicker(false)
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Created at</p>
                                <div
                                    className="px-3 py-2 col-start-2 col-span-full"
                                >
                                    {projectDetails?.created_at ? moment(projectDetails?.created_at).format("MMM DD, YYYY") : ""}
                                </div>
                            </div>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Last updated</p>
                                <div
                                    className="px-3 py-2 col-start-2 col-span-full"
                                >
                                    {projectDetails?.updated_at ? moment(projectDetails?.updated_at).format("MMM DD, YYYY") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        projectTasks && projectTasks?.items?.length > 0 &&
                        <div className="w-full text-sm pt-8 border-t flex flex-col items-start justify-start gap-6">
                            <div className="w-full flex items-center justify-between gap-4">
                                <h4 className="text-base font-medium text-muted-foregroun">Recent Tasks</h4>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-muted-foreground"
                                    asChild
                                >
                                    <Link to="tasks">
                                        All tasks
                                    </Link>
                                </Button>
                            </div>
                            <div className="w-full flex flex-col justify-center gap-8">
                                <ItemGroup>
                                    {projectTasks?.items?.map((task, i) => (
                                        <div
                                            key={`${task?.id}`}
                                            className="w-full grid grid-cols-5"
                                        >
                                            <div className="w-full py-4 col-span-1 flex items-center text-muted-foreground">{i + 1}</div>
                                            <Item
                                                className="px-0 pl-3 col-start-2 col-span-full w-full rounded-none"
                                                asChild
                                            >
                                                <div
                                                    className="border-b! border-b-accent! flex-1"
                                                >
                                                    <ItemContent className="w-full flex flex-row items-center justify-between gap-12">
                                                        <ItemTitle className="max-w-sm line-clamp-1">{task?.name}</ItemTitle>
                                                        <div
                                                            className="ml-auto items-center justify-end *:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale"
                                                        >
                                                            <div
                                                                className="flex items-center gap-1"
                                                            >{task?.assigned ? <>
                                                                    <Avatar
                                                                        className="size-6"
                                                                    >
                                                                        <AvatarFallback
                                                                            className="text-xs"
                                                                        >{task?.assigned?.user?.name?.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="max-w-24 text-ellipsis overflow-hidden">{task?.assigned?.user?.emails}</span>
                                                                </> :
                                                                <p className="flex items-center gap-1 text-muted-foreground">
                                                                    <CircleSlash2 size={16}/> No assignee</p>}
                                                            </div>
                                                        </div>
                                                    </ItemContent>
                                                </div>
                                            </Item>
                                        </div>
                                    ))}
                                </ItemGroup>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>);
};

