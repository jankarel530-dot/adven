
import 'server-only';
import { put, head } from '@vercel/blob';
import type { User, CalendarWindow } from './definitions';

// Import initial data from local JSON files
import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

const USERS_BLOB_NAME = 'users.json';
const WINDOWS_BLOB_NAME = 'windows.json';

// Helper to get the base URL for the API
function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Fallback for local development or other environments
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
}

// Helper function to write data to Vercel Blob via our API route
async function setBlobData<T>(fileName: string, data: T): Promise<void> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/update-blob?filename=${fileName}`;
    
    if (!process.env.BLOB_API_TOKEN) {
        throw new Error("BLOB_API_TOKEN is not set.");
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'x-api-token': process.env.BLOB_API_TOKEN,
            },
            body: JSON.stringify(data, null, 2),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to set blob data for ${fileName}. Status: ${response.status}. Body: ${errorBody}`);
        }
    } catch (error) {
        console.error(`Error in setBlobData for ${fileName}:`, error);
        throw error;
    }
}


// Helper function to read a file from Vercel Blob storage
async function readFileFromBlob<T>(fileName: string, initialData: T): Promise<T> {
  try {
    const blobInfo = await head(fileName).catch((error: any) => {
        if (error.status === 404) {
            return null;
        }
        throw error;
    });

    if (!blobInfo) {
      console.log(`Blob '${fileName}' not found. Initializing with default data.`);
      await setBlobData(fileName, initialData);
      return initialData;
    }
    
    const response = await fetch(blobInfo.url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to download file ${fileName}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data as T;

  } catch (error) {
    console.error(`Failed to read or initialize blob '${fileName}':`, error);
    throw new Error(`Nepodařilo se načíst data pro ${fileName}. Původní chyba: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
  }
}


export async function getUsers(): Promise<User[]> {
  return readFileFromBlob<User[]>(USERS_BLOB_NAME, initialUsers as User[]);
}

export async function setUsers(users: User[]): Promise<void> {
  return setBlobData(USERS_BLOB_NAME, users);
}

export async function getWindows(): Promise<CalendarWindow[]> {
  const windows = await readFileFromBlob<CalendarWindow[]>(WINDOWS_BLOB_NAME, initialWindows as CalendarWindow[]);
  return windows.sort((a, b) => a.day - b.day);
}

export async function setWindows(windows: CalendarWindow[]): Promise<void> {
  return setBlobData(WINDOWS_BLOB_NAME, windows);
}
