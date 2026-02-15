export const dynamic = "force-dynamic"

import { DEFAULT_LIMIT } from '@/constants';
import { SearchView } from '@/modules/search/ui/components/search-view';
import { HydrateClient, trpc } from '@/trpc/server';
import React from 'react'

interface Props {
    searchParams: Promise<{
        query: string | undefined;
        categoryId: string | undefined;
    }>
}

const SearchPage = async ({ searchParams }: Props) => {

    const { query, categoryId } = await searchParams;

    void trpc.categories.getMany.prefetch()
    void trpc.search.getMany.prefetchInfinite({
        query,
        categoryId,
        limit: DEFAULT_LIMIT
    })

    return (
        <HydrateClient>
            <SearchView query={query} categoryId={categoryId} />
        </HydrateClient>
    )
}

export default SearchPage