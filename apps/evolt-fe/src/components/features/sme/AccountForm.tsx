"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, User, Briefcase, Eye, EyeOff } from "lucide-react";
import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";
import { Label } from "@evolt/components/ui/label";
import Link from "next/link";

type AccountType = "investor" | "business";

export const AccountLogin = () => {
  const [accountType, setAccountType] = useState<AccountType>("investor");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ accountType, email, password });
  };

  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <div className=" p-6 bg-black rounded-2xl w-full">
      <div className="flex space-x-3 items-center mb-8">
        <button
          onClick={handleClick}
          className=" flex items-center justify-center w-12 h-12 rounded-full border border-input-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <h1 className="text-2xl font-semibold text-foreground">
          Account Login
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-form-label text-lg">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 bg-input border-input-border focus:border-input-focus rounded-xl text-lg placeholder:text-form-placeholder"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-form-label text-lg">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-input border-input-border rounded-xl text-lg placeholder:text-form-placeholder pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Continue
        </Button>
      </form>

      <Link
        className="text-center block text-primary hover:underline my-3"
        href="/register"
      >
        {`Don't have an account ? Register`}
      </Link>
    </div>
  );
};
