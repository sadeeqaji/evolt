"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";
import { Label } from "@evolt/components/ui/label";
import Link from "next/link";

export const AccountRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {}
  );

  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength === 3 || strength === 4) return "Medium";
    return "Strong";
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirm?: string } = {};

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log({ email, password });
      // Proceed with registration
    }
  };

  return (
    <div className="p-6 bg-black rounded-2xl w-full">
      <div className="flex space-x-3 items-center mb-8">
        <button
          onClick={handleClick}
          className="flex items-center justify-center w-12 h-12 rounded-full border border-input-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <h1 className="text-2xl font-semibold text-foreground">
          Create Account
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
              className={`h-14 bg-input border-input-border rounded-xl text-lg placeholder:text-form-placeholder pr-12 ${
                errors.password ? "border-red-500" : ""
              }`}
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

          {password && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`w-3 h-3 rounded-full ${
                  passwordStrength === "Weak"
                    ? "bg-red-500"
                    : passwordStrength === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
              <span
                className={`${
                  passwordStrength === "Weak"
                    ? "text-red-500"
                    : passwordStrength === "Medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {passwordStrength} password
              </span>
            </div>
          )}
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-form-label text-lg">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="******************"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-14 bg-input border-input-border rounded-xl text-lg placeholder:text-form-placeholder pr-12 ${
                errors.confirm ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirm && (
            <p className="text-red-500 text-sm">{errors.confirm}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Register
        </Button>
      </form>

      <Link
        className="text-center block text-primary hover:underline my-3"
        href="/login"
      >
        Already have an account ? Login
      </Link>
    </div>
  );
};
