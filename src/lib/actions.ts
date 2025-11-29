"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getUsers, setUser, deleteUser, getWindows, setWindow } from "./data";
import { User, CalendarWindow } from "./definitions";

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
  
  try {
    const users = await getUsers();
    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        return { message: "Neplatné uživatelské jméno nebo heslo." };
    }
  
    const { password: _, ...sessionData } = user;
    
    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // One week
      path: "/",
    });

  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Během přihlašování došlo k chybě serveru.";
     return { message: errorMessage };
  }

  revalidatePath('/');
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
    const validatedFields = userSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Chybně vyplněné údaje.",
        isError: true,
        };
    }

    try {
        const users = await getUsers();
        const existingUser = users.find(u => u.username === validatedFields.data.username);
        if (existingUser) {
            return { message: "Uživatel s tímto jménem již existuje.", isError: true };
        }
        
        const newUser: User = {
            id: crypto.randomUUID(),
            ...validatedFields.data,
            role: 'user',
        };
        
        await setUser(newUser);
        revalidatePath('/admin/users');
        return { message: `Uživatel ${newUser.username} byl vytvořen.`, isError: false };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Došlo k chybě při vytváření uživatele.';
        return { message, isError: true };
    }
}

export async function deleteUserAction(id: string) {
    try {
        await deleteUser(id);
        revalidatePath('/admin/users');
        return { message: `Uživatel byl smazán.`, isError: false };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Došlo k chybě při mazání uživatele.';
        return { message, isError: true };
    }
}

const windowSchema = z.object({
  id: z.string(),
  day: z.coerce.number().int().min(1).max(24),
  message: z.string().optional(),
  imageUrl: z.string().url({ message: "Zadejte platnou URL adresu obrázku." }).or(z.literal("")).optional(),
  videoUrl: z.string().url({ message: "Zadejte platnou URL pro video." }).or(z.literal("")).optional(),
  manualState: z.enum(["default", "unlocked", "locked"]),
});

export async function updateWindow(prevState: any, formData: FormData) {
  const day = formData.get('day');

  const validatedFields = windowSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Chybně vyplněné údaje.",
      isError: true,
    };
  }

  try {
    const windows = await getWindows();
    const windowToUpdate = windows.find(w => w.id === validatedFields.data.id);
    
    if (!windowToUpdate) {
        throw new Error(`Window with id ${validatedFields.data.id} not found.`);
    }

    const updatedWindow: CalendarWindow = {
        ...windowToUpdate,
        ...validatedFields.data,
        message: validatedFields.data.message ?? '',
        imageUrl: validatedFields.data.imageUrl ?? '',
        videoUrl: validatedFields.data.videoUrl ?? '',
    };

    await setWindow(updatedWindow);

    revalidatePath('/admin/windows');
    revalidatePath('/');

    return { message: `Okénko ${day} bylo úspěšně aktualizováno.`, isError: false };

  } catch(e) {
    const message = e instanceof Error ? e.message : `Došlo k chybě při úpravě okénka ${day}.`;
    return { message, isError: true };
  }
}
