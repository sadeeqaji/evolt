"use client";

import React, { useState } from "react";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import { useTokenAssociation } from "@evolt/hooks/useTokenAssociation";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@evolt/lib/apiClient";
import { Button } from "@evolt/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@evolt/components/ui/card";
import { StatusDisplay } from "@evolt/components/common/StatusDisplay";
import { BackButton } from "@evolt/components/common/BackButton";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const usdcTokenId = process.env.NEXT_PUBLIC_HEDERA_USDC_TOKEN_ID!;

export default function FaucetPage() {
  const { accountId } = useHWBridge();
  const [copied, setCopied] = useState(false);

  const {
    isTokenAssociated,
    loading: assocLoading,
    error: assocError,
    handleAssociate,
  } = useTokenAssociation(usdcTokenId);

  const faucetMutation = useMutation({
    mutationFn: async () => {
      if (!accountId) throw new Error("Wallet not connected.");

      return apiClient.post("/faucet/request-usdc", {
        accountId,
        tokenId: usdcTokenId,
      });
    },
    onSuccess: (res: any) => {
      toast.success(
        res.data?.message || "Test USDC sent! It may take a moment to appear."
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to request tokens.");
    },
  });

  const handleCopy = () => {
    if (!usdcTokenId) return;
    navigator.clipboard.writeText(usdcTokenId);
    setCopied(true);
    toast.success("Token ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (!accountId) {
      return (
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDisplay
              type="info"
              message="Please connect your wallet to use the testnet faucet."
            />
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                1
              </span>
              Associate Test USDC
            </CardTitle>
            <CardDescription>
              You must associate this token ID with your wallet to receive
              funds. This is a required one-time step.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Test USDC Token ID
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-input/50 border border-input-border rounded-lg p-3 font-mono text-sm break-all">
                  {usdcTokenId || "Loading Token ID..."}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                  disabled={!usdcTokenId}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {assocLoading && (
              <Button className="w-full" loading disabled>
                Checking Association...
              </Button>
            )}

            {assocError && (
              <StatusDisplay
                type="error"
                title="Association Error"
                message={assocError}
              />
            )}

            {isTokenAssociated === true && !assocLoading && (
              <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <Check className="w-5 h-5" />
                <span className="font-medium">
                  Token is Successfully Associated
                </span>
              </div>
            )}

            {isTokenAssociated === false && !assocLoading && !assocError && (
              <Button
                onClick={handleAssociate}
                className="w-full"
                loading={assocLoading}
              >
                Associate in Wallet
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                2
              </span>
              Claim Tokens
            </CardTitle>
            <CardDescription>
              After associating, click below to receive 1000 test USDC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={() => faucetMutation.mutate()}
              loading={faucetMutation.isPending}
              disabled={isTokenAssociated !== true || faucetMutation.isPending}
            >
              {faucetMutation.isPending
                ? "Sending Tokens..."
                : "Receive 1000 Test USDC"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="mt-10 w-full max-w-2xl m-auto space-y-6 pb-20">
      <BackButton />
      <div className="text-center space-y-4">
        <Image
          src="/usdc.png"
          alt="USDC Token"
          width={80}
          height={80}
          className="mx-auto rounded-full"
        />
        <h1 className="text-4xl font-bold">Testnet USDC Faucet</h1>
        <p className="text-lg text-muted-foreground">
          Get free tokens to test the Evolt platform.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
