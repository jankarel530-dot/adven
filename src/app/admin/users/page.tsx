
import { getUsers } from "@/lib/data";
import UserManagement from "@/components/admin/user-management";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Spravovat Uživatele</h1>
      <UserManagement users={users} />
    </div>
  );
}
