"use client"

import { InfiniteScroll } from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { toast } from "sonner";
import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item";
import { AppErrorBoundary } from "@/components/error-boundary";

export const SubscriptionsVideosSection = () => {
    return (
        <Suspense fallback={<SubscriptionsVideosSectionSkeleton/>}>
            <AppErrorBoundary title="Error Loading Subscription Videos" fullScreen>
                <SubscriptionsVideosSectionSuspense />
            </AppErrorBoundary>
        </Suspense>
    )
}

const SubscriptionsVideosSectionSkeleton = () => {
    return (
        <div>
            <div className="flex flex-col gap-4">
                {Array.from({ length: 8 }).map((_,index) => (
                    <SubscriptionItemSkeleton key={index} />
                ))}
            </div>
        </div>
    )
}

const SubscriptionsVideosSectionSuspense = () => {

    const utils = trpc.useUtils();

    const [subscriptions,query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
        { limit: DEFAULT_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )

    const unSubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: (data) => {
            toast.success("Unsubscribed")
            utils.subscriptions.getMany.invalidate();
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({ id: data.creatorId });
        },
        onError: () => {
            toast.error("Something Went Wrong");
        }
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                {subscriptions.pages.flatMap((page) => page.items).map((subscription) => (
                    <Link prefetch
                    href={`/users/${subscription.user.id}`} 
                    key={subscription.creatorId}
                    >
                        <SubscriptionItem
                        name={subscription.user.name}
                        imageUrl={subscription.user.imageUrl}
                        subscriberCount={subscription.user.subscriberCount}
                        onUnsubscribe={() => { unSubscribe.mutate({ userId: subscription.creatorId })}}
                        disabled={unSubscribe.isPending}
                        />
                    </Link>
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