import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputTypeProps {
    userId: string;
    videoId: string;
    prompt: string;
}

type GeminiImageResponse = {
    candidates: {
        content: {
            parts: {
                inlineData?: {
                    mimeType: string;
                    data: string;
                };
            }[];
        };
    }[];
};

const utapi = new UTApi();

export const { POST } = serve(async (context) => {

    const input = context.requestPayload as InputTypeProps;
    const { videoId, userId, prompt: userPrompt } = input;

    if (!userPrompt) throw new Error("PROMPT_REQUIRED");

    // STEP 1 → fetch video
    const video = await context.run("get-video", async () => {
        const [existingVideo] = await db
            .select()
            .from(videos)
            .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

        if (!existingVideo) throw new Error("Not Found");
        return existingVideo;
    });

    const finalPrompt = `
        Create a professional YouTube thumbnail.

        Style:
        - bold
        - high contrast
        - expressive emotion
        - large readable text

        Video Title:
        ${video.title}

        User request:
        ${userPrompt}

        Return only the image.
    `;

    // STEP 2 → call Gemini
    // STEP 2 → call Gemini DIRECTLY (not through context.call)
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: finalPrompt }],
                    },
                ],
                generationConfig: {
                    responseModalities: ["IMAGE"],
                    imageConfig: {
                        aspectRatio: "16:9",
                    },
                },
            }),
        }
    );

    const body = await response.json();

    const inline = body.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!inline?.data) throw new Error("IMAGE_GENERATION_FAILED");

    // STEP 3 → convert base64 to file
    const buffer = Buffer.from(inline.data, "base64");

    const file = new File([buffer], `${video.id}-thumbnail.png`, {
        type: inline.mimeType || "image/png",
    });

    await context.run("cleanup-thumbnail", async () => {
        if(video.thumbnailKey) {
            await utapi.deleteFiles(video.thumbnailKey);
            await db
            .update(videos)
            .set({ thumbnailKey: null, thumbnailUrl: null })
            .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
        }
    })

    // STEP 4 → upload to UploadThing
    const upload = await context.run("upload-thumbnail", async () => {
        const res = await utapi.uploadFiles([file]);
        return res[0]?.data?.ufsUrl;
    });

    if (!upload) throw new Error("UPLOAD_FAILED");

    // STEP 5 → save URL
    await context.run("update-video", async () => {
        await db
        .update(videos)
        .set({ thumbnailUrl: upload })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    });

    return { success: true, thumbnailUrl: upload };
});