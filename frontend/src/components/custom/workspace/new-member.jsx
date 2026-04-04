import React from 'react';
import {SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/components/ui/sheet.jsx";
import {Button} from "@/components/ui/button.jsx";
import {Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet} from "@/components/ui/field.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.jsx";
import {useDraftStore} from "@/stores/draft-store.js";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea.jsx";
import {addMember} from "@/api/membership-api.js";
import {useAuthStore} from "@/stores/auth-store.js";

const NewMember = ({data, setData}) => {
    const draftMembers = useDraftStore(state => state.member)
    const setDraftMember = useDraftStore(state => state.setMember)
    const clearDraftMember = useDraftStore(state => state.clearMember)
    const currentMember = useAuthStore(state => state.member)
    const roles = ["admin", "member", "guest"]


    const handleSubmit = async (e) => {
        e.preventDefault()

        let emailsString
        try {
            emailsString = draftMembers?.emails?.split(",")
        } catch (e) {
            console.log("E: ", e)
            toast.error(String(e) || "Invalid email/separation format")
        }
        const emails = emailsString?.filter?.(e => e?.trim() !== "")

        try {
            const res = await addMember({"role": draftMembers?.role, "emails": emails})
            // clearDraftMember()
            if (res?.data?.errors?.length > 0) {
                res?.data?.errors?.map(e => (
                    toast.error(e)
                ))
            }
            if (res?.data?.success) {
                toast.success(res?.data?.success)
            }
        } catch (e) {
            console.log("E: ", e)
            toast.error(e?.response?.data?.detail || "Failed to send invitation member")
        }
    }


    return (
        <SheetContent>
            <SheetHeader className="border-b">
                <SheetTitle>Member</SheetTitle>
                <SheetDescription className="hidden"></SheetDescription>
            </SheetHeader>
            <div className="w-full px-4">
                <form onSubmit={(e) => handleSubmit(e)}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="member-7j9-email-43j">
                                        Email
                                    </FieldLabel>
                                    <Textarea
                                        id="member-7j9-email-43j"
                                        className="resize-none"
                                        placeholder="user1@example.com, user2@example.com"
                                        value={draftMembers?.emails}
                                        onChange={(e) => setDraftMember("emails", e?.target?.value)}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel
                                        htmlFor="member-role-ts6"
                                        disabled={currentMember?.role !== "admin"}
                                    >
                                        Role
                                    </FieldLabel>
                                    <Select
                                        value={draftMembers?.role}
                                        onValueChange={(value) => setDraftMember("role", value)}
                                    >
                                        <SelectTrigger
                                            id="member-role-ts6"
                                            className="capitalize"
                                            // disabled={currentMember?.role !== "admin"}
                                        >
                                            <SelectValue placeholder="--"/>
                                        </SelectTrigger>
                                        {roles && <SelectContent>
                                            {roles?.map((r) => (<SelectItem
                                                key={r}
                                                value={r}
                                                className="capitalize"
                                            >{r}</SelectItem>))}
                                        </SelectContent>}
                                    </Select>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSeparator/>
                        <Field orientation="horizontal">
                            <Button type="submit">Confirm</Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => clearDraftMember()}
                            >
                                Cancel
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </SheetContent>
    );
};

export default NewMember;