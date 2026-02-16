"use client"

import { InfiniteScroll } from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface Props {
    playlistId: string;
}

export const VideoSection = ({ playlistId }: Props) => {
    return (
        <Suspense fallback={<VideoSectionSkeleton/>}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <VideoSectionSuspense playlistId={playlistId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const VideoSectionSkeleton = () => {
    return (
        <div>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {Array.from({ length: 18 }).map((_,index) => (
                    <VideoGridCardSkeleton key={index} />
                ))}
            </div>
            <div className="hidden flex-col gap-4 md:flex">
                {Array.from({ length: 18 }).map((_,index) => (
                    <VideoRowCardSkeleton key={index} size={"compact"} />
                ))}
            </div>
        </div>
    )
}

const VideoSectionSuspense = ({ playlistId }: Props) => {

    const utils = trpc.useUtils();

    const [videos,query] = trpc.playlist.getVideos.useSuspenseInfiniteQuery(
        { playlistId ,limit: DEFAULT_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )

    const deleteVideo = trpc.playlist.removeVideo.useMutation({
        onSuccess: (data) => {
            toast.success("Video Removed from Playlist");
            utils.playlist.getMany.invalidate();
            utils.playlist.getManyForVideo.invalidate({ videoId: data.videoId })
            utils.playlist.getOne.invalidate({ id: data.playlistId })
            utils.playlist.getVideos.invalidate({ playlistId: data.playlistId })
        },
        onError: () => {
            toast.error("Something Went Wrong")
        }
    })

    return (
        <>
            <div className="flex flex-col gap-4 gap-y-10 md:hidden">
                {videos.pages.flatMap((page) => page.items).map((video) => (
                    <VideoGridCard 
                    key={video.id} 
                    data={video} 
                    onRemove={() => deleteVideo.mutate({ playlistId, videoId: video.id })}
                    />
                ))}
            </div>
            <div className="hidden flex-col gap-4 md:flex">
                {videos.pages.flatMap((page) => page.items).map((video) => (
                    <VideoRowCard 
                    key={video.id} 
                    data={video} 
                    size={"compact"}
                    onRemove={() => deleteVideo.mutate({ playlistId, videoId: video.id })}
                    />
                ))}
            </div>
            <InfiniteScroll
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
            />
        </>
    )
}