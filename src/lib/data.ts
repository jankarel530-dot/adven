
import 'server-only';
import { put, list, del } from '@vercel/blob';
import type { User, CalendarWindow } from './definitions';

// Import initial data from local JSON files
import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

const USERS_BLOB_NAME = 'users.json';
const WINDOWS_BLOB_NAME = 'windows.json';

// Helper function to read a file from Vercel Blob storage
async function readFileFromBlob<T>(fileName: string, initialData: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: fileName, limit: 1 });

    if (blobs.length === 0) {
      console.log(`Blob '${fileName}' not found. Initializing with default data.`);
      await writeFileToBlob(fileName, initialData);
      return initialData;
    }

    const blob = blobs[0];
    const response = await fetch(blob.url);
    if (!response.ok) {
        throw new Error(`Failed to fetch blob from ${blob.url}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Failed to read or initialize blob '${fileName}':`, error);
    // As a last resort, return the initial data if fetching fails,
    // though this state shouldn't normally be reached.
    return initialData;
  }
}

// Helper function to write a file to Vercel Blob storage
async function writeFileToBlob<T>(fileName: string, data: T): Promise<void> {
  try {
    await put(fileName, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });
  } catch (error) {
    console.error(`Failed to write data to blob '${fileName}':`, error);
    throw new Error(`Nepodařilo se zapsat data do úložiště pro ${fileName}.`);
  }
}

export async function getUsers(): Promise<User[]> {
  return readFileFromBlob<User[]>(USERS_BLOB_NAME, initialUsers);
}

export async function setUsers(users: User[]): Promise<void> {
  return writeFileToBlob(USERS_BLOB_NAME, users);
}

export async function getWindows(): Promise<CalendarWindow[]> {
  const windows = await readFileFromBlob<CalendarWindow[]>(WINDOWS_BLOB_NAME, initialWindows);
  return windows.sort((a, b) => a.day - b.day);
}

export async function setWindows(windows: CalendarWindow[]): Promise<void> {
  return writeFileToBlob(WINDOWS_BLOB_NAME, windows);
}
