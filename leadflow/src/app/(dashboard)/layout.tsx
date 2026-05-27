import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar }  from "@/components/layout/Sidebar";
import { TopBar }   from "@/components/layout/TopBar";
import { ShortcutsProvider } from "@/hooks/useKeyboardShortcuts";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6 page-enter">
            {/* ShortcutsProvider mounts once — enables ⌘N, ⌘K, G→L etc. */}
            <ShortcutsProvider>
              {children}
            </ShortcutsProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
