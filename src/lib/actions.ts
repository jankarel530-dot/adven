
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { CalendarWindow, User } from "./definitions";
import { create, get } from '@vercel/edge-config';
import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

// --- Vercel Edge Config Helpers ---

async function getEdgeConfigData<T>(key: string): Promise<T> {
    // Vercel injects the EDGE_CONFIG environment variable automatically
    const data = await get<T>(key);
    if (data === undefined) {
        throw new Error(`Data for key "${key}" not found in Edge Config.`);
    }
    return data;
}

async function updateEdgeConfigData<T>(key: string, data: T): Promise<void> {
    await create({
        [key]: data,
    });
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
    };
  }
  
  const { username, password } = validatedFields.data;

  try {
    const users = await getEdgeConfigData<User[]>('users');
    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
      return { message: "Neplatné uživatelské jméno nebo heslo" };
    }

    cookies().set("session", user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // One week
      path: "/",
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error && error.message.includes("not found in Edge Config")) {
        return { message: "Data v aplikaci ještě nebyla inicializována. Požádejte administrátora, aby resetoval data." };
    }
    return { message: "Během přihlášení došlo k neočekávané chybě." };
  }

  redirect("/");
}

export async function logout() {
  cookies().delete("session");
  redirect("/login");
}


// --- DATA-MODIFYING ACTIONS ---

const addUserSchema = z.object({
  username: z.string().min(3, "Uživatelské jméno musí mít alespoň 3 znaky"),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
});

export async function addUser(prevState: any, formData: FormData) {
  const validatedFields = addUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Ověření se nezdařilo."
    };
  }

  try {
    const users = await getEdgeConfigData<User[]>('users');
    const { username, password } = validatedFields.data;

    if (users.some(u => u.username === username)) {
      return { message: "Uživatelské jméno již existuje", errors: { username: ["Uživatelské jméno je již obsazené"] } };
    }

    const newUser: User = {
      id: String(Date.now()),
      username,
      password,
      role: 'user',
    };
    const updatedUsers = [...users, newUser];

    await updateEdgeConfigData('users', updatedUsers);
    revalidatePath("/admin/users");
    return { message: `Uživatel ${username} byl úspěšně vytvořen.` };
  } catch (error) {
    console.error("Add user error:", error);
    return { message: "Nepodařilo se vytvořit uživatele.", errors: {} };
  }
}

export async function deleteUserAction(id: string) {
    try {
      const users = await getEdgeConfigData<User[]>('users');
      const userToDelete = users.find(u => u.id === id);
      if (!userToDelete) {
        return { message: "Uživatel nenalezen", isError: true };
      }
      if (userToDelete.role === 'admin') {
        return { message: "Nelze smazat administrátora", isError: true };
      }
      
      const updatedUsers = users.filter(u => u.id !== id);
      await updateEdgeConfigData('users', updatedUsers);
      
      revalidatePath('/admin/users');
      return { message: 'Uživatel úspěšně smazán.', isError: false };
    } catch (error) {
       console.error("Delete user error:", error);
       return { message: 'Nepodařilo se smazat uživatele.', isError: true };
    }
}


const updateWindowSchema = z.object({
    day: z.coerce.number(),
    message: z.string().min(1, "Zpráva nesmí být prázdná"),
    imageUrl: z.string().url("Musí být platná URL, pokud je zadána").optional().or(z.literal('')),
    videoUrl: z.string().url("Musí být platná URL, pokud je zadána").optional().or(z.literal('')),
    manualState: z.enum(["default", "unlocked", "locked"]),
});

export async function updateWindow(prevState: any, formData: FormData) {
    const validatedFields = updateWindowSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Ověření se nezdařilo."
        };
    }
    
    const { day, ...data } = validatedFields.data;
    
    try {
        const windows = await getEdgeConfigData<CalendarWindow[]>('windows');
        const windowIndex = windows.findIndex(w => w.day === day);
        if (windowIndex === -1) {
            return { message: "Okénko nebylo nalezeno." };
        }

        const existingWindow = windows[windowIndex];
        const imageHint = data.imageUrl === existingWindow.imageUrl ? existingWindow.imageHint : 'custom image';
        
        windows[windowIndex] = { ...existingWindow, ...data, imageHint };

        await updateEdgeConfigData('windows', windows);

        revalidatePath("/admin/windows");
        revalidatePath("/");
        return { message: `Okénko pro den ${day} bylo aktualizováno.` };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Došlo k neznámé chybě";
        console.error("Update window error:", error);
        return { message: `Nepodařilo se aktualizovat okénko: ${errorMessage}` };
    }
}

export async function initializeDatabaseAction() {
    try {
      await updateEdgeConfigData('users', initialUsers);
      await updateEdgeConfigData('windows', initialWindows);

      revalidatePath('/admin', 'layout');
      revalidatePath('/', 'layout');
      return { success: true };
    } catch(e) {
      console.error(e);
      return { success: false };
    }
}
