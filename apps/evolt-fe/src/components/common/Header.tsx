"use client";
import { UserCircle, LogOut, Settings, User, Menu } from "lucide-react"; // Added Menu
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
    <>
      <header className="flex items-center justify-between py-4 max-w-6xl m-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          {accountId && (
            <Link
              href="/faucet"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Faucet
            </Link>
          )}
          {accountId && (
            <Link
              href="/listing"
              prefetch={true}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              List an Asset
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Connect/Profile Button */}
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

          {/* Mobile Navigation (Hamburger) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/faucet">Faucet</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/listing">List an Asset</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <SignDialog
        open={openAuthModal}
        onOpenChange={setOpenAuthModal}
        accountId={accountId!}
      />
    </>
  );
};

export default Header;
