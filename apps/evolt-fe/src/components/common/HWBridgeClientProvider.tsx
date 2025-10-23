"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Header from "@evolt/components/common/Header";
import PageLoader from "./PageLoader";
import { getHashinalsSDK } from "@evolt/lib/hashinalsClient";
import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";

interface HWBridgeContextType {
  sdk: HashinalsWalletConnectSDK | null;
  accountId: string | null;
  publicKey: string | null;
  connect: () => Promise<{
    accountId: string | null;
    publicKey: string | null;
  }>;
  disconnect: () => Promise<void>;
}

const HWBridgeContext = createContext<HWBridgeContextType | undefined>(
  undefined
);

export function HWBridgeClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sdk, setSdk] = useState<HashinalsWalletConnectSDK | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const instance = await getHashinalsSDK();
        if (!mounted) return;
        setSdk(instance);

        const storedAccountId = localStorage.getItem("connectedAccountId");
        const storedPublicKey = localStorage.getItem("connectedPublicKey");

        if (storedAccountId) setAccountId(storedAccountId);
        if (storedPublicKey) setPublicKey(storedPublicKey);
      } catch (err) {
        console.error("Failed to initialize Hashinals SDK:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const extractAccountId = (session: any): string | null => {
    const accounts = session?.namespaces?.hedera?.accounts;
    return accounts?.length ? accounts[0].split(":").pop() || null : null;
  };

  const connect = useCallback(async () => {
    if (!sdk) return { accountId: null, publicKey: null };

    try {
      const connectedAccount = await sdk.connect();
      const id = extractAccountId(connectedAccount);
      const pubKey = connectedAccount?.sessionProperties?.publicKey || null;

      if (id) {
        localStorage.setItem("connectedAccountId", id);
        setAccountId(id);
      }

      if (pubKey) {
        localStorage.setItem("connectedPublicKey", pubKey);
        setPublicKey(pubKey);
      }

      return { accountId: id, publicKey: pubKey };
    } catch (err) {
      console.error("Connection failed:", err);
      return { accountId: null, publicKey: null };
    }
  }, [sdk]);

  const disconnect = useCallback(async () => {
    if (!sdk) return;
    try {
      await sdk.disconnect();
    } catch (err) {
      console.error("⚠️ SDK disconnect failed:", err);
    } finally {
      localStorage.removeItem("connectedAccountId");
      localStorage.removeItem("connectedPublicKey");
      setAccountId(null);
      setPublicKey(null);
    }
  }, [sdk]);

  if (loading) return <PageLoader />;

  return (
    <HWBridgeContext.Provider
      value={{ sdk, accountId, publicKey, connect, disconnect }}
    >
      <Header />
      {children}
    </HWBridgeContext.Provider>
  );
}

export function useHWBridge() {
  const context = useContext(HWBridgeContext);
  if (!context) {
    throw new Error("useHWBridge must be used within HWBridgeClientProvider");
  }
  return context;
}
