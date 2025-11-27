
import 'server-only';
import { createClient } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';
import initialUsers from "./data/users.json";
import initialWindows from "./data/windows.json";

async function updateEdgeConfig<T>(key: 'users' | 'windows', value: T) {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/update-config`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-token": process.env.EDGE_CONFIG_API_TOKEN || '',
        },
        body: JSON.stringify({ key, value }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update Edge Config");
    }
}


async function initializeData<T>(key: 'users' | 'windows', initialData: T): Promise<T> {
    try {
        console.log(`Initializing ${key} via API route...`);
        await updateEdgeConfig(key, initialData);
        console.log(`${key} initialized successfully.`);
        return initialData;
    } catch (error) {
        console.error(`Failed to initialize ${key}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Nepodařilo se inicializovat data pro ${key}. Chyba: ${errorMessage}`);
    }
}

export async function getUsers(): Promise<User[]> {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        throw new Error('EDGE_CONFIG connection string not found.');
    }
    
    try {
        const client = createClient(connectionString);
        let users = await client.get<User[]>('users');
        
        if (!users) {
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
        throw new Error('EDGE_CONFIG connection string not found.');
    }

    try {
        const client = createClient(connectionString);
        let windows = await client.get<CalendarWindow[]>('windows');

        if (!windows) {
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
