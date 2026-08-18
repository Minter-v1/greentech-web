import { SkeletonCard, SkeletonPageHeader } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/page-transition";

export default function EmployeeDetailLoading() {
  return (
    <PageTransition>
      <SkeletonPageHeader />
      <div className="grid gap-md xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SkeletonCard lines={6} />
        </div>
        <SkeletonCard lines={4} />
      </div>
      <div className="mt-lg grid gap-md xl:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </PageTransition>
  );
}
