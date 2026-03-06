import { BrandSpinner } from "@/components/branding/brand-spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sprintdesk-background p-8">
      <div className="w-full max-w-md rounded-2xl border border-sprintdesk-border bg-white p-6 shadow-lg">
        <div className="mb-5 flex justify-center">
          <BrandSpinner size={72} />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </main>
  );
}
