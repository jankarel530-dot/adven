
import 'server-only';
import { createClient } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';

// These functions now read data from Vercel Edge Config using the connection string.
// The connection string must be stored in the `EDGE_CONFIG` environment variable.

function getClient() {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        throw new Error('@vercel/edge-config: No connection string provided. Please set the EDGE_CONFIG environment variable.');
    }
    return createClient(connectionString);
}


export async function getUsers(): Promise<User[]> {
    try {
        const client = getClient();
        const users = await client.get<User[]>('users');
        if (!users) {
            console.log("No users found in Edge Config, returning empty array.");
            return [];
        }
        return users;
    } catch (error) {
        console.error("Error fetching users from Edge Config:", error);
        throw error; // Re-throw the error to be handled by the caller
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
    } catch (error) {
        console.error("Error fetching windows from Edge Config:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
