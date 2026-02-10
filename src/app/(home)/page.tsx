export const dynamic = "force-dynamic"

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

    return (
        <HydrateClient>
            <HomeView categoryId={categoryId} />
        </HydrateClient>
    )
}

export default Home