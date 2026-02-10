"use client";

import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react"
import { toast } from "sonner";

export const StudioUploadModal = () => {

    const utils = trpc.useUtils();

    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            toast.success("Video Created");
            utils.studio.getMany.invalidate()
        },
        onError: () => {
            toast.error("Something Went Wrong, Video Cannot Be Created")
        }
    });

    return (
        <Button 
        variant={"secondary"} 
        onClick={() => create.mutate()}
        disabled={create.isPending}
        >
            {create.isPending ? <Loader2Icon className="animate-spin"/> : <PlusIcon />}
            Create
        </Button>
    )
}