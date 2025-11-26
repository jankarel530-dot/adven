
import "server-only";
import type { User, CalendarWindow } from "./definitions";
import { PlaceHolderImages } from "./placeholder-images";

// In a real application, this would be a database.
// For this scaffold, we use in-memory data.
// This approach prevents data from being reset on every hot-reload.

let users: User[] | null = null;
let windows: CalendarWindow[] | null = null;

function initializeData() {
  if (users === null) {
    users = [
      { id: "1", username: "admin", password: "password", role: "admin" },
      { id: "2", username: "user", password: "password", role: "user" },
    ];
  }

  if (windows === null) {
    windows = Array.from({ length: 24 }, (_, i) => {
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
        videoUrl: "", // Initialize with empty videoUrl
        manualState: "default",
      };
    });
  }
}

initializeData();

// --- User Management ---
export async function getUsers(): Promise<User[]> {
  return users!;
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  return users!.find((user) => user.username === username);
}

export async function addUser(user: Omit<User, "id" | "role">): Promise<User> {
  const newUser: User = {
    ...user,
    id: String(users!.length + 1),
    role: "user",
  };
  users!.push(newUser);
  return newUser;
}

export async function deleteUser(id: string): Promise<{ message: string } | null> {
    const userIndex = users!.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return { message: "User not found" };
    }
    const userToDelete = users![userIndex];
    if (userToDelete.role === 'admin') {
        return { message: "Cannot delete admin user" };
    }
    users!.splice(userIndex, 1);
    return null;
}

// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
  return windows!;
}

export async function getWindowByDay(day: number): Promise<CalendarWindow | undefined> {
  return windows!.find(w => w.day === day);
}

export async function updateWindow(day: number, data: Partial<Omit<CalendarWindow, 'day'>>): Promise<CalendarWindow | null> {
    const windowIndex = windows!.findIndex(w => w.day === day);
    if (windowIndex === -1) {
        return null;
    }

    const updatedWindow = { ...windows![windowIndex], ...data };
    windows![windowIndex] = updatedWindow;
    
    return updatedWindow;
}
