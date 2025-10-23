"use client";

import { useState } from "react";
import { Button } from "@evolt/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@evolt/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@evolt/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import Logo from "./logo";
import Link from "next/link";

export default function HeaderSME() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = () => {
    // Simulate login - replace with actual authentication logic
    setIsLoggedIn(true);
    setUserEmail("user@example.com");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="max-w-6xl m-auto">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/sme-portal">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Button onClick={handleLogin}>Login</Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt={userEmail} />
                    <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:inline">
                    {userEmail}
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
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
