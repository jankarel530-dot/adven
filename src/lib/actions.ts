
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { User } from "./definitions";
import { getUsers, getWindows } from "./data";
import initialUsers from "./data/users.json";
import initialWindows from "./data/windows.json";

// --- Vercel Edge Config Update Function ---

async function updateEdgeConfig<T>(key: 'users' | 'windows', data: T) {
    const connectionString = process.env.EDGE_CONFIG;
     if (!connectionString) {
        throw new Error("Missing EDGE_CONFIG environment variable.");
    }
    const vercelToken = process.env.VERCEL_API_TOKEN;

    if (!vercelToken) {
        throw new Error("Missing VERCEL_API_TOKEN environment variable.");
    }
    
    // We don't need to parse the ID, we can use the connection string directly
    // to determine the config ID.
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
        console.error("Failed to find Edge Config ID:", errorBody);
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
        console.error("Failed to update Edge Config:", errorBody);
        throw new Error(`Failed to update Edge Config: ${errorBody.error?.message || 'Unknown API error'}`);
    }

    // Revalidate paths to reflect changes immediately
    revalidatePath('/admin', 'layout');
    revalidatePath('/', 'layout');

    return await response.json();
}


// --- AUTH ACTIONS ---

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Chybně vyplněné údaje.",
    };
  }

  const { username, password } = validatedFields.data;
  let authenticatedUser: User | null = null;
  
  try {
    const users = await getUsers();
    
    const user = users.find(u => u.username === username);
    if (user && user.password === password) {
        authenticatedUser = user;
    }

  } catch (error) {
    console.error("Login error during data fetching:", error);
     const errorMessage = error instanceof Error ? error.message : "Během přihlašování došlo k chybě serveru.";
     if (errorMessage.includes("connection string")) {
         return { message: "Chyba připojení k databázi. Zkontrolujte nastavení proměnných prostředí na Vercelu." };
     }
     return { message: errorMessage };
  }

  if (!authenticatedUser) {
    return { message: "Neplatné uživatelské jméno nebo heslo." };
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...sessionData } = authenticatedUser;
  
  await cookies().set("session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // One week
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  cookies().delete("session");
  redirect("/login");
}


// --- ADMIN ACTIONS ---

const userSchema = z.object({
  username: z.string().min(3, "Uživatelské jméno musí mít alespoň 3 znaky."),
  password: z.string().min(4, "Heslo musí mít alespoň 4 znaky."),
});

export async function addUser(prevState: any, formData: FormData) {
  try {
      const validatedFields = userSchema.safeParse(
        Object.fromEntries(formData.entries())
      );

      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: "Zkontrolujte zadané údaje.",
        };
      }

      const { username, password } = validatedFields.data;
      const users = await getUsers();

      if (users.find(u => u.username === username)) {
        return {
          errors: { username: ["Uživatel s tímto jménem již existuje."] },
          message: "Uživatel s tímto jménem již existuje.",
        };
      }

      const newUser: User = {
        id: new Date().getTime().toString(),
        username,
        password,
        role: "user",
      };

      const updatedUsers = [...users, newUser];
      await updateEdgeConfig('users', updatedUsers);
      
      revalidatePath("/admin/users");
      return { message: `Uživatel ${username} byl úspěšně vytvořen.`, errors: null };
  } catch (error) {
    console.error("Failed to add user:", error);
    const message = error instanceof Error ? error.message : "Nepodařilo se přidat uživatele.";
    return { message, isError: true, errors: { server: [message] } };
  }
}

export async function deleteUserAction(id: string) {
    try {
        let users = await getUsers();
        const userToDelete = users.find(u => u.id === id);

        if (!userToDelete) {
            return { isError: true, message: "Uživatel nenalezen." };
        }
        if (userToDelete.role === 'admin') {
            return { isError: true, message: "Nelze smazat administrátora." };
        }

        const updatedUsers = users.filter(u => u.id !== id);
        await updateEdgeConfig('users', updatedUsers);
        
        revalidatePath('/admin/users');
        return { isError: false, message: `Uživatel ${userToDelete.username} byl smazán.` };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { isError: true, message: 'Nepodařilo se smazat uživatele.' };
    }
}

const windowSchema = z.object({
  day: z.coerce.number().int().min(1).max(24),
  message: z.string().optional(),
  imageUrl: z.string().url({ message: "Zadejte platnou URL adresu obrázku." }).or(z.literal("")),
  videoUrl: z.string().url({ message: "Zadejte platnou URL pro video." }).or(z.literal("")),
  manualState: z.enum(["default", "unlocked", "locked"]),
});

export async function updateWindow(prevState: any, formData: FormData) {
  const validatedFields = windowSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.error("Window validation failed:", validatedFields.error.flatten());
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Neplatná data pro okénko.",
    };
  }
  
  const { day, ...dataToUpdate } = validatedFields.data;

  try {
    let windows = await getWindows();
    const windowIndex = windows.findIndex(w => w.day === day);

    if (windowIndex === -1) {
      return { message: "Okénko nebylo nalezeno." };
    }
    
    windows[windowIndex] = { ...windows[windowIndex], ...dataToUpdate };

    await updateEdgeConfig('windows', windows);
    
    revalidatePath("/admin/windows");
    revalidatePath("/");
    return { message: `Den ${day} byl úspěšně upraven.` };
  } catch (error) {
    console.error("Failed to update window:", error);
    return { message: `Nepodařilo se upravit den ${day}.` };
  }
}

export async function initializeDatabaseAction() {
    try {
        console.log("Initializing database with data from JSON files...");
        await updateEdgeConfig('users', initialUsers);
        await updateEdgeConfig('windows', initialWindows);
        console.log("Database initialized successfully.");
        
        revalidatePath('/admin', 'layout');
        revalidatePath('/', 'layout');

        return { isError: false, message: "Data byla úspěšně resetována." };
    } catch (error) {
        console.error('Failed to initialize database:', error);
        const message = error instanceof Error ? error.message : "Nepodařilo se resetovat data.";
        return { isError: true, message };
    }
}
