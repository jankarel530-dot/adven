"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { findUserByUsername, addUser as dbAddUser, updateWindow as dbUpdateWindow } from "./data";
import type { CalendarWindow } from "./definitions";

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
    const user = await findUserByUsername(username);

    if (!user || user.password !== password) {
      return { message: "Invalid username or password" };
    }

    // In a real app, you'd create a secure, encrypted JWT.
    // For this scaffold, we store the username in the cookie.
    cookies().set("session", user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // One week
      path: "/",
    });
  } catch (error) {
    return { message: "An unexpected error occurred." };
  }

  redirect("/");
}

export async function logout() {
  cookies().delete("session");
  redirect("/login");
}

const addUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function addUser(prevState: any, formData: FormData) {
  const validatedFields = addUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    return { message: "Username already exists" };
  }

  await dbAddUser({ username, password });
  revalidatePath("/admin/users");
  return { message: `User ${username} created successfully.` };
}

const updateWindowSchema = z.object({
    day: z.coerce.number(),
    message: z.string().min(1, "Message cannot be empty"),
    imageUrl: z.string().url("Must be a valid URL"),
    manualState: z.enum(["default", "unlocked", "locked"]),
})

export async function updateWindow(prevState: any, formData: FormData) {
    const validatedFields = updateWindowSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { day, ...data } = validatedFields.data;
    
    try {
        await dbUpdateWindow(day, data as Partial<CalendarWindow>);
        revalidatePath("/admin/windows");
        revalidatePath("/");
        return { message: `Window for day ${day} updated.` };
    } catch (error) {
        return { message: "Failed to update window." };
    }
}
