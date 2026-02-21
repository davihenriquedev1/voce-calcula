import { LoadingBounce } from "@/components/partials/Loading";

export default function Loading() {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <LoadingBounce />
        </div>
    )
}