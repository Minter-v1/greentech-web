import { SkeletonPageHeader, SkeletonTable } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/page-transition";

export default function Loading() {
  return (
    <PageTransition>
      <SkeletonPageHeader />
      <SkeletonTable rows={8} columns={6} />
    </PageTransition>
  );
}
