import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4">
        <LoadingSkeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <LoadingSkeleton className="h-72 w-full" />
          <LoadingSkeleton className="h-72 w-full" />
          <LoadingSkeleton className="h-72 w-full" />
        </div>
      </div>
    </main>
  );
}
