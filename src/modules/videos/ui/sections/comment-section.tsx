"use client"

import { CommentForm } from "@/modules/comments/ui/components/comment-form"
import { CommentItem } from "@/modules/comments/ui/components/comment-item"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

export const CommentSection = ({ videoId }: { videoId: string }) => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <CommentSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const CommentSectionSuspense = ({ videoId }: { videoId: string }) => {

    const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId })

    return (
        <div className="mt-6">
            <div className="flex flex-col gap-6">
                <h1 className="">0 Comments</h1>
                <CommentForm videoId={videoId} />
            </div>
            <div className="flex flex-col gap-4 mt-2">
                {comments.map((comment) => (
                    <CommentItem
                    key={comment.id}
                    comment={comment}
                    />
                ))}
            </div>
        </div>        
    )
}