import { InfiniteScroll } from "@/components/InfiniteScroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PlaylistAddModal = ({ videoId, open, onOpenChange }: Props) => {

    const utils = trpc.useUtils();

    const { data: playlists, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = trpc.playlist.getManyForVideo.useInfiniteQuery({
        limit: DEFAULT_LIMIT,
        videoId
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open
    })

    const addVideo = trpc.playlist.addVideo.useMutation({
        onSuccess: () => {
            toast.success("Video Added to Playlist");
            utils.playlist.getMany.invalidate();
            utils.playlist.getManyForVideo.invalidate({ videoId })
        },
        onError: () => {
            toast.error("Something Went Wrong")
        }
    })

    const deleteVideo = trpc.playlist.removeVideo.useMutation({
        onSuccess: () => {
            toast.success("Video Removed from Playlist");
            utils.playlist.getMany.invalidate();
            utils.playlist.getManyForVideo.invalidate({ videoId })
        },
        onError: () => {
            toast.error("Something Went Wrong")
        }
    })

    return (
        <ResponsiveModal
        title="Add to Playlist"
        open={open}
        onOpenChange={onOpenChange}
        >
            <div className="flex flex-col gap-2">
                {isLoading && (
                    <div className="flex justify-center p-4">
                        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!isLoading && playlists?.pages.flatMap((page) => page.items).map((playlist) => (
                    <Button 
                    key={playlist.id}
                    variant={"ghost"}
                    className="w-full justify-start px-2 [&_svg]:size-5"
                    size={"lg"}
                    onClick={() => {
                        if(playlist.containsVideo) {
                            deleteVideo.mutate({ playlistId: playlist.id, videoId })
                        } else {
                            addVideo.mutate({ playlistId: playlist.id, videoId })
                        }
                    }}
                    disabled={addVideo.isPending || deleteVideo.isPending}
                    >
                        {playlist.containsVideo ? (
                            <SquareCheckIcon className="mr-2" />
                        ) : (
                            <SquareIcon className="mr-2" />
                        )}
                        {playlist.name}
                    </Button>
                ))}
                {!isLoading && (
                    <InfiniteScroll
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                    isManual
                    />
                )}
            </div>
        </ResponsiveModal>
    )
}