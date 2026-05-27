import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { LeadForm }     from "@/components/leads/LeadForm";

export const metadata: Metadata = { title: "ליד חדש" };

export default async function NewLeadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/leads" className="hover:text-foreground transition-colors">
          לידים
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rtl-flip" />
        <span className="text-foreground font-medium">ליד חדש</span>
      </nav>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold">הוספת ליד חדש</h1>
        <p className="text-muted-foreground text-sm mt-1">
          מלא את פרטי הליד — שדות המסומנים ב-* הם חובה
        </p>
      </div>

      {/* Form */}
      <LeadForm userId={user.id} />
    </div>
  );
}
