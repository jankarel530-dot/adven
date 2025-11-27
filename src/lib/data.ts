
import 'server-only';
import { createClient } from '@vercel/edge-config';
import type { User, CalendarWindow } from './definitions';
import initialUsers from "./data/users.json";
import initialWindows from "./data/windows.json";

function getClient() {
    const connectionString = process.env.EDGE_CONFIG;
    if (!connectionString) {
        throw new Error('@vercel/edge-config: No connection string provided. Please set the EDGE_CONFIG environment variable.');
    }
    return createClient(connectionString);
}

// This function is for internal use to write data, not for reading.
async function updateEdgeConfig<T>(key: 'users' | 'windows', data: T) {
    const connectionString = process.env.EDGE_CONFIG;
     if (!connectionString) {
        throw new Error("Missing EDGE_CONFIG environment variable.");
    }
    const vercelToken = process.env.VERCEL_API_TOKEN;

    if (!vercelToken) {
        throw new Error("Missing VERCEL_API_TOKEN environment variable.");
    }
    
    const configIdRes = await fetch(`https://api.vercel.com/v1/edge-config/find-by-connection-string`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionString }),
    });

    if (!configIdRes.ok) {
        const errorBody = await configIdRes.json();
        throw new Error(`Failed to find Edge Config ID from connection string: ${errorBody.error?.message || 'Unknown API error'}`);
    }
    const {id: configId} = await configIdRes.json();


    const url = `https://api.vercel.com/v1/edge-config/${configId}/items`;

    const response = await fetch(url, {
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
        const errorBody = await response.json();
        throw new Error(`Failed to update Edge Config: ${errorBody.error?.message || 'Unknown API error'}`);
    }

    return await response.json();
}


export async function getUsers(): Promise<User[]> {
    const client = getClient();
    let users = await client.get<User[]>('users');
    
    // If no users found, initialize with default users and return them
    if (!users || users.length === 0) {
        console.log("No users found in Edge Config, initializing with default data.");
        try {
            await updateEdgeConfig('users', initialUsers);
            return initialUsers as User[];
        } catch (error) {
            console.error("Failed to initialize users in Edge Config:", error);
            throw error;
        }
    }
    
    return users;
}

export async function getWindows(): Promise<CalendarWindow[]> {
    const client = getClient();
    let windows = await client.get<CalendarWindow[]>('windows');

    // If no windows found, initialize with default windows and return them
    if (!windows || windows.length === 0) {
        console.log("No windows found in Edge Config, initializing with default data.");
        try {
            await updateEdgeConfig('windows', initialWindows);
            return initialWindows as CalendarWindow[];
        } catch(error) {
            console.error("Failed to initialize windows in Edge Config:", error);
            throw error;
        }
    }
    
    const sortedWindows = windows.sort((a, b) => a.day - b.day);
    return sortedWindows;
}
