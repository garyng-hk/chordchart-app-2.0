import type { DriveFile } from '../types';

interface SearchParams {
    songTitle: string;
    key: string;
    lyrics: string;
}

/**
 * Searches for files by sending a request to our own backend API endpoint.
 * The backend will then securely call the Google Drive API.
 */
export const searchFiles = async (
    { songTitle, key, lyrics }: SearchParams,
    updateLoadingMessage: (message: string) => void
): Promise<DriveFile[]> => {
    try {
        updateLoadingMessage('正在連接伺服器並搜尋...');

        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ songTitle, key, lyrics }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `伺服器錯誤: ${response.statusText}`);
        }

        const files = await response.json();
        return files;

    } catch (error) {
        console.error("Error calling backend search API:", error);
        if (error instanceof Error) {
            throw new Error(`搜尋樂譜時發生錯誤: ${error.message}`);
        }
        throw new Error("搜尋樂譜時發生未知錯誤。");
    } finally {
        updateLoadingMessage(''); // Reset message on completion
    }
};
