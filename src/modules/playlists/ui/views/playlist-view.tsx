"use client";

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { PlaylistCreateModal } from "../components/playlist-create-modal";
import { PlaylistSection } from "../sections/playlist-section";

export const PlaylistView = () => {

    const [createModalOpen,setCreateModalOpen] = useState(false);

    return (
        <div className="max-w-600 mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
            <PlaylistCreateModal
            open={createModalOpen}
            onOpenChange={setCreateModalOpen}
            />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">My Playlists</h1>
                    <p className="text-xs text-muted-foreground">
                        Collections You Have Created
                    </p>
                </div>
                <Button
                variant={"outline"}
                size={"icon"}
                className="rounded-full"
                onClick={() => setCreateModalOpen(true)}
                >
                    <PlusIcon />
                </Button>
            </div>
            <PlaylistSection/>
        </div>
    )
}