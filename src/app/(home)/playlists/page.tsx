import { DEFAULT_LIMIT } from '@/constants'
import { PlaylistView } from '@/modules/playlists/ui/views/playlist-view'
import { HydrateClient, trpc } from '@/trpc/server'
import React from 'react'

const PlaylistPage = async () => {

    void trpc.playlist.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT })

    return (
        <HydrateClient>
            <PlaylistView />
        </HydrateClient>
    )
}

export default PlaylistPage