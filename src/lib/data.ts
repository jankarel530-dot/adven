
import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { User, CalendarWindow } from './definitions';

const usersPath = path.join(process.cwd(), 'src', 'lib', 'data', 'users.json');
const windowsPath = path.join(process.cwd(), 'src', 'lib', 'data', 'windows.json');

async function readData<T>(filePath: string): Promise<T> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Failed to read data from ${filePath}:`, error);
        throw new Error(`Nepodařilo se načíst data ze souboru ${path.basename(filePath)}.`);
    }
}

async function writeData<T>(filePath: string, data: T): Promise<void> {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Failed to write data to ${filePath}:`, error);
        throw new Error(`Nepodařilo se zapsat data do souboru ${path.basename(filePath)}.`);
    }
}

export async function getUsers(): Promise<User[]> {
    return readData<User[]>(usersPath);
}

export async function setUsers(users: User[]): Promise<void> {
    return writeData(usersPath, users);
}

export async function getWindows(): Promise<CalendarWindow[]> {
    const windows = await readData<CalendarWindow[]>(windowsPath);
    return windows.sort((a, b) => a.day - b.day);
}

export async function setWindows(windows: CalendarWindow[]): Promise<void> {
    return writeData(windowsPath, windows);
}
