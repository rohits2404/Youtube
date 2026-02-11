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

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

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

    // STEP 2 → fetch transcript
    const transcript = await context.run("get-transcript", async () => {
        const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;

        const response = await fetch(trackUrl);
        const text = response.text();

        if (!text) throw new Error("BAD_REQUEST");

        return text;
    });

    const safeTranscript = transcript.slice(0, 15000);

    const prompt = `
        ${DESCRIPTION_SYSTEM_PROMPT}

        Transcript:
        ${safeTranscript}
    `;

    // STEP 3 → call Gemini
    const { body } = await context.call<GeminiResponse>("generate-description", {
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
    const description =
        body.candidates?.[0]?.content?.parts?.[0]?.text
            ?.replace(/\n/g, " ")
            ?.trim() || video.description || "";

    // STEP 5 → save
    await context.run("update-video", async () => {
        await db
        .update(videos)
        .set({ description })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    });

    return { success: true, description };
});