
import 'server-only';
import { createClient } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';

// These functions now read data from Vercel Edge Config using the connection string.
// The connection string must be stored in the `EDGE_CONFIG` environment variable.

function getClient() {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        // This will provide a clear error if the environment variable is missing.
        throw new Error('@vercel/edge-config: No connection string provided. Please set the EDGE_CONFIG environment variable.');
    }
    return createClient(connectionString);
}


export async function getUsers(): Promise<User[]> {
    try {
        const client = getClient();
        const users = await client.get<User[]>('users');
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
        const client = getClient();
        const windows = await client.get<CalendarWindow[]>('windows');
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
