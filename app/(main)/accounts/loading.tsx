import { PageTransition } from "@/components/layout/page-transition";
import { SkeletonPageHeader, SkeletonTable } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageTransition>
      <SkeletonPageHeader />
      <SkeletonTable rows={5} columns={5} />
    </PageTransition>
  );
}
