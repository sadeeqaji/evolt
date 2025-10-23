import { Dialog, DialogContent } from "@evolt/components/ui/dialog";
import { Coins, Link2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@evolt/components/ui/button";
import { useTokenAssociation } from "@evolt/hooks/useTokenAssociation";

interface AssociateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  tokenId: string;
  loading: boolean;
  onAssociate?: () => Promise<void>;
}

export function AssociateTokenDialog({
  open,
  onOpenChange,
  accountId,
  tokenId,
  onAssociate,
  loading,
}: AssociateTokenDialogProps) {
  const handleAssociate = async () => {
    try {
      if (onAssociate) {
        await onAssociate();
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0 gap-0 border-0 bg-transparent overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 animate-glow-pulse blur-3xl" />

        {/* Main content container */}
        <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-2xl animate-scale-in">
          {/* Holographic border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-holographic opacity-20 blur-sm" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-8 pb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-glow-pulse" />
                <div className="relative h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-primary-foreground to-primary-foreground/70 bg-clip-text text-transparent">
                ASSOCIATE TOKEN
              </h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-10 w-10 rounded-full bg-muted/50 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-all duration-300 hover:scale-110 border border-border/50"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="relative flex flex-col items-center justify-center px-8 py-16 space-y-8">
            {/* Animated icon */}
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-holographic opacity-30 rounded-full blur-2xl animate-glow-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-holographic flex items-center justify-center shadow-2xl border-4 border-primary/30">
                <Coins className="h-12 w-12 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-secondary animate-glow-pulse" />
              </div>
            </div>

            {/* Info text */}
            <div className="text-center space-y-4 max-w-lg">
              <p className="text-muted-foreground text-sm uppercase tracking-wider">
                Link token to account
              </p>

              {/* Account ID */}
              <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  Account
                </p>
                <p className="text-primary-foreground text-lg font-mono tracking-wide break-all">
                  {accountId}
                </p>
              </div>

              {/* Token ID */}
              <div className="bg-gradient-primary/10 backdrop-blur-sm rounded-xl p-4 border border-primary/30 shadow-lg">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  Token ID
                </p>
                <p className="text-primary text-xl font-mono font-semibold tracking-wide break-all">
                  {tokenId}
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="relative p-8 pt-0">
            <Button
              onClick={handleAssociate}
              disabled={loading}
              className="w-full h-16 bg-black text-white rounded-2xl font-bold text-lg tracking-wider hover:bg-black/90 transition-all duration-300 shadow-2xl border-0 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>ASSOCIATING...</span>
                  </>
                ) : (
                  <>
                    <span>LINK TOKEN</span>
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all">
                      <Link2 className="h-5 w-5" />
                    </div>
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
