import { SkeletonCard, SkeletonPageHeader, SkeletonStats } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/page-transition";

export default function DashboardLoading() {
  return (
    <PageTransition>
      <SkeletonPageHeader />
      <SkeletonStats />
      <div className="mt-lg grid gap-md xl:grid-cols-2">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
      </div>
    </PageTransition>
  );
}
