
import 'server-only';
import { createClient } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';
import initialUsers from "./data/users.json";
import initialWindows from "./data/windows.json";

async function initializeData<T>(key: 'users' | 'windows', initialData: T): Promise<T> {
    if (!process.env.EDGE_CONFIG) {
        throw new Error('EDGE_CONFIG connection string not found. Please set it in your environment variables.');
    }
    const client = createClient(process.env.EDGE_CONFIG);
    try {
        await client.update(key, initialData);
        console.log(`Initialized ${key} in Edge Config.`);
        return initialData;
    } catch (error) {
        console.error(`Failed to initialize ${key} in Edge Config:`, error);
        throw new Error(`Nepodařilo se inicializovat data pro ${key}.`);
    }
}

export async function getUsers(): Promise<User[]> {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        throw new Error('EDGE_CONFIG connection string not found. Please set it in your environment variables.');
    }
    
    try {
        const client = createClient(connectionString);
        let users = await client.get<User[]>('users');
        
        if (users === undefined) {
            console.log("No users found in Edge Config, initializing with default data.");
            return await initializeData('users', initialUsers as User[]);
        }
        
        return users;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching users from Edge Config:", errorMessage);
        throw new Error(`Nepodařilo se načíst uživatele z Edge Configu. Zkontrolujte připojení a nastavení. Původní chyba: ${errorMessage}`);
    }
}

export async function getWindows(): Promise<CalendarWindow[]> {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        throw new Error('EDGE_CONFIG connection string not found. Please set it in your environment variables.');
    }

    try {
        const client = createClient(connectionString);
        let windows = await client.get<CalendarWindow[]>('windows');

        if (windows === undefined) {
            console.log("No windows found in Edge Config, initializing with default data.");
            return await initializeData('windows', initialWindows as CalendarWindow[]);
        }
        
        const sortedWindows = windows.sort((a, b) => a.day - b.day);
        return sortedWindows;

    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching windows from Edge Config:", errorMessage);
        throw new Error(`Nepodařilo se načíst okénka z Edge Configu. Zkontrolujte připojení a nastavení. Původní chyba: ${errorMessage}`);
    }
}
