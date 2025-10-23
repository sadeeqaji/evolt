import React from "react";
import { WithDrawCard } from "./StackingCard";

export function WithdrawContent() {
  return (
    <div>
      <WithDrawCard
        name="Dangote Rice Mill"
        totalValueLocked="45.00 USDT"
        totalValueLockedSmall="0.00000001345"
        totalEarnings="38.13 USDT"
        totalEarningsSmall="0.0000002345"
      />
    </div>
  );
}

export default WithdrawContent;
