import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";
import { LedgerId } from "@hashgraph/sdk";

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL as string;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

let sdkInstance: HashinalsWalletConnectSDK | null = null;
let initialized = false;

export async function getHashinalsSDK() {
  if (sdkInstance && initialized) return sdkInstance;

  const metadata = {
    name: "Evolt",
    description: "Evolt - Real World Assets for Africa",
    icons: [logoUrl],
    url: typeof window !== "undefined" ? window.location.href : "",
  };

  sdkInstance = HashinalsWalletConnectSDK.getInstance();
  await sdkInstance.init(projectId, metadata, LedgerId.TESTNET);
  initialized = true;

  return sdkInstance;
}
