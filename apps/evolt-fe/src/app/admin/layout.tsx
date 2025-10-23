import HeaderSME from "@evolt/components/common/HeaderSme";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="p-5">
      <HeaderSME />
      {children}
    </div>
  );
}
