import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {

    console.log("Webhook endpoint called");

    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

    if(!SIGNING_SECRET) {
        throw new Error(`Error: Please Add SIGNING_SECRET From Clerk Dashboard to .env or .env.local`);
    }

    const wh = new Webhook(SIGNING_SECRET);

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if(!svix_id || !svix_timestamp || !svix_signature) {
        return new Response(`Error: Missing Svix Headers`, {
            status: 400
        })
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature
        }) as WebhookEvent
    } catch (error) {
        console.error(`Error: Could Not Verify Webhook: `, error);
        return new Response('Error: Verification Error', {
            status: 400
        })
    }

    const { id } = evt.data 
    const eventType = evt.type;
    console.log(`Recieved Webhook With Id ${id} and Event Type of ${eventType}`);
    console.log("Webhook Payload: ", body);
    
    if(eventType === "user.created") {
        const { data } = evt;
        await db.insert(users).values({
            clerkId: data.id,
            name: `${data.first_name} ${data.last_name}`,
            imageUrl: data.image_url
        })
    }

    if(eventType === "user.deleted") {
        const { data } = evt;
        if(!data.id) {
            return new Response("Missing User Id", { status: 400 })
        }
        await db.delete(users).where(eq(users.clerkId, data.id))
    }

    if(eventType === "user.updated") {
        const { data } = evt;
        await db.update(users).set({
            name: `${data.first_name} ${data.last_name}`,
            imageUrl: data.image_url
        }).where(eq(users.clerkId, data.id))
    }

    return new Response('Webhook Recieved', { status: 200 });
}
