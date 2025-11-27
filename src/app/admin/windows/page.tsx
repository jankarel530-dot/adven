
import WindowManagement from "@/components/admin/window-management";
import { getWindows } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function WindowsPage() {
    const windows = await getWindows();

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Spravovat Okénka</h1>
            <WindowManagement windows={windows} />
        </div>
    );
}
