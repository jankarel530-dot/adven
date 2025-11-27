"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { findUserByUsername, addUser as dbAddUser, updateWindow as dbUpdateWindow, deleteUser as dbDeleteUser, initializeData } from "./data";
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

    cookies().set("session", user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // One week
      path: "/",
    });
  } catch (error) {
    console.error("Login error:", error);
    return { message: "An unexpected error occurred during login." };
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
      message: "Validation failed."
    };
  }

  const { username, password } = validatedFields.data;
  
  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return { message: "Username already exists", errors: { username: ["Username already taken"] } };
    }

    await dbAddUser({ username, password });
    revalidatePath("/admin/users");
    return { message: `User ${username} created successfully.` };
  } catch (error) {
    console.error("Add user error:", error);
    return { message: "Failed to create user.", errors: {} };
  }
}

export async function deleteUserAction(id: string) {
    try {
      const error = await dbDeleteUser(id);
      if (error) {
          return { message: error.message, isError: true };
      }
      revalidatePath('/admin/users');
      return { message: 'User deleted successfully.', isError: false };
    } catch (error) {
       console.error("Delete user error:", error);
       return { message: 'Failed to delete user.', isError: true };
    }
}


const updateWindowSchema = z.object({
    day: z.coerce.number(),
    message: z.string().min(1, "Message cannot be empty"),
    imageUrl: z.string().url("Must be a valid URL if provided").optional().or(z.literal('')),
    videoUrl: z.string().url("Must be a valid URL if provided").optional().or(z.literal('')),
    manualState: z.enum(["default", "unlocked", "locked"]),
})

export async function updateWindow(prevState: any, formData: FormData) {
    const validatedFields = updateWindowSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed."
        };
    }
    
    const { day, ...data } = validatedFields.data;
    
    try {
        await dbUpdateWindow(day, data as Partial<CalendarWindow>);
        revalidatePath("/admin/windows");
        revalidatePath("/");
        return { message: `Window for day ${day} updated.` };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Update window error:", error);
        return { message: `Failed to update window: ${errorMessage}` };
    }
}


export async function initializeDatabaseAction() {
    try {
      await initializeData();
      revalidatePath('/admin', 'layout');
      revalidatePath('/', 'layout');
      return { success: true };
    } catch(e) {
      console.error(e);
      return { success: false };
    }
}
