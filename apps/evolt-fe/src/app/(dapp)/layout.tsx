import React from "react";
import { HWBridgeClientProvider } from "@evolt/components/common/HWBridgeClientProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="p-5">
      <HWBridgeClientProvider>{children}</HWBridgeClientProvider>
    </div>
  );
}
