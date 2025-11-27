
import 'server-only';
import { get } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';

// These functions read data from Vercel's Edge Config store.
// The data is written via server actions in `actions.ts`.

export async function getUsers(): Promise<User[]> {
    try {
        const users = await get<User[]>('users');
        return users ? JSON.parse(JSON.stringify(users)) : [];
    } catch (error) {
        console.warn("Could not fetch users from Edge Config. This might be expected if data hasn't been initialized yet.");
        return [];
    }
}

export async function getWindows(): Promise<CalendarWindow[]> {
    try {
        const windows = await get<CalendarWindow[]>('windows');
        if (!windows) return [];
        const sortedWindows = windows.sort((a, b) => a.day - b.day);
        return JSON.parse(JSON.stringify(sortedWindows));
    } catch (error) {
        console.warn("Could not fetch windows from Edge Config. This might be expected if data hasn't been initialized yet.");
        return [];
    }
}
