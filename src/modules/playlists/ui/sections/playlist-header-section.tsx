"use client";

import { AppErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"
import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { toast } from "sonner"

export const PlaylistHeaderSection = ({ playlistId }: { playlistId: string }) => {
    return (
        <Suspense fallback={<PlaylistHeaderSectionSkeleton/>}>
            <AppErrorBoundary title="Error Loading Playlist" fullScreen>
                <PlaylistHeaderSectionSuspense playlistId={playlistId} />
            </AppErrorBoundary>
        </Suspense>
    )
}

const PlaylistHeaderSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    )
}

const PlaylistHeaderSectionSuspense = ({ playlistId }: { playlistId: string }) => {

    const [playlist] = trpc.playlist.getOne.useSuspenseQuery({ id: playlistId });

    const utils = trpc.useUtils();

    const router = useRouter();

    const remove = trpc.playlist.remove.useMutation({
        onSuccess: () => {
            toast.success("Playlist Removed");
            utils.playlist.getMany.invalidate();
            router.push("/playlists");
        },
        onError: () => {
            toast.error("Something Went Wrong")
        }
    })

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">{playlist.name}</h1>
                <p className="text-xs text-muted-foreground">
                    Videos From Playlist
                </p>
            </div>
            <Button 
            variant={"outline"} 
            size={"icon"} 
            className="rounded-full"
            onClick={() => remove.mutate({ id: playlistId })}
            disabled={remove.isPending}
            >
                <Trash2Icon />
            </Button>
        </div>
    )
}