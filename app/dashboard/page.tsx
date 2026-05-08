import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Total sessions", "128"],
          ["Top phrase", "I NEED HELP"],
          ["Unknown words logged", "14"],
          ["Flagged signs", "3"],
          ["Accessibility score", "94%"],
          ["Avg response time", "1.2s"],
        ].map(([title, value]) => (
          <Card key={title}>
            <p className="text-sm text-white/60">{title}</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">{value}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
