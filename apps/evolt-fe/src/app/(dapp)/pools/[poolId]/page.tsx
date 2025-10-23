import React, { Suspense } from "react";
import PoolDetailClient from "@evolt/components/features/dashboard/PoolDetailClient";
import PoolDetailSkeleton from "@evolt/components/features/dashboard/PoolDetailSkeleton";

interface PageProps {
  params: {
    poolId: string;
  };
}

export default function Page({ params }: PageProps) {
  const { poolId } = params;

  return (
    <Suspense fallback={<PoolDetailSkeleton />}>
      <PoolDetailClient poolId={poolId} />
    </Suspense>
  );
}
