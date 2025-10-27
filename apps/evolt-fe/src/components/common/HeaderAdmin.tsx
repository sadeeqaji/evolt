"use client";
import { UserCircle, Settings, User, Menu, LogOut } from "lucide-react";
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
import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@evolt/lib/adminApiClient";
const HeaderAdmin = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleAdminLogout = async () => {
    const token = sessionStorage.getItem("adminAccessToken");
    const loadingToastId = toast.loading("Logging out...");
    try {
      await apiClient.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      sessionStorage.removeItem("adminAccessToken");

      toast.success("Logout successful!", { id: loadingToastId });

      location.href = "/admin/login";
    } catch (error: any) {
      console.error("Admin logout failed:", error);
      toast.error(error.response?.data?.message || "Logout failed.", {
        id: loadingToastId,
      });
    }
  };

  return (
    <header className="flex items-center justify-between py-4 max-w-6xl m-auto">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-4 lg:gap-6">
        <Link
          href="/faucet"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Faucet
        </Link>
        <Link
          href="/listing"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          List an Asset
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        {/* Profile Button (Placeholder for future auth) */}
        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring rounded-full">
              <div className="bg-gray-800 rounded-full p-2">
                <UserCircle className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-300 hidden sm:block">
                User
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleAdminLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
  );
};

export default HeaderAdmin;
