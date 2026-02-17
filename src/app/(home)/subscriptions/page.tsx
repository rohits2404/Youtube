export const dynamic = "force-dynamic"

import { DEFAULT_LIMIT } from '@/constants'
import { SubscriptionView } from '@/modules/subscriptions/ui/views/subscription-view'
import { HydrateClient, trpc } from '@/trpc/server'
import React from 'react'

const SubscriptionPage = () => {

    void trpc.subscriptions.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT })

    return (
        <HydrateClient>
            <SubscriptionView />
        </HydrateClient>
    )
}

export default SubscriptionPage