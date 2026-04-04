import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";
import {useSearchParams} from "react-router-dom";

const PaginationComp = ({data}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const skip = Number(searchParams.get("skip")) || 0;
    const limit = data?.limit || 10;
    const currentPage = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil((data?.total || 0) / limit);

    const updatePage = (pageNum) => {
        const newSkip = (pageNum - 1) * limit;
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("skip", String(newSkip));
            return newParams;
        });
    };

    const nextPage = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            updatePage(currentPage + 1);
        }
    };

    const prevPage = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            updatePage(currentPage - 1);
        }
    };

    return (
        <Pagination className="mt-12">
            <PaginationContent className="w-full justify-between">
                <PaginationItem>
                    <PaginationPrevious
                        onClick={prevPage}
                        className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} cursor-default`}
                    />
                </PaginationItem>

                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>

                <PaginationItem>
                    <PaginationNext
                        onClick={nextPage}
                        className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} cursor-default`}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationComp;
