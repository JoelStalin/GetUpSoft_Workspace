/**
 * WhatsApp Cloud API integration for sending photo proposals
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = "1049633724904893";
const RECIPIENT_PHONE = "18492600983"; // +18492600983 without +

/**
 * Send a photo proposal to WhatsApp with caption
 */
export async function sendPhotoProposalToWhatsApp(
  imageUrl: string,
  caption: string,
  accessToken: string
) {
  try {
    // Send image message
    const imageResponse = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: RECIPIENT_PHONE,
          type: "image",
          image: {
            link: imageUrl,
          },
        }),
      }
    );

    if (!imageResponse.ok) {
      throw new Error(`Failed to send image: ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.json() as { messages: Array<{ id: string }> };
    const imageMessageId = imageData.messages[0]?.id;

    // Send caption as text message
    const textResponse = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: RECIPIENT_PHONE,
          type: "text",
          text: {
            body: caption,
          },
        }),
      }
    );

    if (!textResponse.ok) {
      throw new Error(`Failed to send text: ${textResponse.statusText}`);
    }

    const textData = await textResponse.json() as { messages: Array<{ id: string }> };
    const textMessageId = textData.messages[0]?.id;

    return {
      imageMessageId,
      textMessageId,
      success: true,
    };
  } catch (error) {
    console.error("Error sending photo proposal to WhatsApp:", error);
    throw error;
  }
}

/**
 * Send multiple photo proposals to WhatsApp
 */
export async function sendPhotoProposalsToWhatsApp(
  photos: Array<{ imageUrl: string; caption: string }>,
  accessToken: string
) {
  const results = [];

  for (const photo of photos) {
    try {
      const result = await sendPhotoProposalToWhatsApp(
        photo.imageUrl,
        photo.caption,
        accessToken
      );
      results.push(result);
    } catch (error) {
      console.error(`Failed to send photo proposal: ${error}`);
      results.push({
        success: false,
        error: String(error),
      });
    }
  }

  return results;
}

/**
 * Send a simple text message to WhatsApp
 */
export async function sendTextMessageToWhatsApp(
  message: string,
  accessToken: string
) {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: RECIPIENT_PHONE,
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json() as { messages: Array<{ id: string }> };
    return {
      messageId: data.messages[0]?.id,
      success: true,
    };
  } catch (error) {
    console.error("Error sending text message to WhatsApp:", error);
    throw error;
  }
}
