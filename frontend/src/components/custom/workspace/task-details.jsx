import React, {useEffect, useRef, useState} from 'react';
import {SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/components/ui/sheet.jsx";
import {Button} from "@/components/ui/button.jsx";
import {ChevronDown, ChevronDownIcon, Ellipsis, XIcon} from "lucide-react";
import {Textarea} from "@/components/ui/textarea.jsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.jsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.jsx";
import {Calendar} from "@/components/ui/calendar.jsx";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.jsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.jsx";
import moment from "moment";
import {toast} from "sonner";
import {deleteTask, updateTask} from "@/api/task-api.js";
import {validateStartAndEndDate} from "@/lib/form-validation.js";
import {Link, useSearchParams} from "react-router-dom";
import {useAuthStore} from "@/stores/auth-store.js";
import {getProjectMembers} from "@/api/project-api.js";


const TaskDetails = ({task, data, setData, projectId}) => {
    const [open, setOpen] = useState(false);
    const [oldTask, setOldTask] = useState(task ? task : null)
    const [taskDetails, setTaskDetails] = useState(task ? task : null)
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false)
    const [openDueDatePicker, setOpenDueDatePicker] = useState(false)
    const [projectMembers, setProjectMembers] = useState(null)
    const closeBtnRef = useRef(null)
    const currentMember = useAuthStore(state => state.member)
    const [canCrud, setCanCrud] = useState(false)
    const [_, setSearchParams] = useSearchParams()

    const fetchProjectMembers = async () => {
        try {
            const res = await getProjectMembers(projectId, "", 0, 9 ** 9)
            setProjectMembers(res?.data)
        } catch (e) {
            console.log(e || "Failed to fetch project activeMembers")
            toast.error(e?.response?.data?.detail || "Failed to fetch project activeMembers")
        }
    }
    useEffect(() => {
        if (open) {
            fetchProjectMembers();
        }
    }, [open]);


    const handleTaskUpdate = async () => {
        const cleanedData = {...taskDetails}
        try {
            cleanedData["name"] = taskDetails?.name
            cleanedData["desc"] = taskDetails?.desc
            cleanedData["assignee_id"] = taskDetails?.assigned ? taskDetails?.assigned?.id : null
            cleanedData["project_id"] = projectId
            cleanedData["status"] = taskDetails?.status

            const {sd, dd} = validateStartAndEndDate(taskDetails?.start_date, taskDetails?.due_date)
            cleanedData["start_date"] = sd
            cleanedData["due_date"] = dd
        } catch (e) {
            console.log("E: ", e)
            toast.error(String(e) || "Failed to clean task date")
            return
        }

        try {
            const res = await updateTask(task?.id, task?.project_id, cleanedData)
            const newData = {...data}
            newData["items"] = data?.items?.map(t => t?.id === res?.data?.id ? res?.data : t)
            setData(newData)
            setOldTask(res?.data)
            setTaskDetails(res?.data)
            toast.success("Task updated successfully")
        } catch (e) {
            console.log(e || "Failed to update task")
            toast.error(e?.response?.data?.detail || "Failed to update task")
        }
    }

    useEffect(() => {
        const isAdmin = currentMember?.role === "admin"
        const projectCreator = currentMember?.id === taskDetails?.project?.creator?.id
        const taskCreator = currentMember?.id === taskDetails?.creator?.id
        const projectLead = currentMember?.id === taskDetails?.project?.lead?.id
        const taskAssignee = currentMember?.id === taskDetails?.assignee_id

        setCanCrud(isAdmin || taskCreator || projectCreator || projectLead || taskAssignee)
    }, [taskDetails, data]);


    const handleDeleteTask = async () => {
        if (!confirm("Are you sure?")) return

        try {
            await deleteTask(task?.id, task?.project_id)
            closeBtnRef?.current?.click()
            setTimeout(() => {
                const newData = {...data}
                newData["items"] = data?.items?.filter(t => t?.id !== taskDetails?.id)
                newData["total"] -= 1
                setData(newData)
            }, 500)
            setSearchParams(() => {
                const newParams = new URLSearchParams();
                newParams.set('skip', String(0));
                return newParams;
            });
            window.location.reload()
            toast.success("Task deleted successfully")
        } catch (e) {
            console.log(e || "Failed to delete task")
            toast.error(e?.response?.data?.detail || "Failed to delete task")
        }
    }


    if (!taskDetails) {
        return null
    }


    return (<SheetContent className="max-w-full sm:max-w-xl w-full">
        <SheetHeader className="border-b">
            <SheetTitle className="hidden"></SheetTitle>
            <SheetDescription className="hidden"></SheetDescription>
            <div className="w-full flex items-center justify-end gap-4 bg-background z-1">
                <SheetClose
                    asChild
                    ref={closeBtnRef}
                    id="sdfsdfsdfsdfsdfsdfsdfsdfsdfsdf"
                >
                    <Button
                        variant="ghost"
                        className="mr-auto"
                    >
                        <XIcon/>
                    </Button>
                </SheetClose>

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
                                    onClick={handleDeleteTask}
                                >
                                    Delete
                                </DropdownMenuItem>
                            }
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    disabled={oldTask === taskDetails || !canCrud}
                    onClick={handleTaskUpdate}
                >
                    Save changes
                </Button>
            </div>
        </SheetHeader>
        <div className="w-full">
            <div className="bg-background w-full flex min-h-svh flex-col gap-6 px-6 pb-12">
                <div className="w-full max-w-3xl mx-auto flex flex-col">
                    <div className="mt-4 mb-12 flex flex-col  items-start justify-start gap-6">
                        <div className="w-full flex flex-col  items-start justify-start gap-3">
                            <textarea
                                placeholder="Project name..."
                                maxLength="99"
                                className="text-xl! w-full font-medium p-0 rounded-none h-auto! bg-transparent! field-sizing-content ring-0! outline-none! border-none resize-none"
                                value={taskDetails?.name}
                                onChange={(e) => setTaskDetails({...taskDetails, ["name"]: e?.target?.value})}
                                spellCheck={false}
                            />
                            <Textarea
                                maxLength="999"
                                placeholder="Project description..."
                                className="p-0 text-base! w-full rounded-none text-muted-foreground disabled:opacity-100 disabled:cursor-auto bg-transparent! field-sizing-content ring-0! outline-none! border-none resize-none"
                                value={taskDetails?.desc}
                                onChange={(e) => setTaskDetails({...taskDetails, ["desc"]: e?.target?.value})}
                                spellCheck={false}
                            />
                        </div>
                        <div className="w-full text-sm pt-8 border-t flex flex-col items-start justify-start gap-6">
                            <h4 className="text-base font-medium text-muted-foregroun">Properties</h4>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Status</p>
                                <Select
                                    value={taskDetails?.status}
                                    onValueChange={(value) => setTaskDetails({...taskDetails, ["status"]: value})}
                                >
                                    <SelectTrigger
                                        disabled={!canCrud}
                                        className={`capitalize border-none bg-background! hover:bg-input/50! ${taskDetails?.status === "done" ? "text-green-500" : taskDetails?.status === "doing" ? "text-blue-500" : ""}`}
                                    >
                                        <SelectValue>
                                            {taskDetails?.status}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup
                                            className="capitalize"
                                        >
                                            <SelectItem value="todo">Todo</SelectItem>
                                            <SelectItem
                                                value="doing"
                                                className="text-blue-500!"
                                            >Doing</SelectItem>
                                            <SelectItem
                                                value="done"
                                                className="text-green-500!"
                                            >Done</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full grid grid-cols-5 gap-4">
                                <p className="col-span-1 py-2 text-muted-foreground">Project</p>
                                <Link
                                    to={`../projects/${task?.project_id}`}
                                    className="col-start-2 col-span-full hover:underline w-max mr-auto px-3 flex items-center gap-1"
                                >
                                    {
                                        taskDetails?.project ?
                                            <>
                                                <span className="max-w-44 text-nowrap text-ellipsis overflow-hidden">{taskDetails?.project?.name}</span>
                                            </>
                                            :
                                            <span className="text-muted-foreground">NULL</span>
                                    }
                                </Link>
                            </div>
                            <div className="w-full flex flex-col justify-center gap-8">
                                <div className="w-full grid grid-cols-5 gap-4">
                                    <p className="col-span-1 py-2 text-muted-foreground">Assignee</p>
                                    <DropdownMenu
                                        open={open}
                                        onOpenChange={setOpen}
                                    >
                                        <DropdownMenuTrigger
                                            asChild
                                            disabled={!canCrud}
                                        >
                                            <Button
                                                variant="ghost"
                                                className={`col-start-2 px-2! col-span-full w-max opacity-100! flex items-center gap-1`}
                                            >
                                                {taskDetails?.assigned ? <>
                                                    <Avatar className="size-6">
                                                        <AvatarFallback
                                                            className="text-xs"
                                                        >{taskDetails?.assigned?.user?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{taskDetails?.assigned?.user?.email}</span>
                                                </> : <span
                                                    className="py-0.5 px-1 text-yellow-500"
                                                >No assignee</span>}
                                                <ChevronDown
                                                    className="ml-auto self-center my-auto size-4 text-muted-foreground"
                                                />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="max-w-60 overflow-hidden">
                                            {
                                                projectMembers ?
                                                    (projectMembers?.items?.map((m) => (<DropdownMenuCheckboxItem
                                                        key={m?.id}
                                                        value={m}
                                                        checked={taskDetails?.assigned?.id === m?.id}
                                                        onCheckedChange={() => setTaskDetails({
                                                            ...taskDetails,
                                                            ["assigned"]: taskDetails?.assigned?.id === m?.id ? null : m
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
                                                    </DropdownMenuCheckboxItem>)))
                                                    :
                                                    <span>Loading / No members</span>
                                            }
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="w-full grid grid-cols-5 gap-4">
                                    <p className="col-span-1 py-2 text-muted-foreground">Created by</p>
                                    <div
                                        className="col-start-2 col-span-full w-max mr-auto px-3 flex items-center gap-1"
                                    >
                                        {
                                            taskDetails?.creator ?
                                                <>
                                                    <Avatar className="size-6">
                                                        <AvatarFallback
                                                            className="text-xs"
                                                        >{taskDetails?.creator?.user?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{taskDetails?.creator?.user?.email}</span>
                                                </>
                                                :
                                                <span className="text-muted-foreground">NULL</span>
                                        }
                                    </div>
                                </div>
                                <div className="w-full grid grid-cols-5 gap-4">
                                    <p className="col-start-1 py-2 text-muted-foreground">Start date</p>
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
                                                className={`${!taskDetails?.start_date && "text-muted-foreground"} w-max`}
                                            >
                                                {taskDetails?.start_date ? moment(taskDetails?.start_date).format("MMM DD, YYYY") : "No start date"}
                                                <ChevronDownIcon/>
                                            </Button>
                                        </PopoverTrigger>
                                        {taskDetails?.start_date && <Button
                                            size="icon"
                                            variant="ghost"
                                            className="ml-6"
                                            onClick={() => setTaskDetails({...taskDetails, ["start_date"]: null})}
                                        >
                                            <XIcon/>
                                        </Button>}
                                        <PopoverContent
                                            className="w-auto overflow-hidden p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={taskDetails?.start_date}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setTaskDetails({...taskDetails, ["start_date"]: date})
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
                                                className={`${!taskDetails?.due_date && "text-muted-foreground"} w-max`}
                                            >
                                                {taskDetails?.due_date ? moment(taskDetails?.due_date).format("MMM DD, YYYY") : "No due date"}
                                                <ChevronDownIcon/>
                                            </Button>
                                        </PopoverTrigger>
                                        {taskDetails?.due_date && <Button
                                            size="icon"
                                            variant="ghost"
                                            className="ml-6"
                                            onClick={() => setTaskDetails({...taskDetails, ["due_date"]: null})}
                                        >
                                            <XIcon/>
                                        </Button>}
                                        <PopoverContent
                                            className="w-auto overflow-hidden p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={taskDetails?.due_date}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setTaskDetails({...taskDetails, ["due_date"]: date})
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
                                        {taskDetails?.created_at ? moment(taskDetails?.created_at).format("MMM DD, YYYY") : ""}
                                    </div>
                                </div>
                                <div className="w-full grid grid-cols-5 gap-4">
                                    <p className="col-span-1 py-2 text-muted-foreground">Last updated</p>

                                    <div
                                        className="px-3 py-2 col-start-2 col-span-full"
                                    >
                                        {taskDetails?.updated_at ? moment(taskDetails?.updated_at).format("MMM DD, YYYY") : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </SheetContent>);
};

export default TaskDetails;