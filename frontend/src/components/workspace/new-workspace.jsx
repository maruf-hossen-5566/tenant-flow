import React, {useState} from 'react';
import {Input} from "@/components/ui/input.jsx";
import {Button} from "@/components/ui/button.jsx";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field.jsx";
import BackHome from "@/components/custom/auth/back-home.jsx";
import {useGlobalStore} from "@/stores/global-store.js";
import {toast} from "sonner";
import {createWorkspace} from "@/api/workspace-api.js";
import {useWorkspaceStore} from "@/stores/workspace-store.js";
import {useNavigate} from "react-router-dom";

const NewWorkspace = () => {
    const [spaceName, setSpaceName] = useState("")
    const isLoading = useGlobalStore(state => state.isLoading)
    const setIsLoading = useGlobalStore(state => state.setIsLoading)
    const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace)
    const setActiveWorkspace = useWorkspaceStore(state => state.setActiveWorkspace)
    const workspaces = useWorkspaceStore(state => state.workspaces)
    const setWorkspaces = useWorkspaceStore(state => state.setWorkspaces)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await createWorkspace({name: spaceName})
            setWorkspaces(workspaces ? [...workspaces, res?.data] : [res?.data])
            setActiveWorkspace(res?.data)
            navigate(`/workspaces/${activeWorkspace?.id}`)
        } catch (e) {
            console.log("Ws create error: ", e)
            toast.error(e?.response?.data?.detail || "Failed to create workspace")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <BackHome/>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-xl font-bold">Create a new workspace</h1>
                            <FieldDescription>
                                Workspaces are shared environments where teams can work on projects.
                            </FieldDescription>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="space-name">Name</FieldLabel>
                            <Input
                                id="space-name"
                                type="text"
                                placeholder="My workspace"
                                autoFocus
                                required
                                value={spaceName}
                                onChange={(e) => setSpaceName(e.target.value)}
                            />
                        </Field>
                        <Field>
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >Create</Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    );
};

export default NewWorkspace;