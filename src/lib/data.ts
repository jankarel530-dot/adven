
import 'server-only';
import { get } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';

// These functions now read data from Vercel Edge Config using the connection string.
// The connection string must be stored in the `EDGE_CONFIG` environment variable.

export async function getUsers(): Promise<User[]> {
    try {
        // The `get` function automatically uses the `EDGE_CONFIG` environment variable.
        const users = await get<User[]>('users');
        // If the store is new and 'users' key doesn't exist, it returns undefined.
        if (!users) {
            console.log("No users found in Edge Config, returning empty array.");
            return [];
        }
        return users;
    } catch (error) {
        // This error might fire if the connection string is missing or invalid.
        console.error("Error fetching users from Edge Config:", error);
        // Return empty array to prevent the app from crashing.
        return [];
    }
}

export async function getWindows(): Promise<CalendarWindow[]> {
    try {
        const windows = await get<CalendarWindow[]>('windows');
        if (!windows) {
            console.log("No windows found in Edge Config, returning empty array.");
            return [];
        }
        const sortedWindows = windows.sort((a, b) => a.day - b.day);
        return sortedWindows;
    } catch (error)
    {
        console.error("Error fetching windows from Edge Config:", error);
        return [];
    }
}
