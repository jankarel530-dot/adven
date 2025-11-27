import 'server-only';
import usersData from './data/users.json';
import windowsData from './data/windows.json';
import type {User, CalendarWindow} from './definitions';

// In a real production environment, use a database.
// For this project, we simulate data persistence by importing JSON files.
// Note: Changes made via the app will not persist across server restarts
// because we are not writing back to the files.

let users: User[] = [...usersData];
let windows: CalendarWindow[] = [...windowsData.map(w => ({...w}))];


// --- User Management ---
export async function getUsers(): Promise<User[]> {
  return Promise.resolve(users);
}

export async function findUserByUsername(
  username: string
): Promise<User | undefined> {
  return Promise.resolve(users.find(user => user.username === username));
}

export async function addUser(user: Omit<User, 'id' | 'role'>): Promise<User> {
  const newUser: User = {
    ...user,
    id: String(Date.now()), // Use a more unique ID
    role: 'user',
  };
  users.push(newUser);
  return Promise.resolve(newUser);
}

export async function deleteUser(
  id: string
): Promise<{message: string} | null> {
  const userToDelete = users.find(user => user.id === id);

  if (!userToDelete) {
    return Promise.resolve({message: 'User not found'});
  }
  if (userToDelete.role === 'admin') {
    return Promise.resolve({message: 'Cannot delete admin user'});
  }

  users = users.filter(user => user.id !== id);
  return Promise.resolve(null);
}

// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
  return Promise.resolve(windows);
}

export async function getWindowByDay(
  day: number
): Promise<CalendarWindow | undefined> {
  return Promise.resolve(windows.find(w => w.day === day));
}

export async function updateWindow(
  day: number,
  data: Partial<Omit<CalendarWindow, 'day'>>
): Promise<CalendarWindow | null> {
  const windowIndex = windows.findIndex(w => w.day === day);
  if (windowIndex === -1) {
    return Promise.resolve(null);
  }

  windows[windowIndex] = {...windows[windowIndex], ...data};

  return Promise.resolve(windows[windowIndex]);
}
