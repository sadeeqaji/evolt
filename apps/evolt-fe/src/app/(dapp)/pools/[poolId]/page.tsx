import React, { Suspense } from "react";
import PoolDetailClient from "@evolt/components/features/dashboard/PoolDetailClient";
import PoolDetailSkeleton from "@evolt/components/features/dashboard/PoolDetailSkeleton";

export default async function Page(props: PageProps<"/pools/[poolId]">) {
  const { poolId } = await props.params;

  return (
    <Suspense fallback={<PoolDetailSkeleton />}>
      <PoolDetailClient poolId={poolId} />
    </Suspense>
  );
}
