import { execSync } from "child_process";

const INSTA_AI_FOLDER_ID = "1eWWGLmsT2V5D5BLVbzQ_-Au-FXa-Fyz_";
const PUBLISHED_FOLDER_NAME = "Published";

/**
 * Fetch photos from the InstaAI Google Drive folder using gws CLI
 * Returns array of photo file IDs and metadata
 */
export async function fetchPhotosFromDrive() {
  try {
    // Use gws CLI with proper escaping
    const command = `gws drive files list --params '{"q":"'${INSTA_AI_FOLDER_ID}' in parents and trashed=false and mimeType contains image","pageSize":50,"fields":"files(id,name,mimeType,webViewLink,thumbnailLink,createdTime)"}' 2>/dev/null`;
    
    const output = execSync(command, { 
      encoding: "utf-8",
      shell: "/bin/bash"
    });
    
    const data = JSON.parse(output) as { files?: Array<{
      id: string;
      name: string;
      mimeType: string;
      webViewLink: string;
      thumbnailLink?: string;
      createdTime: string;
    }> };

    return data.files || [];
  } catch (error) {
    console.error("Error fetching photos from Google Drive:", error);
    // Throw error so caller can use mock data fallback
    throw error;
  }
}

/**
 * Get or create the Published subfolder in InstaAI
 */
export async function getOrCreatePublishedFolder(): Promise<string> {
  try {
    // Check if Published folder exists
    const listCommand = `gws drive files list --params '{"q":"'${INSTA_AI_FOLDER_ID}' in parents and name='${PUBLISHED_FOLDER_NAME}' and mimeType=application/vnd.google-apps.folder and trashed=false","pageSize":1,"fields":"files(id)"}' 2>/dev/null`;
    
    const listOutput = execSync(listCommand, { 
      encoding: "utf-8",
      shell: "/bin/bash"
    });
    
    const listData = JSON.parse(listOutput) as { files?: Array<{ id: string }> };

    if (listData.files && listData.files.length > 0) {
      return listData.files[0].id;
    }

    // Create Published folder if it doesn't exist
    const createCommand = `gws drive files create --params '{"name":"${PUBLISHED_FOLDER_NAME}","mimeType":"application/vnd.google-apps.folder","parents":["${INSTA_AI_FOLDER_ID}"]}' 2>/dev/null`;
    
    const createOutput = execSync(createCommand, { 
      encoding: "utf-8",
      shell: "/bin/bash"
    });
    
    const createData = JSON.parse(createOutput) as { id: string };
    
    return createData.id;
  } catch (error) {
    console.error("Error managing Published folder:", error);
    throw new Error("Failed to manage Published folder in Google Drive");
  }
}

/**
 * Move a photo to the Published subfolder
 */
export async function movePhotoToPublished(fileId: string): Promise<boolean> {
  try {
    const publishedFolderId = await getOrCreatePublishedFolder();

    // Use gws to update the file's parents
    const command = `gws drive files update --params '{"fileId":"${fileId}","addParents":"${publishedFolderId}","removeParents":"${INSTA_AI_FOLDER_ID}"}' 2>/dev/null`;
    
    execSync(command, { 
      encoding: "utf-8",
      shell: "/bin/bash"
    });
    
    return true;
  } catch (error) {
    console.error("Error moving photo to Published:", error);
    throw new Error("Failed to move photo to Published folder");
  }
}

/**
 * Get download URL for a photo (requires authorization header)
 */
export function getPhotoDownloadUrl(fileId: string): string {
  // Return a URL that can be used with proper authorization
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}

/**
 * Get thumbnail URL for a photo
 */
export function getPhotoThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
}
