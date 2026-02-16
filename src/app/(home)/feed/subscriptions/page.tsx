export const dynamic = "force-dynamic";

import { DEFAULT_LIMIT } from '@/constants';
import { SubscriptionView } from '@/modules/home/ui/views/subscription-view';
import { HydrateClient, trpc } from '@/trpc/server';
import React from 'react'

const SubscriptionPage = async () => {

    void trpc.videos.getManySubscribed.prefetchInfinite({ limit: DEFAULT_LIMIT })

    return (
        <HydrateClient>
            <SubscriptionView />
        </HydrateClient>
    )
}

export default SubscriptionPage