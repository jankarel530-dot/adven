import "server-only";
import type { User, CalendarWindow } from "./definitions";
import { PlaceHolderImages } from "./placeholder-images";

// In a real application, this would be a database.
// For this scaffold, we use in-memory arrays.
// NOTE: This is not safe for concurrent requests in a real app.

let users: User[] = [
  { id: "1", username: "admin", password: "password", role: "admin" },
  { id: "2", username: "user", password: "password", role: "user" },
];

let windows: CalendarWindow[] = Array.from({ length: 24 }, (_, i) => {
  const day = i + 1;
  const placeholder = PlaceHolderImages.find(p => p.id === `day-${day}`) || {
    imageUrl: `https://picsum.photos/seed/${day}/600/400`,
    imageHint: 'christmas placeholder'
  };
  return {
    day: day,
    message: `A special message for day ${day}!`,
    imageUrl: placeholder.imageUrl,
    imageHint: placeholder.imageHint,
    manualState: "default",
  };
});

// --- User Management ---
export async function getUsers(): Promise<Omit<User, 'password'>[]> {
  // Never return passwords, even in a mock API
  return users.map(({ password, ...user }) => user);
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  return users.find((user) => user.username === username);
}

export async function addUser(user: Omit<User, "id" | "role">): Promise<User> {
  const newUser: User = {
    ...user,
    id: String(users.length + 1),
    role: "user",
  };
  users.push(newUser);
  return newUser;
}

// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
  return windows;
}

export async function getWindowByDay(day: number): Promise<CalendarWindow | undefined> {
  return windows.find(w => w.day === day);
}

export async function updateWindow(day: number, data: Partial<Omit<CalendarWindow, 'day'>>): Promise<CalendarWindow | null> {
    const windowIndex = windows.findIndex(w => w.day === day);
    if (windowIndex === -1) {
        return null;
    }

    const updatedWindow = { ...windows[windowIndex], ...data };
    windows[windowIndex] = updatedWindow;
    
    return updatedWindow;
}
