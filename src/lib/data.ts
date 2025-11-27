import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { User, CalendarWindow } from './definitions';

// This flag is used to prevent multiple reads in a single request lifecycle
let memoryCache = {
    users: null as User[] | null,
    windows: null as CalendarWindow[] | null,
};

const usersPath = path.join(process.cwd(), 'src', 'lib', 'data', 'users.json');
const windowsPath = path.join(process.cwd(), 'src', 'lib', 'data', 'windows.json');

async function readUsersFile(): Promise<User[]> {
    if (process.env.NODE_ENV === 'development' && memoryCache.users) {
        return memoryCache.users;
    }
    try {
        const fileContent = await fs.readFile(usersPath, 'utf-8');
        const users: User[] = JSON.parse(fileContent);
        memoryCache.users = users;
        return users;
    } catch (error) {
        console.error("Could not read users.json. Returning empty array.", error);
        return [];
    }
}

async function writeUsersFile(users: User[]): Promise<void> {
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    memoryCache.users = null; // Invalidate cache
}

async function readWindowsFile(): Promise<CalendarWindow[]> {
    if (process.env.NODE_ENV === 'development' && memoryCache.windows) {
        return memoryCache.windows;
    }
    try {
        const fileContent = await fs.readFile(windowsPath, 'utf-8');
        const windows: CalendarWindow[] = JSON.parse(fileContent);
        memoryCache.windows = windows;
        return windows;
    } catch (error) {
        console.error("Could not read windows.json. Returning empty array.", error);
        return [];
    }
}

async function writeWindowsFile(windows: CalendarWindow[]): Promise<void> {
    await fs.writeFile(windowsPath, JSON.stringify(windows, null, 2), 'utf-8');
    memoryCache.windows = null; // Invalidate cache
}


// --- User Management ---
export async function getUsers(): Promise<User[]> {
    return await readUsersFile();
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
    const users = await readUsersFile();
    return users.find(u => u.username === username);
}

export async function addUser(user: Omit<User, 'id' | 'role'>): Promise<User> {
    const users = await readUsersFile();
    const newUser: User = {
        id: String(Date.now()), // Simple unique ID
        role: 'user',
        ...user,
    };
    users.push(newUser);
    await writeUsersFile(users);
    return newUser;
}

export async function deleteUser(id: string): Promise<{ message: string } | null> {
    let users = await readUsersFile();
    const userToDelete = users.find(u => u.id === id);

    if (!userToDelete) {
        return { message: "User not found" };
    }
    if (userToDelete.role === 'admin') {
        return { message: "Cannot delete admin user" };
    }

    users = users.filter(u => u.id !== id);
    await writeUsersFile(users);
    return null;
}


// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
    const windows = await readWindowsFile();
    // Sort by day to be safe
    windows.sort((a, b) => a.day - b.day);
    return windows;
}

export async function getWindowByDay(day: number): Promise<CalendarWindow | undefined> {
    const windows = await readWindowsFile();
    return windows.find(w => w.day === day);
}

export async function updateWindow(day: number, data: Partial<Omit<CalendarWindow, 'day'>>): Promise<CalendarWindow | null> {
    const windows = await readWindowsFile();
    const windowIndex = windows.findIndex(w => w.day === day);

    if (windowIndex === -1) {
        return null;
    }
    
    const existingWindow = windows[windowIndex];

    // Preserve the imageHint if it's not being updated
    const updatedData = {
        ...data,
        imageHint: data.imageUrl === existingWindow.imageUrl ? existingWindow.imageHint : ``,
    };

    windows[windowIndex] = { ...existingWindow, ...updatedData };
    await writeWindowsFile(windows);
    return windows[windowIndex];
}
