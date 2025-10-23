"use client";
import { UserCircle, LogOut, Settings, User } from "lucide-react";
import Logo from "./logo";
import Link from "next/link";
import { Button } from "@evolt/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@evolt/components/ui/dropdown-menu";

import { toast } from "sonner";
import { useState } from "react";
import { SignDialog } from "./SignModal";
import { useHWBridge } from "./HWBridgeClientProvider";

const Header = () => {
  const { accountId, connect, disconnect } = useHWBridge();

  const [openAuthModal, setOpenAuthModal] = useState(false);

  const handleConnect = () => {
    toast.promise(connect(), {
      loading: "Connecting wallet...",
      success: (data) => {
        setOpenAuthModal(true);
        return `Connected 🦄`;
      },
      error: (err) => err?.message || "Failed to connect",
    });
  };

  const handleDisconnect = () => {
    toast.promise(disconnect(), {
      loading: "Disconnecting wallet...",
      success: (data) => {
        return `Disconnected 🦄`;
      },
      error: (err) => err?.message || "Failed to discountconnect",
    });
  };
  return (
    <header className="flex items-center justify-between py-4 max-w-6xl m-auto">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {!accountId ? (
          <Button onClick={handleConnect} variant="default">
            Connect Wallet
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring rounded-full">
                <div className="bg-gray-800 rounded-full p-2">
                  <UserCircle className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-300 hidden sm:block">
                  {accountId}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <SignDialog
        open={openAuthModal}
        onOpenChange={setOpenAuthModal}
        accountId={accountId!}
      />
    </header>
  );
};

export default Header;
