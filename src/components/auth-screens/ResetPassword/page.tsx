"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff, Mail, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

export function ResetPassword({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter();
    const { signIn } = useAuthActions();

    const [step, setStep] = useState<"forgot" | "verify">("forgot"); // Step 1: Forgot Password, Step 2: Verify Code
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 📩 Send Reset Code
    const handleSendResetCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setPending(true);
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("flow", "reset");

            await signIn("password", formData);
            setStep("verify"); // Move to verification step
            toast.success("Reset code sent successfully!");
        } catch (error) {
            toast.error("Failed to send reset code. Please try again.");
        } finally {
            setPending(false);
        }
    };

    // ✅ Verify Code and Reset Password
    const handleVerifyAndReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setPending(true);
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("code", code);
            formData.append("newPassword", newPassword);
            formData.append("flow", "reset-verification");

            await signIn("password", formData);
            toast.success("Password reset successfully!");
            router.push("/login"); // Redirect to login page
        } catch (error) {
            toast.error("Failed to reset password. Please try again.");
        } finally {
            setPending(false);
        }
    };

    return (
        <div className={cn("grid gap-6 w-full sm:w-[120%] sm:-ml-[10%]", className)} {...props}>
            {step === "forgot" ? (
                // Step 1: Forgot Password
                <form className="grid gap-4" onSubmit={handleSendResetCode}>
                    <p className="text-sm text-gray-500 text-center">
                       receive a reset code.
                    </p>

                    {/* Email */}
                    <div className="grid gap-1">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                        <div className="relative">
                            <Input
                                disabled={pending}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                placeholder="Email Address"
                                type="email"
                                required
                                className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
                            />
                            <Mail className="absolute inset-y-0 right-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Send Code Button */}
                    <Button
                        type="submit"
                        className="w-full bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300"
                        disabled={pending}
                    >
                        {pending ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
                    </Button>
                </form>
            ) : (
                // Step 2: Verify Code and Reset Password
                <form className="grid gap-4" onSubmit={handleVerifyAndReset}>
                    <h2 className="text-lg font-semibold text-center text-gray-900">Reset Password</h2>
                    <p className="text-sm text-gray-500 text-center">
                        A reset code has been sent to <strong>{email}</strong>. Please enter it below.
                    </p>

                    {/* Verification Code */}
                    <div className="grid gap-1">
                        <Label htmlFor="code" className="text-sm font-medium text-gray-700">Verification Code</Label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            id="code"
                            placeholder="Enter Code"
                            type="text"
                            required
                            className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
                        />
                    </div>

                    {/* New Password */}
                    <div className="grid gap-1">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                        <div className="relative">
                            <Input
                                disabled={pending}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                id="newPassword"
                                placeholder="New Password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-1">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                disabled={pending}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Reset Password Button */}
                    <Button
                        type="submit"
                        className="w-full bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300"
                        disabled={pending}
                    >
                        {pending ? <Loader2 className="animate-spin" /> : "Reset Password"}
                    </Button>
                </form>
            )}
        </div>
    );
}