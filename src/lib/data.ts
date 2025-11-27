
import 'server-only';
import type { User, CalendarWindow } from './definitions';

import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

// In a real serverless environment, this in-memory cache might not be reliable across requests.
// However, since Vercel rebuilds the app on every commit, and our actions commit to git,
// the `initialUsers` and `initialWindows` will be the latest version on each new build.
// These functions will read from the file system of the build container.
let users: User[] = initialUsers;
let windows: CalendarWindow[] = initialWindows.sort((a, b) => a.day - b.day);

export async function getUsers(): Promise<User[]> {
  return JSON.parse(JSON.stringify(users));
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  return users.find(u => u.username === username);
}

export async function getWindows(): Promise<CalendarWindow[]> {
    return JSON.parse(JSON.stringify(windows));
}

export async function getWindowByDay(day: number): Promise<CalendarWindow | undefined> {
    return windows.find(w => w.day === day);
}

// These functions are placeholders for local development if needed, 
// but the primary data modification logic is handled in `actions.ts` via GitHub API.
export async function addUser(user: Omit<User, 'id' | 'role'>): Promise<User> {
    const newId = String(Date.now());
    const newUser: User = {
        id: newId,
        role: 'user',
        ...user,
    };
    users.push(newUser);
    return newUser;
}

export async function deleteUser(id: string): Promise<{ message: string } | null> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return { message: "User not found" };
    }
    if (users[userIndex].role === 'admin') {
        return { message: "Cannot delete admin user" };
    }
    users.splice(userIndex, 1);
    return null;
}

export async function updateWindow(day: number, data: Partial<Omit<CalendarWindow, 'day'>>): Promise<CalendarWindow | null> {
    const windowIndex = windows.findIndex(w => w.day === day);
    if (windowIndex === -1) {
        return null;
    }
    
    const existingWindow = windows[windowIndex];
    const updatedWindow = { ...existingWindow, ...data };

    // Preserve imageHint if imageUrl hasn't changed
    if (data.imageUrl === existingWindow.imageUrl) {
        updatedWindow.imageHint = existingWindow.imageHint;
    } else {
        updatedWindow.imageHint = 'custom image';
    }
    
    windows[windowIndex] = updatedWindow;
    return updatedWindow;
}

export async function initializeData() {
    users = JSON.parse(JSON.stringify(initialUsers));
    windows = JSON.parse(JSON.stringify(initialWindows)).sort((a, b) => a.day - b.day);
    console.log("In-memory data has been reset to initial state.");
}
