"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";
import { Label } from "@evolt/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@evolt/components/ui/card";
import apiClient from "@evolt/lib/apiClient";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToastId = toast.loading("Logging in...");

    try {
      const response = await apiClient.post(
        "/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      const { token, role } = response.data.data;

      if (token && role === "admin") {
        sessionStorage.setItem("adminAccessToken", token);
        toast.success("Login successful!", { id: loadingToastId });

        location.href = "/admin";
      } else {
        throw new Error("Invalid credentials or role.");
      }
    } catch (error: any) {
      console.error("Admin login failed:", error);
      toast.error(error.response?.data?.message || "Login failed.", {
        id: loadingToastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
