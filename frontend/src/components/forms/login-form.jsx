import {cn} from "@/lib/utils.js"
import {Button} from "@/components/ui/button.jsx"
import {
    Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator,
} from "@/components/ui/field.jsx"
import {Input} from "@/components/ui/input.jsx"
import {Link} from "react-router-dom";
import {useFormStore} from "@/stores/form-store.js";
import {useGlobalStore} from "@/stores/global-store.js";

export function LoginForm({className, ...props}) {
    const loginForm = useFormStore(state => state.loginForm)
    const changeLoginForm = useFormStore(state => state.changeLoginForm)
    const isLoading = useGlobalStore(state => state.isLoading)

    return (<form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Login to your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your email below to login to your account
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoFocus
                        required
                        value={loginForm.username || ""}
                        onChange={(e) => changeLoginForm("username", e.target.value)}
                    />
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={loginForm.password || ""}
                        onChange={(e) => changeLoginForm("password", e.target.value)}
                    />
                </Field>
                <Field>
                    <Button type="submit" disabled={isLoading}>Login</Button>
                </Field>
                <FieldSeparator>Or</FieldSeparator>
                <Field>
                    <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/signup"
                            className="underline underline-offset-4"
                        >
                            Sign up
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>);
}
