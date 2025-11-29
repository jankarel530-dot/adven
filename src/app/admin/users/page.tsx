
'use client';

import { useCollection, useFirestore } from "@/firebase";
import UserManagement from "@/components/admin/user-management";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { User } from "@/lib/definitions";

export default function UsersPage() {
  const firestore = useFirestore();
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "users");
  }, [firestore]);

  const { data, isLoading } = useCollection<User>(usersQuery);
  const users = data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Spravovat Uživatele</h1>
      <UserManagement users={users} isLoading={isLoading} />
    </div>
  );
}
