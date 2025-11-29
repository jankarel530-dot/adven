
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  setWindow,
  getUserByUsername,
  getUsers,
  setUser,
} from './data';
import { CalendarWindow, User } from './definitions';
import { initializeServerFirebase } from '@/firebase/server-init';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

// This is a temporary solution for the simplified login.
// In a real app, you would not have a hardcoded "session" like this.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = 'session';

// --- AUTH ACTIONS ---

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  revalidatePath('/', 'layout');
  redirect('/');
}

// --- ADMIN ACTIONS ---

const userSchema = z.object({
  username: z.string().min(3, "Uživatelské jméno musí mít alespoň 3 znaky."),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků.'),
});

export async function addUser(prevState: any, formData: FormData) {
   const validatedFields = userSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Chybně vyplněné údaje.',
      isError: true,
    };
  }
  
  const { username, password } = validatedFields.data;


  try {
    const { firestore } = initializeServerFirebase();
    const existingUser = await getUserByUsername(firestore, username);
    
    if (existingUser) {
      return { message: 'Uživatel s tímto jménem již existuje.', isError: true };
    }

    // In a real app you'd hash the password.
    // Here we just create the user data structure.
     const newUser: Omit<User, 'id'> = {
      username: username,
      role: 'user',
      password: password, // This is just for the data structure, not for secure storage
    };

    await setUser(firestore, newUser);

    revalidatePath('/admin/users');
    return {
      message: `Uživatel ${username} byl vytvořen.`,
      isError: false,
    };
  } catch (e: any) {
    console.error("Add user error:", e);
    return { message: 'Došlo k chybě při vytváření uživatele.', isError: true };
  }
}

export async function deleteUserAction(id: string) {
  // This is a placeholder as deleting users is complex with our simple auth
  console.log('Attempted to delete user:', id);
  revalidatePath('/admin/users');
  return { message: `Mazání uživatelů je v tomto režimu deaktivováno.`, isError: true };
}

const windowSchema = z.object({
  id: z.string(),
  day: z.coerce.number().int().min(1).max(24),
  message: z.string().optional(),
  imageUrl: z
    .string()
    .url({ message: 'Zadejte platnou URL adresu obrázku.' })
    .or(z.literal(''))
    .optional(),
  videoUrl: z
    .string()
    .url({ message: 'Zadejte platnou URL pro video.' })
    .or(z.literal(''))
    .optional(),
  manualState: z.enum(['default', 'unlocked', 'locked']),
});

export async function updateWindow(prevState: any, formData: FormData) {
  const day = formData.get('day');

  const validatedFields = windowSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Chybně vyplněné údaje.',
      isError: true,
    };
  }

  try {
    const { firestore } = initializeServerFirebase();
    
    const updatedWindow: Partial<CalendarWindow> = {
        ...validatedFields.data,
        message: validatedFields.data.message ?? '',
        imageUrl: validatedFields.data.imageUrl ?? '',
        videoUrl: validatedFields.data.videoUrl ?? '',
    };
    
    await setWindow(firestore, updatedWindow as CalendarWindow);

    revalidatePath('/admin/windows');
    revalidatePath('/');

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
