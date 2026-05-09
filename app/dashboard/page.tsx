"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function DashboardPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createSupabaseBrowser();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
          Welcome, {fullName || "User"} 👋
        </h1>

        <p className="mt-2 text-white/60">
          {email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total translations", "128"],
          ["Accuracy", "94%"],
          ["Session time", "02:43:12"],
          ["Unknown words", "14"],
          ["Top phrase", "I NEED HELP"],
          ["Emotion chart", "Happy 42%"],
          ["Fallback usage", "Semantic 18%"],
          ["AI activity", "Live"],
        ].map(([title, value]) => (
          <Card key={title} className="p-5">
            <p className="text-sm text-white/60">{title}</p>
            {loading ? (
              <LoadingSkeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-cyan-300">{value}</p>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}