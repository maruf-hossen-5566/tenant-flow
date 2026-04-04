import {Button} from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {useAuthStore} from "@/stores/auth-store.js";
import React, {useState} from "react";
import {toast} from "sonner";
import {logTheUserOut} from "@/lib/utils.js";
import {changePassword, deleteAccount} from "@/api/user-api.js";


const Security = () => {
    const user = useAuthStore(state => state.user)
    const iniData = {"pass": "", "newPass": "", "confNewPass": ""}
    const [data, setData] = useState(iniData)

    const handleChangePassword = async (e) => {
        e.preventDefault()

        try {
            await changePassword(data)
            logTheUserOut()
            toast.success("Password changed successfully, Now please log in with new credentials")
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to change password")
        }
    }

    const handleDeleteAccount = async (e) => {
        e.preventDefault()

        if(!confirm("Are you sure?")){
            return
        }

        try {
            await deleteAccount()
            logTheUserOut()
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to delete account")
        }
    }


    return (
        <div className="bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <h1 className="py-12 text-xl flex items-center gap-2 font-bold">
                    Security
                </h1>

                <FieldSeparator/>
                <div className="py-6 flex w-full flex-col">
                    <div className="w-full mx-auto">
                        <form onSubmit={handleChangePassword}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Change password</FieldLegend>
                                    <FieldDescription>
                                        Change your password
                                    </FieldDescription>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="security-7j9-old-pass-uw1">
                                                Current password
                                            </FieldLabel>
                                            <Input
                                                id="security-7j9-old-pass-uw1"
                                                type="password"
                                                value={data?.pass}
                                                onChange={e => setData({...data, ["pass"]: e.target.value})}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="security-7j9-new-pass-43j">
                                                New password
                                            </FieldLabel>
                                            <Input
                                                id="security-7j9-new-pass-43j"
                                                type="password"
                                                value={data?.newPass}
                                                onChange={e => setData({...data, ["newPass"]: e.target.value})}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="security-7j9-conf-new-pass-uw1">
                                                Confirm new password
                                            </FieldLabel>
                                            <Input
                                                id="security-7j9-conf-new-pass-uw1"
                                                type="password"
                                                value={data?.confNewPass}
                                                onChange={e => setData({...data, ["confNewPass"]: e.target.value})}
                                            />
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                                <Field orientation="horizontal">
                                    <Button
                                        type="submit"
                                        disabled={Object.keys(data).some(k => data[k]?.trim() === "" || data[k]?.trim()?.length < 1)}
                                    >Confirm</Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setData(iniData)}
                                    >
                                        Cancel
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>
                        <FieldSeparator className="my-6"/>
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend className="text-red-500">Delete account</FieldLegend>
                                <FieldDescription>Deleting an account is irreversible, deleting all projects, files,
                                                  tasks, and settings.</FieldDescription>
                                <FieldGroup>
                                    <Field orientation="horizontal">
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                        >Delete account</Button>
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

export default Security;