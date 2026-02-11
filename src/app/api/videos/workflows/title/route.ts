import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputTypeProps {
  userId: string;
  videoId: string;
}

type GeminiResponse = {
    candidates: {
        content: {
            parts: { text: string }[];
        };
    }[];
};

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;

export const { POST } = serve(async (context) => {
    const input = context.requestPayload as InputTypeProps;
    const { videoId, userId } = input;

    // STEP 1 → fetch video
    const video = await context.run("get-video", async () => {
        const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

        if (!existingVideo) throw new Error("Not Found");
        return existingVideo;
    });

    // STEP 2 → prepare transcript (limit size = cheaper & faster)
    const transcript = await context.run("get-transcript", async () => {
        const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
        const response = await fetch(trackUrl);
        const text = response.text();
        if(!text) {
            throw new Error("BAD_REQUEST")
        }
        return text;
    })

    const prompt = `
    ${TITLE_SYSTEM_PROMPT}

    Transcript:
    ${transcript}
    `;

    // STEP 3 → call Gemini
    const { body } = await context.call<GeminiResponse>("generate-title", {
        method: "POST",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent`,
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });

    // STEP 4 → extract safely
    const title = body.candidates?.[0]?.content?.parts?.[0]?.text ?.replace(/\n/g, "") ?.trim() || video.title || "Untitled";

    // STEP 5 → save
    await context.run("update-video", async () => {
        await db
        .update(videos)
        .set({ title })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    });

    return { success: true, title };
});