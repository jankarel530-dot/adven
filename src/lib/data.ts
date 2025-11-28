
import 'server-only';
import type { User, CalendarWindow } from './definitions';

// Import initial data from local JSON files
import usersData from './data/users.json';
import windowsData from './data/windows.json';

export async function getUsers(): Promise<User[]> {
  // Directly return the imported JSON data
  return usersData as User[];
}

export async function setUsers(users: User[]): Promise<void> {
  // This function is disabled for design-only mode.
  console.log("setUsers is disabled in design mode.");
  return;
}

export async function getWindows(): Promise<CalendarWindow[]> {
  // Directly return the imported JSON data and sort it
  const windows = windowsData as CalendarWindow[];
  return windows.sort((a, b) => a.day - b.day);
}

export async function setWindows(windows: CalendarWindow[]): Promise<void> {
  // This function is disabled for design-only mode.
  console.log("setWindows is disabled in design mode.");
  return;
}
