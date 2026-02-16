export const dynamic = "force-dynamic";

import { DEFAULT_LIMIT } from '@/constants';
import { VideoView } from '@/modules/playlists/ui/views/video-view';
import { HydrateClient, trpc } from '@/trpc/server';
import React from 'react'

interface Props {
    params: Promise<{
        playlistId: string
    }>
}

const IndividualPlaylist = async ({ params }: Props) => {

    const { playlistId } = await params;

    void trpc.playlist.getOne.prefetch({ id: playlistId })
    void trpc.playlist.getVideos.prefetchInfinite({ playlistId, limit: DEFAULT_LIMIT })

    return (
        <HydrateClient>
            <VideoView playlistId={playlistId} />
        </HydrateClient>
    )
}

export default IndividualPlaylist