export const dynamic = "force-dynamic"

import { DEFAULT_LIMIT } from "@/constants";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server"
import React from "react";

interface HomeProps {
    searchParams: Promise<{
        categoryId?: string;
    }>
}

const Home = async ({ searchParams }: HomeProps) => {

    const { categoryId } = await searchParams;

    void trpc.categories.getMany.prefetch();
    void trpc.videos.getMany.prefetchInfinite({ categoryId, limit: DEFAULT_LIMIT })

    return (
        <HydrateClient>
            <HomeView categoryId={categoryId} />
        </HydrateClient>
    )
}

export default Home