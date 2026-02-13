import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

interface Props {
    compactViews: string;
    expandedViews: string;
    compactDate: string;
    expandedDate: string;
    description?: string | null;
}

export const VideoDescription = ({ compactViews, expandedViews, compactDate, expandedDate, description }: Props) => {

    const [isExpanded,setIsExpanded] = useState(false);

    return (
        <div
        onClick={() => setIsExpanded((current) => !current)}
        className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
        >
            <div className="flex gap-2 text-sm mb-2">
                <span className="font-medium">
                    {isExpanded ? expandedViews : compactViews} Views
                </span>
                <span className="font-medium">
                    {isExpanded ? expandedDate : compactDate}
                </span>
            </div>
            <div className="relative">
                <p className={cn("text-sm whitespace-pre-wrap", !isExpanded && "line-clamp-2")}>
                    {description || "This Video Do Not Have Any Description"}
                </p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium">
                    {isExpanded ? (
                        <>
                            Show Less <ChevronUpIcon className="size-4" />
                        </>
                    ) : (
                        <>
                            Show More <ChevronDownIcon className="size-4" />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}