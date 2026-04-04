import React, {useEffect, useState} from 'react';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet
} from "@/components/ui/field.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Button} from "@/components/ui/button.jsx";
import moment from "moment";
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {toast} from "sonner";
import {activeWorkspaceDetails, deleteWorkspace, updateWorkspace} from "@/api/workspace-api.js";
import {useAuthStore} from "@/stores/auth-store.js";
import {useDraftStore} from "@/stores/draft-store.js";
import {useNavigate} from "react-router-dom";
import {getMyInvitations} from "@/api/invitation-api.js";
import AdminViewOnly from "@/components/others/admin-view-only.jsx";

const Workspace = () => {
    const currentMember = useAuthStore(state => state.member)
    const activeSpace = useWorkspaceStore(state => state.activeWorkspace)
    const setActiveSpace = useWorkspaceStore(state => state.setActiveWorkspace)
    const clearDraftStore = useDraftStore(state => state.clearStore)
    const cluseWorkspaceStore = useWorkspaceStore(state => state.clearStore)
    const navigate = useNavigate()
    const [data, setData] = useState(activeSpace || null)


    useEffect(() => {
        const getActiveWorkspace = async () => {
            try {
                const res = await activeWorkspaceDetails()
                setData(res?.data)
                setActiveSpace(res?.data)
            } catch (e) {
                console.log("E: ", e)
                toast.error(e?.response?.data?.detail || "Failed to get workspace details")
            }
        }
        getActiveWorkspace()
    }, [])


    const handleUpdateWorkspace = async (e) => {
        e.preventDefault()

        try {
            const res = await updateWorkspace(data)
            setData(res?.data)
            setActiveSpace(res?.data)
            toast.success("Workspace updated successfully")
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to update workspace")
        }
    }

    const handleDeleteWorkspace = async (e) => {
        e.preventDefault()
        if (!confirm("Are you sure?")) return

        try {
            await deleteWorkspace()
            clearDraftStore()
            cluseWorkspaceStore()
            navigate("/workspaces")
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to update workspace")
        }
    }

    if (currentMember?.role !== "admin") {
        return <AdminViewOnly/>
    }

    return (
        <div className={`${currentMember?.role !== "admin" && "pointer-events-none opacity-50 cursor-not-allowed!"} bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10`}>
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <h1 className="py-12 text-xl flex items-center gap-2 font-bold">
                    Workspace
                </h1>
                <FieldSeparator/>
                <div className="py-6 flex w-full flex-col">
                    <div className="w-full mx-auto">
                        <form>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="workspace-7j9-name-43j">
                                                Name
                                            </FieldLabel>
                                            <Input
                                                id="workspace-7j9-name-43j"
                                                placeholder="My name"
                                                value={data?.name}
                                                onChange={e => setData({...data, ["name"]: e.target.value})}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="workspace-7j9-joined-uw1">
                                                Created by
                                            </FieldLabel>
                                            <Input
                                                id="workspace-7j9-joined-uw1"
                                                value={data?.creator?.email || "NULL / DELETED"}
                                                onChange={() => console.log("Nothing...")}
                                                disabled
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="workspace-7j9-joined-uw1">
                                                Created
                                            </FieldLabel>
                                            <Input
                                                id="workspace-7j9-joined-uw1"
                                                value={moment(data?.created_at).format("DD MMM, YYYY")}
                                                onChange={() => console.log("Nothing...")}
                                                disabled
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="workspace-7j9-joined-uw1">
                                                Last updated
                                            </FieldLabel>
                                            <Input
                                                id="workspace-7j9-joined-uw1"
                                                value={moment(data?.updated_at).format("DD MMM, YYYY")}
                                                onChange={() => console.log("Nothing...")}
                                                disabled
                                            />
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                                <Field orientation="horizontal">
                                    <Button
                                        type="submit"
                                        onClick={handleUpdateWorkspace}
                                        disabled={currentMember?.role !== "admin" || data === activeSpace}
                                    >Update</Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setData(activeSpace)}
                                    >
                                        Cancel
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>
                        <FieldSeparator className="my-6"/>
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend className="text-red-500">Delete workspace</FieldLegend>
                                <FieldDescription>Deleting a workspace is irreversible, deleting all projects, files,
                                                  tasks, and settings.</FieldDescription>
                                <FieldGroup>
                                    <Field orientation="horizontal">
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteWorkspace}
                                            disabled={currentMember?.role !== "admin"}
                                        >Delete workspace</Button>
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;