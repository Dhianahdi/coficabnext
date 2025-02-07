"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff, IdCardIcon, User, Mail, Phone, Check, X, LogIn } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

export function UserRegisterForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter();
    const { signIn } = useAuthActions();

    const [step, setStep] = useState(1); // Step 1: Form, Step 2: Code Verification
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [code, setCode] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [pending, setPending] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState<"github" | "google" | null>(null);

    // ✅ Sign Up with Password
    const onPasswordSignUp = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
console.log(name, email, password)
        setPending(true);
        try {
            await signIn("password", { name, email, password, flow: "signUp" });
            toast.success(`Welcome, ${name}!`);
        } catch (error) {
            toast.error("Invalid email or password!");
        } finally {
            setPending(false);
        }
    };

    // ✅ Sign Up via Google or Github
    const handleProviderSignUp = (provider: "github" | "google") => {
        setLoadingProvider(provider);
        signIn(provider).finally(() => setLoadingProvider(null));
    };

    // 📩 Send Verification Code via Email
    const handleSendMail = async () => {
        if (!email || !phone) {
            toast.error("Please enter a valid email and phone number.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setPending(true);
        try {
            const response = await fetch("/api/sendemail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, phone }),
            });

            const data = await response.json();

            if (response.ok) {
                setGeneratedCode(data.code); // Store the code locally
                setStep(2); // Move to verification step
                toast.success("Code sent successfully!");
            } else {
                toast.error(data.error || "Failed to send email.");
            }
        } catch (error) {
            toast.error("An error occurred while sending.");
        } finally {
            setPending(false);
        }
    };

    // ✅ Verify Code
    const handleVerifyCode = async () => {
        if (code === generatedCode.toString()) {
            toast.success("Verification successful!");
            setPending(true);
            try {
                await signIn("password", { name, email, password, flow: "signUp" });
                toast.success(`Welcome, ${name}!`);
            } catch (error) {
                toast.error("Invalid email or password!");
            } finally {
                setPending(false);
            }          //  router.push("/dashboard");
        } else {
            toast.error("Incorrect code, please try again.");
        }
    };

    return (
        <div className={cn("grid gap-6 w-full sm:w-[120%] sm:-ml-[10%]", className)} {...props}>
            {step === 1 ? (
                <form className="grid gap-4" noValidate>
                    {/* Full Name */}
                    <div className="grid gap-1">
                        <Label htmlFor="name" className="sr-only">Full Name</Label>
                        <div className="relative">
                            <Input
                                disabled={pending || loadingProvider !== null}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                id="name"
                                placeholder="Full Name"
                                type="text"
                                required
                            />
                            <IdCardIcon className="absolute inset-y-0 right-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="grid gap-1">
                        <Label htmlFor="email" className="sr-only">Email</Label>
                        <div className="relative">
                            <Input
                                disabled={pending || loadingProvider !== null}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                placeholder="Email Address"
                                type="email"
                                required
                            />
                            <Mail className="absolute inset-y-0 right-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="grid gap-1">
                        <Label htmlFor="phone" className="sr-only">Phone Number</Label>
                        <div className="relative">
                            <Input
                                disabled={pending || loadingProvider !== null}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                id="phone"
                                placeholder="Phone Number"
                                type="tel"
                                required
                            />
                            <Phone className="absolute inset-y-0 right-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid gap-1">
                        <Label htmlFor="password" className="sr-only">Password</Label>
                        <div className="relative">
                            <Input
                                disabled={pending || loadingProvider !== null}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                placeholder="Password"
                                type="password"
                                required
                            />
                            <EyeOff className="absolute inset-y-0 right-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-1">
                        <Label htmlFor="confirmPassword" className="sr-only">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                disabled={pending || loadingProvider !== null}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                type="password"
                                required
                            />
                            <EyeOff className="absolute inset-y-0 right-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Send Code Button */}
                    <Button onClick={handleSendMail} className="w-full" disabled={pending}>
                        {pending ? <Loader2 className="animate-spin" /> : "Send Code"}
                    </Button>
                </form>
            ) : (
                // Step 2: Code Verification
                <div className="grid gap-4">
                    <h2 className="text-lg font-semibold text-center">Code Verification</h2>
                    <p className="text-sm text-gray-500 text-center">
                        A code has been sent to <strong>{email}</strong>. Please enter it below.
                    </p>

                    <div className="grid gap-1">
                        <Label htmlFor="code" className="sr-only">Verification Code</Label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            id="code"
                            placeholder="Enter Code"
                            type="text"
                            required
                        />
                    </div>

                    <Button onClick={handleVerifyCode} className="w-full">
                        Verify
                    </Button>
                </div>
            )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>
               
                        <Button
                            disabled={pending || loadingProvider !== null} // Disable if pending or loadingProvider is set
                            onClick={() => handleProviderSignUp("google")}
                            variant="outline"
                            type="button"
                            className="w-full"
                        >
                            {loadingProvider === "google" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Continue with Google"
                            )}
                        </Button>
        </div>
    );
}
