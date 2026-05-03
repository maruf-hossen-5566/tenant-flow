import { LoginForm } from "@/components/forms/login-form.jsx";
import BackHome from "@/components/custom/auth/back-home.jsx";
import { useFormStore } from "@/stores/form-store.js";
import { validateLoginForm } from "@/lib/form-validation.js";
import { toast } from "sonner";
import { login } from "@/api/auth-api.js";
import { useAuthStore } from "@/stores/auth-store.js";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "@/stores/global-store.js";
import { useState } from "react";

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const loginForm = useFormStore((state) => state.loginForm);
    const clearFormStore = useFormStore((state) => state.clearStore);
    const setIsAuthenticated = useAuthStore(
        (state) => state.setIsAuthenticated,
    );
    const setUser = useAuthStore((state) => state.setUser);
    const setTokens = useAuthStore((state) => state.setTokens);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            validateLoginForm(loginForm);
        } catch (error) {
            toast.error(error.message);
            setIsLoading(false);
            return;
        }

        try {
            const res = await login(loginForm);
            setTokens(res?.data?.tokens);
            setIsAuthenticated(true);
            setUser(res?.data?.user);

            navigate("/workspaces");
            clearFormStore();
            toast.success("Login was successful");
        } catch (e) {
            toast?.error(e?.response?.data?.detail || "Failed to login");
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <BackHome />
                <LoginForm
                    onSubmit={(e) => handleSubmit(e)}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default LoginPage;
