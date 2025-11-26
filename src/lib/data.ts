
import "server-only";
import type { User, CalendarWindow } from "./definitions";
import placeholderData from './placeholder-images.json';

// In a real application, this would be a database.
// For this scaffold, we use in-memory data.
// This approach prevents data from being reset on every hot-reload in development.

declare global {
  // eslint-disable-next-line no-var
  var __users: User[] | undefined;
  // eslint-disable-next-line no-var
  var __windows: CalendarWindow[] | undefined;
}

const initializeUsers = (): User[] => {
    return [
        { id: "1", username: "admin", password: "password", role: "admin" },
        { id: "2", username: "user", password: "password", role: "user" },
    ];
}

const initializeWindows = (): CalendarWindow[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const day = i + 1;
    const placeholder = placeholderData.placeholderImages.find(p => p.id === `day-${day}`) || {
      imageUrl: `https://picsum.photos/seed/${day}/600/400`,
      imageHint: 'christmas placeholder'
    };
    return {
      day: day,
      message: `A special message for day ${day}!`,
      imageUrl: placeholder.imageUrl,
      imageHint: placeholder.imageHint,
      videoUrl: "",
      manualState: "default",
    };
  });
};

if (global.__users === undefined) {
  global.__users = initializeUsers();
}
if (global.__windows === undefined) {
  global.__windows = initializeWindows();
}

const users: User[] = global.__users;
const windows: CalendarWindow[] = global.__windows;


// --- User Management ---
export async function getUsers(): Promise<User[]> {
  return JSON.parse(JSON.stringify(users));
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const user = users.find((user) => user.username === username);
  return user ? JSON.parse(JSON.stringify(user)) : undefined;
}

export async function addUser(user: Omit<User, "id" | "role">): Promise<User> {
  const newUser: User = {
    ...user,
    id: String(Date.now()), // Use a more unique ID
    role: "user",
  };
  users.push(newUser);
  return JSON.parse(JSON.stringify(newUser));
}

export async function deleteUser(id: string): Promise<{ message: string } | null> {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return { message: "User not found" };
    }
    const userToDelete = users[userIndex];
    if (userToDelete.role === 'admin') {
        return { message: "Cannot delete admin user" };
    }
    users.splice(userIndex, 1);
    return null;
}

// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
  return JSON.parse(JSON.stringify(windows));
}

export async function getWindowByDay(day: number): Promise<CalendarWindow | undefined> {
  const window = windows.find(w => w.day === day);
  return window ? JSON.parse(JSON.stringify(window)) : undefined;
}

export async function updateWindow(day: number, data: Partial<Omit<CalendarWindow, 'day'>>): Promise<CalendarWindow | null> {
    const windowIndex = windows.findIndex(w => w.day === day);
    if (windowIndex === -1) {
        return null;
    }

    windows[windowIndex] = { ...windows[windowIndex], ...data };
    
    return JSON.parse(JSON.stringify(windows[windowIndex]));
}
