import { invokeLLM } from "../_core/llm";

/**
 * Analyze a photo using vision AI and generate a Spanish Instagram caption
 */
export async function generateInstagramCaption(imageUrl: string, fileName: string) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert Instagram content strategist specializing in creating engaging Spanish captions for photos. 
Your captions must:
- Be written entirely in Spanish
- Be engaging, authentic, and optimized for Instagram's algorithm
- Include 5-8 relevant hashtags
- Be between 100-200 characters (excluding hashtags)
- Include a call-to-action when appropriate
- Match the mood and aesthetic of the photo
- Use emojis sparingly but effectively`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this photo and generate an Instagram caption in Spanish. The photo filename is: ${fileName}. Return response as JSON with caption, hashtags array, and analysis.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "instagram_caption",
          strict: true,
          schema: {
            type: "object",
            properties: {
              caption: {
                type: "string",
                description: "Instagram caption in Spanish",
              },
              hashtags: {
                type: "array",
                items: { type: "string" },
                description: "Array of hashtags",
              },
              analysis: {
                type: "string",
                description: "Brief analysis of photo content",
              },
            },
            required: ["caption", "hashtags", "analysis"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    const parsed = JSON.parse(content) as {
      caption: string;
      hashtags: string[];
      analysis: string;
    };

    return {
      caption: parsed.caption,
      hashtags: parsed.hashtags,
      analysis: parsed.analysis,
    };
  } catch (error) {
    console.error("Error generating Instagram caption:", error);
    throw error;
  }
}

/**
 * Generate captions for multiple photos
 */
export async function generateCaptionsForPhotos(
  photos: Array<{ fileId: string; fileName: string; downloadUrl: string }>
) {
  const results: Array<{
    fileId: string;
    caption: string;
    hashtags: string[];
    analysis: string;
    error?: boolean;
  }> = [];

  for (const photo of photos) {
    try {
      const captionData = await generateInstagramCaption(photo.downloadUrl, photo.fileName);
      results.push({
        fileId: photo.fileId,
        ...captionData,
      });
    } catch (error) {
      console.error(`Failed to generate caption for ${photo.fileName}:`, error);
      results.push({
        fileId: photo.fileId,
        caption: "No caption generated",
        hashtags: [],
        analysis: "Error during analysis",
        error: true,
      });
    }
  }

  return results;
}
