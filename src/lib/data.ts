
import 'server-only';
import { get } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';

// These functions now read data from Vercel Edge Config.
// The data is stored as JSON strings under the keys 'users' and 'windows'.
// The `get` function automatically uses the `EDGE_CONFIG` environment variable.

export async function getUsers(): Promise<User[]> {
    try {
        const users = await get<User[]>('users');
        if (!users) {
            console.log("No users found in Edge Config, returning empty array.");
            return [];
        }
        return users;
    } catch (error) {
        // This error will fire if the connection string is missing.
        console.error("Error fetching users from Edge Config:", error);
        // Return empty array to prevent app from crashing if store is unlinked.
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
    } catch (error) {
        console.error("Error fetching windows from Edge Config:", error);
        return [];
    }
}
