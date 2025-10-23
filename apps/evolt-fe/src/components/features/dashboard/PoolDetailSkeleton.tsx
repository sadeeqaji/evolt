import React from "react";
import { BackButton } from "@evolt/components/common/BackButton";

const PoolDetailSkeleton = () => (
  <div className="mt-10 w-full max-w-2xl m-auto space-y-5">
    <div>
      <BackButton />
    </div>
    <div className="space-y-6 animate-pulse">
      <div className="h-[600px] rounded-2xl bg-muted/50 border border-border" />
      <div className="h-14 rounded-full bg-muted/50 border border-border w-full max-w-md mx-auto" />
    </div>
  </div>
);

export default PoolDetailSkeleton;
