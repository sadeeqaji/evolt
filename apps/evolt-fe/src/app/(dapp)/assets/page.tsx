import React, { Suspense } from "react";
import AssetTabsWrapper from "@evolt/components/features/dashboard/AssetTabsClient";

function LoadingFallback() {
  return (
    <div className="space-y-5">
      <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
      <div className="h-16 bg-muted rounded-full animate-pulse" />
      <div className="h-64 bg-muted rounded-2xl animate-pulse" />
    </div>
  );
}

export default function Page() {
  return (
    <div className="mt-10 w-full max-w-2xl m-auto space-y-5">
      <Suspense fallback={<LoadingFallback />}>
        <AssetTabsWrapper />
      </Suspense>
    </div>
  );
}
