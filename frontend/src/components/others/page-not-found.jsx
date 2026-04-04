import {Button} from "@/components/ui/button.jsx";
import {Link} from "react-router-dom";

const PageNotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h2 className="text-3xl font-semibold">404 Error</h2>
            <p className="mb-4 text-muted-foreground">Oops! The page you're looking for does not exist.</p>
            <Button
                variant="outline"
                asChild
            >
                <Link to={"/"}>
                    Back to Home
                </Link>
            </Button>
        </div>
    );
};

export default PageNotFound;
