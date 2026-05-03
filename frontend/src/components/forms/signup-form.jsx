import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button.jsx";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Link } from "react-router-dom";
import { useFormStore } from "@/stores/form-store.js";

export function SignupForm({ className, ...props }) {
    const signForm = useFormStore((state) => state.signupForm);
    const changeSignForm = useFormStore((state) => state.changeSignupForm);

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Fill in the form below to create your account
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        autoFocus
                        required
                        value={signForm.name || ""}
                        onChange={(e) => changeSignForm("name", e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={signForm.email || ""}
                        onChange={(e) =>
                            changeSignForm("email", e.target.value)
                        }
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={signForm.password || ""}
                        onChange={(e) =>
                            changeSignForm("password", e.target.value)
                        }
                    />
                    <FieldDescription className="text-xs">
                        Must be at least 8 characters long.
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="confirm-password">
                        Confirm Password
                    </FieldLabel>
                    <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={signForm.confPassword || ""}
                        onChange={(e) =>
                            changeSignForm("confPassword", e.target.value)
                        }
                    />
                </Field>
                <Field>
                    <Button
                        type="submit"
                        disabled={props.isLoading}
                        className="disabled:opacity-50"
                    >
                        Create Account
                    </Button>
                </Field>
                <FieldSeparator>Or</FieldSeparator>
                <Field>
                    <FieldDescription className="px-6 text-center">
                        Already have an account? <Link to="/login">Log in</Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}
