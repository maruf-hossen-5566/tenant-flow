import Logo from "@/components/custom/header/logo.jsx";
import AuthButtons from "@/components/custom/header/auth-buttons.jsx";

const Header = () => {
    return (
        <div className="sticky top-0 z-50 bg-background border-b">
            <div className="max-w-5xl mx-auto px-6 w-full h-16 flex items-center justify-between gap-4">
                <Logo/>

                <AuthButtons/>
            </div>
        </div>
    );
};

export default Header;