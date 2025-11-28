
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { User } from "./definitions";
import { getUsers } from "./data";

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


// --- ADMIN ACTIONS (DISABLED FOR DESIGN MODE) ---

const userSchema = z.object({
  username: z.string().min(3, "Uživatelské jméno musí mít alespoň 3 znaky."),
  password: z.string().min(4, "Heslo musí mít alespoň 4 znaky."),
});

export async function addUser(prevState: any, formData: FormData) {
  console.log("addUser action called, but it's disabled in design mode.");
  revalidatePath('/admin/users');
  return { message: `Režim designu: Přidání uživatele je deaktivováno.`, errors: null, isError: false };
}

export async function deleteUserAction(id: string) {
    console.log("deleteUserAction called, but it's disabled in design mode.");
    revalidatePath('/admin/users');
    return { isError: false, message: `Režim designu: Mazání uživatele je deaktivováno.` };
}

const windowSchema = z.object({
  day: z.coerce.number().int().min(1).max(24),
  message: z.string().optional(),
  imageUrl: z.string().url({ message: "Zadejte platnou URL adresu obrázku." }).or(z.literal("")).optional(),
  videoUrl: z.string().url({ message: "Zadejte platnou URL pro video." }).or(z.literal("")).optional(),
  manualState: z.enum(["default", "unlocked", "locked"]),
});

export async function updateWindow(prevState: any, formData: FormData) {
  const day = formData.get('day');
  console.log(`updateWindow action called for day ${day}, but it's disabled in design mode.`);
  revalidatePath('/admin/windows');
  return { message: `Režim designu: Úprava okénka ${day} je deaktivována.`, isError: false };
}
