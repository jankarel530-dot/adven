import 'server-only';
import {promises as fs} from 'fs';
import path from 'path';
import type {User, CalendarWindow} from './definitions';

// In a real production environment, use a database.
// For this project, we use JSON files for persistence.
const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const usersFilePath = path.join(dataDir, 'users.json');
const windowsFilePath = path.join(dataDir, 'windows.json');

// Helper function to read user data
async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users.json, returning default users:', error);
    // Default data if file doesn't exist
    return [
      {id: '1', username: 'admin', password: 'password', role: 'admin'},
      {id: '2', username: 'user', password: 'password', role: 'user'},
    ];
  }
}

// Helper function to write user data
async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(dataDir, {recursive: true});
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// Helper function to read window data
async function readWindows(): Promise<CalendarWindow[]> {
  try {
    const data = await fs.readFile(windowsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading windows.json, returning default windows:', error);
    // Default data if file doesn't exist
    return Array.from({length: 24}, (_, i) => ({
      day: i + 1,
      message: `A special message for day ${i + 1}!`,
      imageUrl: `https://picsum.photos/seed/${i + 1}/600/400`,
      imageHint: 'christmas placeholder',
      videoUrl: '',
      manualState: 'default',
    }));
  }
}

// Helper function to write window data
async function writeWindows(windows: CalendarWindow[]): Promise<void> {
  await fs.mkdir(dataDir, {recursive: true});
  await fs.writeFile(windowsFilePath, JSON.stringify(windows, null, 2), 'utf-8');
}

// --- User Management ---
export async function getUsers(): Promise<User[]> {
  return readUsers();
}

export async function findUserByUsername(
  username: string
): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.username === username);
}

export async function addUser(user: Omit<User, 'id' | 'role'>): Promise<User> {
  const users = await readUsers();
  const newUser: User = {
    ...user,
    id: String(Date.now()), // Use a more unique ID
    role: 'user',
  };
  users.push(newUser);
  await writeUsers(users);
  return newUser;
}

export async function deleteUser(
  id: string
): Promise<{message: string} | null> {
  let users = await readUsers();
  const userToDelete = users.find(user => user.id === id);

  if (!userToDelete) {
    return {message: 'User not found'};
  }
  if (userToDelete.role === 'admin') {
    return {message: 'Cannot delete admin user'};
  }

  users = users.filter(user => user.id !== id);
  await writeUsers(users);
  return null;
}

// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
  return readWindows();
}

export async function getWindowByDay(
  day: number
): Promise<CalendarWindow | undefined> {
  const windows = await readWindows();
  return windows.find(w => w.day === day);
}

export async function updateWindow(
  day: number,
  data: Partial<Omit<CalendarWindow, 'day'>>
): Promise<CalendarWindow | null> {
  const windows = await readWindows();
  const windowIndex = windows.findIndex(w => w.day === day);
  if (windowIndex === -1) {
    return null;
  }

  windows[windowIndex] = {...windows[windowIndex], ...data};
  await writeWindows(windows);

  return windows[windowIndex];
}
