import React, { useEffect, useState } from "react";
import { useDraftStore } from "@/stores/draft-store.js";
import { toast } from "sonner";
import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet.jsx";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemTitle,
} from "@/components/ui/item.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ChevronDownIcon, Plus } from "lucide-react";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field.jsx";
import { Input } from "@/components/ui/input.jsx";
import { createTask } from "@/api/task-api.js";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.jsx";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.jsx";
import { Calendar } from "@/components/ui/calendar.jsx";
import moment from "moment";
import { validateStartAndEndDate } from "@/lib/form-validation.js";
import { useParams } from "react-router-dom";
import { getProjectMembers } from "@/api/project-api.js";

const NewTask = ({ data, setData, members }) => {
    const draftTask = useDraftStore((state) => state.task);
    const setDraftTask = useDraftStore((state) => state.setTask);
    const clearDraftTask = useDraftStore((state) => state.clearTask);
    const [projectMembers, setProjectMembers] = useState(null);
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [openDueDatePicker, setOpenDueDatePicker] = useState(false);
    const { projectId } = useParams();

    const fetchProjectMembers = async (projectId) => {
        try {
            const res = await getProjectMembers(projectId, "", 0, 9 ** 9);
            setProjectMembers(res?.data);
        } catch (e) {
            console.log(e || "Failed to fetch project activeMembers");
            toast.error(
                e?.response?.data?.detail ||
                    "Failed to fetch project activeMembers",
            );
        }
    };

    useEffect(() => {
        if (projectId !== null) {
            console.log("PID: ", projectId);
            fetchProjectMembers(projectId);
        }
    }, [data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanedData = {};
        try {
            cleanedData["name"] = draftTask?.name;
            cleanedData["desc"] = draftTask?.desc;
            cleanedData["assignee_id"] = draftTask?.assignee
                ? draftTask?.assignee
                : null;
            cleanedData["project_id"] = projectId;

            const { sd, dd } = validateStartAndEndDate(
                draftTask?.startDate,
                draftTask?.dueDate,
            );
            cleanedData["start_date"] = sd;
            cleanedData["due_date"] = dd;
        } catch (e) {
            console.log("E: ", e);
            toast.error(String(e) || "Failed to clean task date");
            return;
        }

        try {
            const res = await createTask(cleanedData);
            const newData = { ...data };
            newData["items"] = [res?.data, ...data.items];
            newData["total"] += 1;
            setData(newData);
            clearDraftTask();
            toast.success("Task created successfully");
        } catch (e) {
            console.log("Error: ", e);
            toast.error(e?.response?.data?.detail || "Failed to create task");
        }
    };

    return (
        <SheetContent>
            <SheetHeader className="border-b">
                <SheetTitle>New Task</SheetTitle>
                <SheetDescription className="hidden"></SheetDescription>
            </SheetHeader>
            <div className="w-full px-4">
                <form onSubmit={(e) => handleSubmit(e)}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="task-7j9-name-43j">
                                        Name
                                    </FieldLabel>
                                    <Input
                                        id="task-7j9-name-43j"
                                        placeholder="My task"
                                        value={draftTask?.name}
                                        onChange={(e) =>
                                            setDraftTask(
                                                "name",
                                                e?.target?.value,
                                            )
                                        }
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="task-7j9-desc">
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        id="task-7j9-desc"
                                        placeholder="Any additional deatil about the task"
                                        className="resize-none"
                                        value={draftTask?.desc}
                                        onChange={(e) =>
                                            setDraftTask(
                                                "desc",
                                                e?.target?.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="task-assignee-ts6">
                                        Assignee
                                    </FieldLabel>
                                    <Select
                                        value={draftTask?.assignee ?? null}
                                        onValueChange={(value) =>
                                            setDraftTask(
                                                "assignee",
                                                value || null,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="task-assignee-ts6">
                                            <SelectValue placeholder="--" />
                                        </SelectTrigger>
                                        {projectMembers && (
                                            <SelectContent>
                                                <SelectItem value={null}>
                                                    --
                                                </SelectItem>
                                                {projectMembers?.items.map(
                                                    (m) => (
                                                        <SelectItem
                                                            key={m.id}
                                                            value={m.id}
                                                        >
                                                            {m.user?.email}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        )}
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="start-date-picker">
                                        Start date
                                    </FieldLabel>
                                    <Popover
                                        open={openStartDatePicker}
                                        onOpenChange={setOpenStartDatePicker}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="start-date-picker"
                                                className="w-48 justify-between font-normal text-muted-foreground"
                                            >
                                                {draftTask?.startDate
                                                    ? moment(
                                                          draftTask?.startDate,
                                                      ).format("MMM DD, YYYY")
                                                    : "--"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto overflow-hidden p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={draftTask?.startDate}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setDraftTask(
                                                        "startDate",
                                                        date,
                                                    );
                                                    setOpenStartDatePicker(
                                                        false,
                                                    );
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="due-date-picker">
                                        Due date
                                    </FieldLabel>
                                    <Popover
                                        open={openDueDatePicker}
                                        onOpenChange={setOpenDueDatePicker}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="due-date-picker"
                                                className="w-48 justify-between font-normal text-muted-foreground"
                                            >
                                                {draftTask?.dueDate
                                                    ? moment(
                                                          draftTask?.dueDate,
                                                      ).format("MMM DD, YYYY")
                                                    : "--"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto overflow-hidden p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={draftTask?.dueDate}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setDraftTask(
                                                        "dueDate",
                                                        date,
                                                    );
                                                    setOpenDueDatePicker(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSeparator />
                        <Field orientation="horizontal">
                            <Button type="submit">Confirm</Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => clearDraftTask()}
                            >
                                Reset
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </SheetContent>
    );
};

export default NewTask;
