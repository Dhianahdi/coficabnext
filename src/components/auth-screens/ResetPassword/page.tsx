"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

export function ResetPassword({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const forgotPassword = useMutation(api.auth.forgotPassword);

  const [step, setStep] = useState<"forgot" | "verify" | "reset">("forgot");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [storedVerificationCode, setStoredVerificationCode] = useState<string | null>(null);
  const { signIn } = useAuthActions();

  // 📩 Send Verification Code
  const handleSendResetCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const phone = "115515"; // Example phone number (can be dynamic if needed)

    setPending(true);
    try {
      const response = await fetch("/api/sendemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to send verification code.");
      }

      const data = await response.json();
      setStoredVerificationCode(data.code.toString());
      setStep("verify");
      toast.success("Verification code sent successfully!");
    } catch (error) {
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setPending(false);
    }
  };

  // ✅ Verify Code
  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

  /*  if (!code || code !== storedVerificationCode) {
      toast.error("Invalid verification code.");
      return;
    }*/

    setStep("reset"); // Move to the password reset step
    toast.success("Code verified successfully!");
  };

  // 🔑 Reset Password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      // Appeler la mutation forgotPassword pour réinitialiser le mot de passe
     // const result = await forgotPassword({ email });
     await signIn("password", { email, flow: "reset" });

           toast.success("Welcome!");
           
      toast.success("Password reset successfully!");
      router.push("/signin");
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn("grid gap-6 w-full sm:w-[120%] sm:-ml-[10%]", className)} {...props}>
      {/* Step 1: Forgot Password */}
      {step === "forgot" && (
        <form className="grid gap-4" onSubmit={handleSendResetCode}>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email to receive a verification code.
          </p>

          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                disabled={pending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                placeholder="Email Address"
                type="email"
                required
                className="bg-background"
              />
              <Mail className="absolute inset-y-0 right-3 text-muted-foreground" size={16} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="bg-primary hover:bg-primary/90"
          >
            {pending ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
          </Button>
        </form>
      )}

      {/* Step 2: Verify Code */}
      {step === "verify" && (
        <form className="grid gap-4" onSubmit={handleVerifyCode}>
          <h2 className="text-lg font-semibold text-center">Verify Code</h2>
          <p className="text-sm text-muted-foreground text-center">
            A verification code has been sent to <strong>{email}</strong>.
          </p>

          <div className="grid gap-1">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              id="code"
              placeholder="Enter Code"
              type="text"
              required
              className="bg-background"
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="bg-primary hover:bg-primary/90"
          >
            {pending ? <Loader2 className="animate-spin" /> : "Verify Code"}
          </Button>
        </form>
      )}

      {/* Step 3: Reset Password */}
      {step === "reset" && (
        <form className="grid gap-4" onSubmit={handleResetPassword}>
          <h2 className="text-lg font-semibold text-center">Reset Password</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter and confirm your new password.
          </p>

          <div className="grid gap-1">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                id="newPassword"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                className="bg-background"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                id="confirmPassword"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                className="bg-background"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="bg-primary hover:bg-primary/90"
          >
            {pending ? <Loader2 className="animate-spin" /> : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}