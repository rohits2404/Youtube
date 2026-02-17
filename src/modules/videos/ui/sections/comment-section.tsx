"use client"

import { AppErrorBoundary } from "@/components/error-boundary"
import { InfiniteScroll } from "@/components/InfiniteScroll"
import { DEFAULT_LIMIT } from "@/constants"
import { CommentForm } from "@/modules/comments/ui/components/comment-form"
import { CommentItem } from "@/modules/comments/ui/components/comment-item"
import { trpc } from "@/trpc/client"
import { Loader2Icon } from "lucide-react"
import { Suspense } from "react"

export const CommentSection = ({ videoId }: { videoId: string }) => {
    return (
        <Suspense fallback={<CommentSectionSkeleton/>}>
            <AppErrorBoundary title="Error Loading Comments" fullScreen>
                <CommentSectionSuspense videoId={videoId} />
            </AppErrorBoundary>
        </Suspense>
    )
}

const CommentSectionSkeleton = () => {
    return (
        <div className="mt-6 flex justify-center items-center">
            <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
        </div>
    )
}

const CommentSectionSuspense = ({ videoId }: { videoId: string }) => {

    const [comments,query] = trpc.comments.getMany.useSuspenseInfiniteQuery({ videoId, limit: DEFAULT_LIMIT }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor
    })

    return (
        <div className="mt-6">
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">
                    {comments.pages[0].totalCount} Comments
                </h1>
                <CommentForm videoId={videoId} />
            </div>
            <div className="flex flex-col gap-4 mt-2">
                {comments.pages.flatMap((page) => page.items).map((comment) => (
                    <CommentItem
                    key={comment.id}
                    comment={comment}
                    />
                ))}
                <InfiniteScroll
                isManual
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
                />
            </div>
        </div>        
    )
}