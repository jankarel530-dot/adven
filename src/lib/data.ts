
import 'server-only';
import type { User, CalendarWindow } from './definitions';
import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

// In-memory data store
let users: User[] = JSON.parse(JSON.stringify(initialUsers));
let windows: CalendarWindow[] = JSON.parse(JSON.stringify(initialWindows));


export async function initializeData() {
    console.log("Resetting data to initial state...");
    users = JSON.parse(JSON.stringify(initialUsers));
    windows = JSON.parse(JSON.stringify(initialWindows));
}

// --- User Management ---
export async function getUsers(): Promise<User[]> {
    return JSON.parse(JSON.stringify(users));
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
    const allUsers = await getUsers();
    return allUsers.find(u => u.username === username);
}

export async function addUser(user: Omit<User, 'id' | 'role'>): Promise<User> {
    const newUser: User = {
        id: String(Date.now()), // Simple unique ID
        role: 'user',
        ...user,
    };
    users.push(newUser);
    return newUser;
}

export async function deleteUser(id: string): Promise<{ message: string } | null> {
    const userToDelete = users.find(u => u.id === id);

    if (!userToDelete) {
        return { message: "User not found" };
    }
    if (userToDelete.role === 'admin') {
        return { message: "Cannot delete admin user" };
    }

    users = users.filter(u => u.id !== id);
    return null;
}


// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
    const sortedWindows = JSON.parse(JSON.stringify(windows));
    // Sort by day to be safe
    sortedWindows.sort((a: CalendarWindow, b: CalendarWindow) => a.day - b.day);
    return sortedWindows;
}

export async function getWindowByDay(day: number): Promise<CalendarWindow | undefined> {
    const allWindows = await getWindows();
    return allWindows.find(w => w.day === day);
}

export async function updateWindow(day: number, data: Partial<Omit<CalendarWindow, 'day'>>): Promise<CalendarWindow | null> {
    const windowIndex = windows.findIndex(w => w.day === day);

    if (windowIndex === -1) {
        return null;
    }
    
    const existingWindow = windows[windowIndex];

    const updatedData = {
        ...data,
        // Preserve imageHint if imageUrl is unchanged
        imageHint: data.imageUrl === existingWindow.imageUrl ? existingWindow.imageHint : 'custom image',
    };
    
    windows[windowIndex] = { ...existingWindow, ...updatedData };
    return windows[windowIndex];
}

