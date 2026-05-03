import { SignupForm } from "@/components/forms/signup-form.jsx";
import BackHome from "@/components/custom/auth/back-home.jsx";
import { useFormStore } from "@/stores/form-store.js";
import { validateSignupForm } from "@/lib/form-validation.js";
import { toast } from "sonner";
import { signup } from "@/api/auth-api.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SignupPage = () => {
    const signForm = useFormStore((state) => state.signupForm);
    const clearFormStore = useFormStore((state) => state.clearStore);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            validateSignupForm(signForm);
        } catch (e) {
            setIsLoading(false);
            toast.error(e.message);
            return;
        }

        try {
            await signup(signForm);
            navigate("../login");
            toast.success(
                "Account created successfully, Now please log in with the credentials",
            );
            clearFormStore();
        } catch (e) {
            toast?.error(e?.response?.data?.detail || "Failed to signup");
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <BackHome />
                <SignupForm
                    onSubmit={(e) => handleSubmit(e)}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default SignupPage;
