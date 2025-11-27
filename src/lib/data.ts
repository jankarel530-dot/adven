
import 'server-only';
import { createClient } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';
import initialUsers from "./data/users.json";
import initialWindows from "./data/windows.json";

async function updateEdgeConfig<T>(key: 'users' | 'windows', data: T) {
    const connectionString = process.env.EDGE_CONFIG;
     if (!connectionString) {
        throw new Error("Chybějící proměnná prostředí EDGE_CONFIG.");
    }
    const vercelToken = process.env.VERCEL_API_TOKEN;

    if (!vercelToken) {
        throw new Error("Chybějící proměnná prostředí VERCEL_API_TOKEN.");
    }
    
    const findIdUrl = `https://api.vercel.com/v1/edge-config/find-by-connection-string`;
    const configIdRes = await fetch(findIdUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionString }),
    });

    if (!configIdRes.ok) {
        const errorBody = await configIdRes.text();
        console.error("Chyba při hledání ID Edge Configu:", errorBody);
        throw new Error(`Nepodařilo se najít ID Edge Configu: ${errorBody}`);
    }
    const {id: configId} = await configIdRes.json();


    const updateUrl = `https://api.vercel.com/v1/edge-config/${configId}/items`;

    const response = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            items: [
                {
                    operation: "update",
                    key: key,
                    value: data,
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Chyba při aktualizaci Edge Configu:", errorBody);
        throw new Error(`Nepodařilo se aktualizovat Edge Config: ${errorBody}`);
    }

    return await response.json();
}

export async function getUsers(): Promise<User[]> {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        throw new Error('@vercel/edge-config: No connection string provided. Please set the EDGE_CONFIG environment variable.');
    }
    const client = createClient(connectionString);
    let users = await client.get<User[]>('users');
    
    if (!users || users.length === 0) {
        console.log("Žádní uživatelé v Edge Configu, inicializuji výchozí data.");
        try {
            await updateEdgeConfig('users', initialUsers);
            console.log("Výchozí uživatelé úspěšně nahráni.");
            return initialUsers as User[];
        } catch (error) {
            console.error("Nepodařilo se inicializovat uživatele v Edge Config:", error);
            throw error; // Re-throw the error to be caught by the caller
        }
    }
    
    return users;
}

export async function getWindows(): Promise<CalendarWindow[]> {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        throw new Error('@vercel/edge-config: No connection string provided. Please set the EDGE_CONFIG environment variable.');
    }
    const client = createClient(connectionString);
    let windows = await client.get<CalendarWindow[]>('windows');

    if (!windows || windows.length === 0) {
        console.log("Žádná okénka v Edge Configu, inicializuji výchozí data.");
        try {
            await updateEdgeConfig('windows', initialWindows);
            console.log("Výchozí okénka úspěšně nahrána.");
            return initialWindows as CalendarWindow[];
        } catch(error) {
            console.error("Nepodařilo se inicializovat okénka v Edge Config:", error);
            throw error;
        }
    }
    
    const sortedWindows = windows.sort((a, b) => a.day - b.day);
    return sortedWindows;
}
