import HeaderAdmin from "@evolt/components/common/HeaderAdmin";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-layout">
      <HeaderAdmin />
      <main className="p-5">{children}</main>
    </div>
  );
}
