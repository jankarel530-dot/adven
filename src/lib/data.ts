
import 'server-only';
import { get } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';

// These functions now read data from Vercel Edge Config.
// The data is stored as JSON strings under the keys 'users' and 'windows'.

export async function getUsers(): Promise<User[]> {
    try {
        const users = await get<User[]>('users');
        if (!users) {
            console.log("No users found in Edge Config, returning empty array.");
            return [];
        }
        return users;
    } catch (error) {
        console.error("Error fetching users from Edge Config:", error);
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
