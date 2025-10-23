"use client";
import React, { useEffect, useState } from "react";
import { useTokenAssociation } from "../../../hooks/useTokenAssociation";
import { AssociateTokenDialog } from "../../common/AssociateTokenModal";
import { useHWBridge } from "../../common/HWBridgeClientProvider";
import { TokenSwap } from "./swap";
import { DepositSkeleton } from "./DepositLoader";
import { StatusDisplay } from "../../common/StatusDisplay";

const tokenId = process.env.NEXT_PUBLIC_HEDERA_VUSD_TOKEN_ID!;

export default function Deposit() {
  const { accountId } = useHWBridge();
  const { isTokenAssociated, loading, error, handleAssociate } =
    useTokenAssociation(tokenId);
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
          message="Could not determine token association status. Please ensure your wallet is connected and try refreshing."
        />
      )}

      {isTokenAssociated === true && <TokenSwap />}

      {accountId && (
        <AssociateTokenDialog
          tokenId={tokenId}
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
