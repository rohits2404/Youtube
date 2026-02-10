import { eq } from "drizzle-orm"
import { VideoAssetCreatedWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetTrackReadyWebhookEvent } from "@mux/mux-node/resources/webhooks"
import { headers } from "next/headers"
import { mux } from "@/lib/mux"
import { db } from "@/db"
import { videos } from "@/db/schema"

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!

type WebhookEvent = 
    | VideoAssetCreatedWebhookEvent
    | VideoAssetErroredWebhookEvent
    | VideoAssetReadyWebhookEvent
    | VideoAssetTrackReadyWebhookEvent

export const POST = async (request: Request) => {
    if(!SIGNING_SECRET) {
        throw new Error("MUX_WEBHOOK_SECRET Is Not Set!")
    }
    const headersPayload = await headers();
    const muxSignature = headersPayload.get("mux-signature");
    if(!muxSignature) {
        return new Response("No Signature Found!", { status: 401 })
    }
    const payload = await request.json();
    const body = JSON.stringify(payload);
    mux.webhooks.verifySignature(body, { "mux-signature": muxSignature }, SIGNING_SECRET);
    switch (payload.type as WebhookEvent["type"]) {
        case "video.asset.created": {
            const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
            if(!data.upload_id) {
                return new Response("No Upload ID Found", { status: 400 })
            }
            await db.update(videos).set({
                muxAssetId: data.id,
                muxStatus: data.status
            }).where(eq(videos.muxUploadId, data.upload_id))
            break;
        }
    }
    return new Response("Webhook Recieved", { status: 200 });
}