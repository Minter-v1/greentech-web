import { SkeletonPageHeader, SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/page-transition";

export default function AttendanceLoading() {
  return (
    <PageTransition>
      <SkeletonPageHeader />
      <SkeletonStats />
      <div className="mt-lg">
        <SkeletonTable rows={8} columns={7} />
      </div>
    </PageTransition>
  );
}
