import {Button} from "@/components/ui/button"
import {Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet,} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {useAuthStore} from "@/stores/auth-store.js";
import moment from "moment";
import React, {useState} from "react";
import {toast} from "sonner";
import {updateAccountDetails} from "@/api/user-api.js";

const Account = () => {
    const user = useAuthStore(state => state.user)
    const setUser = useAuthStore(state => state.setUser)
    const [userData, setUserData] = useState(user || null)

    const handleUpdateProfile = async (e) => {
        e.preventDefault()

        try {
            const res = await updateAccountDetails(userData)
            setUser(res?.data)
            setUserData(res?.data)
            toast.success("Account updated successfully")
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to update account")
        }
    }

    return (
        <div className="bg-background w-full flex min-h-svh flex-col gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl mx-auto flex flex-col">
                <h1 className="py-12 text-xl flex items-center gap-2 font-bold">
                    Account
                </h1>
                <FieldSeparator/>
                <div className="py-6 flex w-full flex-col">
                    <div className="w-full mx-auto">
                        <form onSubmit={handleUpdateProfile}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="profile-7j9-name-43j">
                                                Name
                                            </FieldLabel>
                                            <Input
                                                id="profile-7j9-name-43j"
                                                placeholder="My name"
                                                value={userData?.name}
                                                onChange={e => setUserData({...userData, ["name"]: e.target.value})}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="profile-7j9-email-uw1">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                id="profile-7j9-email-uw1"
                                                placeholder="user@example.com"
                                                value={userData?.email}
                                                onChange={() => console.log("Peace...")}
                                                disabled
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="profile-7j9-joined-uw1">
                                                Joined
                                            </FieldLabel>
                                            <Input
                                                id="profile-7j9-joined-uw1"
                                                value={moment(user?.created_at).format("DD MMM, YYYY")}
                                                disabled
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="profile-7j9-updated-uw1">
                                                Last updated
                                            </FieldLabel>
                                            <Input
                                                id="profile-7j9-updated-uw1"
                                                value={moment(user?.updated_at).format("DD MMM, YYYY")}
                                                disabled
                                            />
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                                <FieldSeparator/>
                                <Field orientation="horizontal">
                                    <Button
                                        type="submit"
                                        disabled={userData === user}
                                    >Update</Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setUserData(user)}
                                    >
                                        Cancel
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;