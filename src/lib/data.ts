
import 'server-only';
import { put, list, del, head } from '@vercel/blob';
import type { User, CalendarWindow } from './definitions';

// Import initial data from local JSON files
import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

const USERS_BLOB_NAME = 'users.json';
const WINDOWS_BLOB_NAME = 'windows.json';

// Helper function to read a file from Vercel Blob storage
async function readFileFromBlob<T>(fileName: string, initialData: T): Promise<T> {
  try {
    const headResult = await head(fileName).catch((error: any) => {
        // head throws a 404 error if blob is not found, which is expected.
        if (error.status === 404) {
            return null;
        }
        throw error; // Re-throw other errors.
    });

    if (!headResult) {
      console.log(`Blob '${fileName}' not found. Initializing with default data.`);
      await writeFileToBlob(fileName, initialData);
      return initialData;
    }
    
    // The downloadUrl is the correct way to get a URL for fetching the content
    const response = await fetch(headResult.downloadUrl);
    if (!response.ok) {
        throw new Error(`Failed to download file ${fileName}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data as T;

  } catch (error) {
    console.error(`Failed to read or initialize blob '${fileName}':`, error);
    // As a last resort, return the initial data if fetching fails.
    // This could happen on Vercel during build if env vars are not yet available.
    return initialData;
  }
}

// Helper function to write a file to Vercel Blob storage
async function writeFileToBlob<T>(fileName: string, data: T): Promise<void> {
  try {
    await put(fileName, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      // The Vercel Blob storage is already connected, no need for a token here.
      // The environment variable BLOB_READ_WRITE_TOKEN is used automatically by the `put` function.
    });
  } catch (error) {
    console.error(`Failed to write data to blob '${fileName}':`, error);
    throw new Error(`Nepodařilo se zapsat data do úložiště pro ${fileName}.`);
  }
}

export async function getUsers(): Promise<User[]> {
  return readFileFromBlob<User[]>(USERS_BLOB_NAME, initialUsers as User[]);
}

export async function setUsers(users: User[]): Promise<void> {
  return writeFileToBlob(USERS_BLOB_NAME, users);
}

export async function getWindows(): Promise<CalendarWindow[]> {
  const windows = await readFileFromBlob<CalendarWindow[]>(WINDOWS_BLOB_NAME, initialWindows as CalendarWindow[]);
  return windows.sort((a, b) => a.day - b.day);
}

export async function setWindows(windows: CalendarWindow[]): Promise<void> {
  return writeFileToBlob(WINDOWS_BLOB_NAME, windows);
}
