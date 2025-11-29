
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getUsers,
  setUser,
  deleteUser as deleteUserFromDb,
  getWindows,
  setWindow,
  getUser,
} from "./data";
import { User, CalendarWindow } from "./definitions";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser as deleteUserFromAuth,
  signOut,
} from "firebase/auth";
import { initializeServerFirebase } from "@/firebase/server-init";
import { redirect } from "next/navigation";

const { auth } = initializeServerFirebase();

// --- AUTH ACTIONS ---

const loginSchema = z.object({
  username: z.string().email("Zadejte platný email."),
  password: z.string().min(1, "Heslo je povinné."),
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

  const { username: email, password } = validatedFields.data;

  try {
    // We don't need to do anything with the userCredential,
    // the client-side onAuthStateChanged will handle the redirect.
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Firebase sign-in error:", error.code);
    let message = "Během přihlašování došlo k chybě serveru.";
    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      message = "Neplatný email nebo heslo.";
    }
    return { message };
  }

  // The redirect will be handled by the client-side auth state listener
  // but we can revalidate paths here if needed.
  revalidatePath("/", "layout");
}

export async function logout() {
  // Client-side will handle redirect via onAuthStateChanged
}

// --- ADMIN ACTIONS ---

const userSchema = z.object({
  username: z.string().email("Uživatelské jméno musí být platný email."),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků."),
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

  const { username: email, password } = validatedFields.data;

  try {
    const { firestore } = initializeServerFirebase();
    const existingUsers = await getUsers(firestore);
    const existingUserInDb = existingUsers.find((u) => u.username === email);
    
    if (existingUserInDb) {
      return { message: "Uživatel s tímto emailem již existuje.", isError: true };
    }

    // This creates the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const authUser = userCredential.user;

    // Now create the user profile in Firestore
    const newUser: User = {
      id: authUser.uid,
      username: email,
      // We don't store the password in the database
      role: "user",
    };

    await setUser(firestore, newUser);
    revalidatePath("/admin/users");
    return {
      message: `Uživatel ${newUser.username} byl vytvořen.`,
      isError: false,
    };
  } catch (e: any) {
    console.error("Add user error:", e.code);
    let message = "Došlo k chybě při vytváření uživatele.";
    if (e.code === 'auth/email-already-in-use') {
        message = 'Tento email je již používán jiným účtem.';
    }
    return { message, isError: true };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const { firestore } = initializeServerFirebase();
    // It's not possible to delete a user from the server-side client SDK easily.
    // This action should ideally be performed by an admin SDK on a trusted server environment.
    // For this project, we will just delete the user's data from Firestore.
    // The user will still exist in Firebase Auth.
    await deleteUserFromDb(firestore, id);
    revalidatePath("/admin/users");
    return { message: `Uživatelská data byla smazána.`, isError: false };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Došlo k chybě při mazání uživatele.";
    return { message, isError: true };
  }
}

const windowSchema = z.object({
  id: z.string(),
  day: z.coerce.number().int().min(1).max(24),
  message: z.string().optional(),
  imageUrl: z
    .string()
    .url({ message: "Zadejte platnou URL adresu obrázku." })
    .or(z.literal(""))
    .optional(),
  videoUrl: z
    .string()
    .url({ message: "Zadejte platnou URL pro video." })
    .or(z.literal(""))
    .optional(),
  manualState: z.enum(["default", "unlocked", "locked"]),
});

export async function updateWindow(prevState: any, formData: FormData) {
  const day = formData.get("day");

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
    const { firestore } = initializeServerFirebase();
    const windows = await getWindows(firestore);
    const windowToUpdate = windows.find(
      (w) => w.id === validatedFields.data.id
    );

    if (!windowToUpdate) {
      throw new Error(`Window with id ${validatedFields.data.id} not found.`);
    }

    const updatedWindow: CalendarWindow = {
      ...windowToUpdate,
      ...validatedFields.data,
      message: validatedFields.data.message ?? "",
      imageUrl: validatedFields.data.imageUrl ?? "",
      videoUrl: validatedFields.data.videoUrl ?? "",
    };

    await setWindow(firestore, updatedWindow);

    revalidatePath("/admin/windows");
    revalidatePath("/");

    return {
      message: `Okénko ${day} bylo úspěšně aktualizováno.`,
      isError: false,
    };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : `Došlo k chybě při úpravě okénka ${day}.`;
    return { message, isError: true };
  }
}
