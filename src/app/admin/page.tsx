
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Spravovat Uživatele</CardTitle>
            <CardDescription>
              Vytvářejte a spravujte uživatelské účty pro vaši aplikaci.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="accent">
              <Link href="/admin/users">
                Přejít na správu uživatelů <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings /> Spravovat Okénka</CardTitle>
            <CardDescription>
              Upravujte obsah a stav adventních okének.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="accent">
              <Link href="/admin/windows">
                Přejít na správu okének <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
