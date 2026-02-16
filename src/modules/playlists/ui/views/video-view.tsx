import { PlaylistHeaderSection } from "../sections/playlist-header-section"
import { VideoSection } from "../sections/video-section"

export const VideoView = ({ playlistId }: { playlistId: string }) => {
    return (
        <div className="max-w-3xl mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
            <PlaylistHeaderSection playlistId={playlistId} />
            <VideoSection playlistId={playlistId} />
        </div>
    )
}