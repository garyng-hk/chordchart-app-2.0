// This file should be placed in the `api` directory at the root of your project.
// e.g., /api/search.ts
// Vercel will automatically turn this into a serverless function accessible at `/api/search`.

import type { DriveFile } from '../types';

// IMPORTANT: These values are now on the server. The API key comes from environment variables.
const API_KEY = process.env.GOOGLE_API_KEY;
const FOLDER_ID = '10ZuF87OUmjYRJphLWbGcpIlEUyX1ryWt';
const API_URL = 'https://www.googleapis.com/drive/v3/files';

interface SearchParams {
    songTitle: string;
    key: string;
    lyrics: string;
}

const getAllSubfolderIds = async (rootFolderId: string, apiKey: string): Promise<string[]> => {
    const allFolderIds: string[] = [rootFolderId];
    let foldersToScan: string[] = [rootFolderId];
    
    while (foldersToScan.length > 0) {
        const currentFolderId = foldersToScan.shift()!;
        let pageToken: string | undefined = undefined;

        do {
            const query = `'${currentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
            const url = `${API_URL}?key=${apiKey}&q=${encodeURIComponent(query)}&fields=files(id),nextPageToken&pageSize=1000&pageToken=${pageToken || ''}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.error("Failed to fetch subfolders for folder ID:", currentFolderId, await response.text());
                    break;
                }
                
                const data = await response.json();
                const newFolderIds = data.files.map((folder: { id: string }) => folder.id);
                
                if (newFolderIds.length > 0) {
                    allFolderIds.push(...newFolderIds);
                    foldersToScan.push(...newFolderIds);
                }
                
                pageToken = data.nextPageToken;
            } catch (error) {
                console.error("Server-side error fetching subfolders:", error);
                throw error;
            }
        } while (pageToken);
    }
    
    return allFolderIds;
};

// This is the main serverless function handler.
export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
    }

    if (!API_KEY) {
        return new Response(JSON.stringify({ message: 'API key is not configured on the server.' }), { status: 500 });
    }

    try {
        const { songTitle, key, lyrics }: SearchParams = await request.json();

        // Step 1: Get all folder IDs recursively
        const allFolderIds = await getAllSubfolderIds(FOLDER_ID, API_KEY);
        if (allFolderIds.length === 0) {
            return new Response(JSON.stringify([]), { status: 200 });
        }

        // Step 2: Construct the query and search for files
        const parentsQuery = allFolderIds.map(id => `'${id}' in parents`).join(' or ');
        const queryParts: string[] = [
            `(${parentsQuery})`,
            '(mimeType = \'application/pdf\' or mimeType = \'application/vnd.google-apps.document\')',
            'trashed = false'
        ];

        if (songTitle) queryParts.push(`name contains '${songTitle.replace(/'/g, "\\'")}'`);
        if (key) queryParts.push(`name contains '${key.replace(/'/g, "\\'")}'`);
        if (lyrics) queryParts.push(`fullText contains '${lyrics.replace(/'/g, "\\'")}'`);

        const query = queryParts.join(' and ');
        const url = `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&orderBy=name&pageSize=1000`;

        const driveResponse = await fetch(url);
        if (!driveResponse.ok) {
            const errorData = await driveResponse.json();
            console.error("Server-side Google Drive API Error:", errorData);
            return new Response(JSON.stringify({ message: `Google Drive API Error: ${errorData.error.message}` }), { status: 502 });
        }

        const data = await driveResponse.json();
        const files: DriveFile[] = data.files || [];

        return new Response(JSON.stringify(files), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Server-side search error:", error);
        return new Response(JSON.stringify({ message: 'An internal server error occurred.' }), { status: 500 });
    }
}
