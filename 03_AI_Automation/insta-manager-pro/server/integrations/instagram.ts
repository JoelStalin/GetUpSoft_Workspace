/**
 * Instagram API integration for publishing photos
 */

const INSTAGRAM_GRAPH_API_URL = "https://graph.instagram.com/v18.0";
const INSTAGRAM_ACCOUNT_ID = "93_stalin"; // The Instagram handle

/**
 * Upload a photo to Instagram and get the media ID
 */
export async function uploadPhotoToInstagram(
  imageUrl: string,
  caption: string,
  accessToken: string
) {
  try {
    // First, create a media object
    const mediaResponse = await fetch(
      `${INSTAGRAM_GRAPH_API_URL}/${INSTAGRAM_ACCOUNT_ID}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
        }),
      }
    );

    if (!mediaResponse.ok) {
      throw new Error(`Failed to create media: ${mediaResponse.statusText}`);
    }

    const mediaData = await mediaResponse.json() as { id: string };
    const mediaId = mediaData.id;

    // Then, publish the media
    const publishResponse = await fetch(
      `${INSTAGRAM_GRAPH_API_URL}/${INSTAGRAM_ACCOUNT_ID}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          creation_id: mediaId,
        }),
      }
    );

    if (!publishResponse.ok) {
      throw new Error(`Failed to publish media: ${publishResponse.statusText}`);
    }

    const publishData = await publishResponse.json() as { id: string };
    return {
      instagramPostId: publishData.id,
      mediaId: mediaId,
    };
  } catch (error) {
    console.error("Error uploading photo to Instagram:", error);
    throw error;
  }
}

/**
 * Get engagement metrics for a published post
 */
export async function getPostMetrics(postId: string, accessToken: string) {
  try {
    const response = await fetch(
      `${INSTAGRAM_GRAPH_API_URL}/${postId}?fields=like_count,comments_count,shares_count`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    const data = await response.json() as {
      like_count?: number;
      comments_count?: number;
      shares_count?: number;
    };

    return {
      likes: data.like_count || 0,
      comments: data.comments_count || 0,
      shares: data.shares_count || 0,
    };
  } catch (error) {
    console.error("Error fetching post metrics:", error);
    throw error;
  }
}

/**
 * Publish multiple photos to Instagram
 */
export async function publishPhotosToInstagram(
  photos: Array<{ imageUrl: string; caption: string }>,
  accessToken: string
) {
  const results = [];

  for (const photo of photos) {
    try {
      const result = await uploadPhotoToInstagram(
        photo.imageUrl,
        photo.caption,
        accessToken
      );
      results.push({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(`Failed to publish photo: ${error}`);
      results.push({
        success: false,
        error: String(error),
      });
    }
  }

  return results;
}
