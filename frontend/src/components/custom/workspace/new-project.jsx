import { ChevronDown, ChevronDownIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemTitle,
} from "@/components/ui/item";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useWorkspaceStore } from "@/stores/workspace-store.js";
import { useDraftStore } from "@/stores/draft-store.js";
import pluralize from "pluralize";
import { useState } from "react";
import { createProject } from "@/api/project-api.js";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.jsx";
import { Calendar } from "@/components/ui/calendar.jsx";
import moment from "moment";
import { validateStartAndEndDate } from "@/lib/form-validation.js";
import { toast } from "sonner";

const NewProject = ({ data, setData }) => {
    const members = useWorkspaceStore((state) => state.activeMembers);
    const activeProjects = useWorkspaceStore((state) => state.activeProjects);
    const setActiveProjects = useWorkspaceStore(
        (state) => state.setActiveProjects,
    );
    const draftProject = useDraftStore((state) => state.project);
    const clearDraftProject = useDraftStore((state) => state.clearProject);
    const setDraftProject = useDraftStore((state) => state.setProject);
    const [openDueDatePicker, setOpenDueDatePicker] = useState(false);
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanedDate = {
            ...draftProject,
        };

        try {
            const { sd, dd } = validateStartAndEndDate(
                cleanedDate?.startDate,
                cleanedDate?.dueDate,
            );
            cleanedDate["startDate"] = sd;
            cleanedDate["dueDate"] = dd;
        } catch (e) {
            toast.error(String(e) || "Failed to validate dates");
            return;
        }

        try {
            const res = await createProject(cleanedDate);
            setActiveProjects(
                activeProjects ? [res?.data, ...activeProjects] : [res?.data],
            );
            const newData = { ...data };
            newData["items"] = [res?.data, ...data.items];
            newData["total"] += 1;
            setData(newData);
            clearDraftProject();
            toast.success("Project added successfully.");
        } catch (e) {
            console.log("E: ", e);
            toast.error(
                e?.response?.data?.detail || "Failed to create project",
            );
        }
    };

    const handleMemberAdd = (id) => {
        let oldMembers = draftProject?.members || [];
        const memberExists = oldMembers?.some((i) => i === id);
        if (memberExists) {
            setDraftProject(
                "members",
                oldMembers?.filter((i) => i !== id),
            );
        } else {
            setDraftProject("members", [...draftProject.members, id]);
        }
    };

    return (
        <SheetContent className="pb-12 overflow-y-auto">
            <SheetHeader className="border-b">
                <SheetTitle>Project</SheetTitle>
                <SheetDescription className="hidden"></SheetDescription>
            </SheetHeader>
            <div className="w-full px-4">
                <form onSubmit={(e) => handleSubmit(e)}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="project-7j9-name-43j">
                                        Name
                                    </FieldLabel>
                                    <Input
                                        id="project-7j9-name-43j"
                                        placeholder="My project"
                                        value={draftProject?.name}
                                        onChange={(e) =>
                                            setDraftProject(
                                                "name",
                                                e?.target?.value,
                                            )
                                        }
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="project-7j9-desc">
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        id="project-7j9-desc"
                                        placeholder="Add any additional deatil about the project"
                                        className="resize-none"
                                        value={draftProject?.desc}
                                        onChange={(e) =>
                                            setDraftProject(
                                                "desc",
                                                e?.target?.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="project-lead-ts6">
                                        Lead
                                    </FieldLabel>
                                    <Select
                                        value={draftProject?.lead ?? null}
                                        onValueChange={(value) =>
                                            setDraftProject(
                                                "lead",
                                                value || null,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="project-lead-ts6">
                                            <SelectValue placeholder="--" />
                                        </SelectTrigger>
                                        {members && (
                                            <SelectContent>
                                                <SelectItem value={null}>
                                                    --
                                                </SelectItem>
                                                {members.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={m.id}
                                                    >
                                                        {m.user?.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        )}
                                    </Select>
                                    <FieldDescription className="text-xs">
                                        Lead and Creator are members by default
                                    </FieldDescription>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="project-members-ts6">
                                        Members
                                    </FieldLabel>
                                    <DropdownMenu className="max-w-xs min-w-xs w-full">
                                        <DropdownMenuTrigger
                                            id="project-members-ts6"
                                            asChild
                                        >
                                            <Button
                                                variant="outline"
                                                className="justify-between bg-input text-muted-foreground"
                                            >
                                                {draftProject?.members?.length >
                                                0 ? (
                                                    <span>
                                                        {
                                                            draftProject
                                                                ?.members
                                                                ?.length
                                                        }{" "}
                                                        {pluralize(
                                                            "member",
                                                            draftProject
                                                                ?.members
                                                                ?.length,
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span>--</span>
                                                )}
                                                <ChevronDown />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        {members && (
                                            <DropdownMenuContent className="max-w-xs min-w-xs w-full">
                                                {members?.map((m) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={m?.id}
                                                        checked={draftProject?.members?.includes(
                                                            m?.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            handleMemberAdd(
                                                                m?.id,
                                                            )
                                                        }
                                                    >
                                                        {m?.user?.email}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        )}
                                    </DropdownMenu>
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
                                                {draftProject?.startDate
                                                    ? moment(
                                                          draftProject?.startDate,
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
                                                selected={
                                                    draftProject?.startDate
                                                }
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setDraftProject(
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
                                                {draftProject?.dueDate
                                                    ? moment(
                                                          draftProject?.dueDate,
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
                                                selected={draftProject?.dueDate}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setDraftProject(
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
                                onClick={clearDraftProject}
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

export default NewProject;
