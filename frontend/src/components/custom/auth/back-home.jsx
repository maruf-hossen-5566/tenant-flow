import {Button} from "@/components/ui/button.jsx";
import {Link} from "react-router-dom";
import {ChevronLeft} from "lucide-react";

const BackHome = () => {
    return (
        <Button
            variant="outline"
            className="fixed top-8 left-8 md:left-16"
            asChild
        >
            <Link
                to="/"
                className="flex items-center gap-1"
            >
                <ChevronLeft/>
                Home
            </Link>
        </Button>
    );
};

export default BackHome;