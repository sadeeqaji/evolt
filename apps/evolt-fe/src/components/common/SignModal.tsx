"use client";

import { Dialog, DialogContent } from "@evolt/components/ui/dialog";
import { Key, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@evolt/lib/apiClient";
import { Button } from "../ui/button";
import { useHWBridge } from "./HWBridgeClientProvider";

export async function authenticateUser(payload: {
  message: string;
  publicKey: string | null;
  signature: string;
  accountId: string;
}) {
  const response = await apiClient.post("/auth/verify-signature", payload);
  return response.data?.data?.token;
}

export async function getNonce(accountId: string) {
  const response = await apiClient.get(`/auth/nonce?accountId=${accountId}`);
  return response.data?.data?.nonce;
}

interface SignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
}

export function SignDialog({ open, onOpenChange, accountId }: SignDialogProps) {
  const [loading, setLoading] = useState(false);

  const { sdk, publicKey } = useHWBridge();
  const handleAuthenticate = async () => {
    try {
      setLoading(true);
      const nonce = await getNonce(accountId);
      const message = nonce;
      const signerSignature = await sdk?.signMessage(message);
      console.log({ signerSignature });

      const payload = {
        message: message,
        publicKey: publicKey,
        signature: signerSignature?.userSignature,
        accountId,
      };

      const result = await authenticateUser(payload);
      sessionStorage.setItem("accessToken", result);

      toast.success("Authenticated successfully 🎉");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-black border-none text-white max-w-2xl p-0 gap-0"
      >
        <div className="flex items-center justify-between p-8 pb-0">
          <h2 className="text-xl font-normal tracking-wide">
            SIGN IN TO Evolt
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center px-8 py-24">
          <p className="text-neutral-400 text-base mb-4">Sign message</p>
          <p className="text-white text-2xl font-light tracking-wide">
            {accountId}
          </p>
        </div>

        <div className="p-8 pt-0">
          <Button
            loading={loading}
            disabled={loading}
            onClick={handleAuthenticate}
            className="w-full bg-white text-black rounded-full py-6 px-8 flex items-center justify-center gap-3 hover:bg-neutral-100 transition-colors group"
          >
            <span className="text-xl font-normal tracking-wider">SIGN</span>
            <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
              <Key className="h-5 w-5 text-white" />
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
