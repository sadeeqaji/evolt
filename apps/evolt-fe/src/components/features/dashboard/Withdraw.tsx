"use client";

import React, { useEffect, useState } from "react";
// Switched to relative paths based on Withdraw.tsx location
import { useTokenAssociation } from "../../../hooks/useTokenAssociation";
import { AssociateTokenDialog } from "../../common/AssociateTokenModal";
import { useHWBridge } from "../../common/HWBridgeClientProvider";
import { TokenWithdraw } from "./swap/Withdraw/index"; // Corrected path to index.tsx within Withdraw folder
import { DepositSkeleton } from "./DepositLoader";
import { StatusDisplay } from "../../common/StatusDisplay"; // Use relative path

const usdcTokenId = process.env.NEXT_PUBLIC_HEDERA_USDC_TOKEN_ID!;

export default function Withdraw() {
  const { accountId } = useHWBridge();
  const { isTokenAssociated, loading, error, handleAssociate } =
    useTokenAssociation(usdcTokenId);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isTokenAssociated === false && accountId) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isTokenAssociated, accountId]);

  return (
    <div className="space-y-3">
      {loading && <DepositSkeleton />}

      {error && !loading && (
        <StatusDisplay type="error" title="Association Error" message={error} />
      )}

      {isTokenAssociated === null && !loading && !error && (
        <StatusDisplay
          type="warning"
          title="Wallet Status Unknown"
          message="Could not determine token association status for USDC. Please ensure your wallet is connected and try refreshing."
        />
      )}

      {isTokenAssociated === true && <TokenWithdraw />}

      {accountId && (
        <AssociateTokenDialog
          tokenId={usdcTokenId}
          accountId={accountId}
          open={open}
          loading={loading}
          onOpenChange={setOpen}
          onAssociate={handleAssociate}
        />
      )}
    </div>
  );
}
