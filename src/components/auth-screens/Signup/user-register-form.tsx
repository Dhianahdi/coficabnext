"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function UserRegisterForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const { signIn } = useAuthActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [serverCode, setServerCode] = useState("");
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Signup, Step 2: Verification

  // Step 1: Send Verification Code
  const sendVerification = async () => {
    try {
        const response = await fetch("/api/send-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
console.log("response");  
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Verification email sent:", data);
        toast.success("Verification code sent to your email!");
    } catch (error) {
        console.error("Error sending verification email:", error);
        toast.error("Failed to send verification email.");
    }
};


  // Step 2: Verify Code and Sign Up
  const onPasswordSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (verificationCode !== serverCode) {
      toast.error("Incorrect verification code.");
      return;
    }

    setPending(true);
    try {
      await sig
      nIn("password", { name, email, password, flow: "signUp" });
      toast.success(`Welcome aboard, ${name}!`);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Signup failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-6 w-full sm:w-[120%] sm:-ml-[10%]" {...props}>
      {step === 1 ? (
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="name">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} id="name" placeholder="Enter your full name" required />
          </div>
          
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" placeholder="Enter an email address" required />
          </div>

          <Button onClick={sendVerification} disabled={pending} className="w-full">
            {pending ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onPasswordSignUp} className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} id="verificationCode" placeholder="Enter the code" required />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" placeholder="Create a password" type="password" required />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirmPassword" placeholder="Re-enter your password" type="password" required />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      )}
    </div>
  );
}
