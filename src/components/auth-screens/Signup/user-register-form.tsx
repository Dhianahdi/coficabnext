"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff, IdCardIcon, User, Mail, Phone, Check, X, LogIn, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    const [showPassword, setShowPassword] = useState(false);

    // ✅ Sign Up with Password
    const onPasswordSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
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
            }
        } else {
            toast.error("Incorrect code, please try again.");
        }
    };

    // Ajout de la validation du mot de passe
    const validatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecialChar,
            score: [minLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length
        };
    };

    const getPasswordStrength = (score: number) => {
        if (score <= 2) return { label: "Weak", color: "bg-red-500" };
        if (score <= 4) return { label: "Medium", color: "bg-yellow-500" };
        return { label: "Strong", color: "bg-green-500" };
    };

    const passwordValidation = validatePassword(password);
    const strengthInfo = getPasswordStrength(passwordValidation.score);

    return (
        <div className={cn("grid gap-6 w-full sm:w-[120%] sm:-ml-[10%]", className)} {...props}>
        {step === 1 ? (
          <Card>
           
            <CardContent>
              <form className="grid gap-4" noValidate>
                {/* Full Name */}
                <div className="grid gap-1">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="relative">
                    <Input
                      disabled={pending || loadingProvider !== null}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="name"
                      placeholder="Enter your full name"
                      type="text"
                      required
                      className="rounded-lg border border-gray-300 focus:border-primary focus:ring-primary pl-10"
                    />
                    <IdCardIcon className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                  </div>
                </div>
      
                {/* Email */}
                <div className="grid gap-1">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Input
                      disabled={pending || loadingProvider !== null}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      id="email"
                      placeholder="Email Address"
                      type="email"
                      required
                      className="rounded-lg border border-gray-300 focus:border-primary focus:ring-primary pl-10 transition-all duration-200 hover:border-gray-400"
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                  </div>
                </div>
      
                {/* Phone Number */}
                <div className="grid gap-1">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <Input
                      disabled={pending || loadingProvider !== null}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      id="phone"
                      placeholder="Phone Number"
                      type="tel"
                      required
                      className="rounded-lg border border-gray-300 focus:border-primary focus:ring-primary pl-10 transition-all duration-200 hover:border-gray-400"
                    />
                    <Phone className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                  </div>
                </div>
      
                {/* Password with strength indicator */}
                <div className="grid gap-1">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      disabled={pending || loadingProvider !== null}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      id="password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="rounded-lg border border-gray-300 focus:border-primary focus:ring-primary pl-10 pr-10 transition-all duration-200 hover:border-gray-400"
                    />
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 space-y-2">
                      <Progress value={passwordValidation.score * 20} className="h-2" />
                      <p className="text-sm text-gray-600">
                        Password strength: <span className={`font-medium ${strengthInfo.color.replace('bg-', 'text-')}`}>{strengthInfo.label}</span>
                      </p>
                      <ul className="text-xs space-y-1 text-gray-500">
                        <li className={passwordValidation.minLength ? "text-green-500" : ""}>
                          {passwordValidation.minLength ? <Check size={12} className="inline" /> : <X size={12} className="inline" />} Minimum 8 characters
                        </li>
                        <li className={passwordValidation.hasUpperCase ? "text-green-500" : ""}>
                          {passwordValidation.hasUpperCase ? <Check size={12} className="inline" /> : <X size={12} className="inline" />} One uppercase letter
                        </li>
                        <li className={passwordValidation.hasLowerCase ? "text-green-500" : ""}>
                          {passwordValidation.hasLowerCase ? <Check size={12} className="inline" /> : <X size={12} className="inline" />} One lowercase letter
                        </li>
                        <li className={passwordValidation.hasNumber ? "text-green-500" : ""}>
                          {passwordValidation.hasNumber ? <Check size={12} className="inline" /> : <X size={12} className="inline" />} One number
                        </li>
                        <li className={passwordValidation.hasSpecialChar ? "text-green-500" : ""}>
                          {passwordValidation.hasSpecialChar ? <Check size={12} className="inline" /> : <X size={12} className="inline" />} One special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
      
                {/* Confirm Password */}
                <div className="grid gap-1">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      disabled={pending || loadingProvider !== null}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="rounded-lg border border-gray-300 focus:border-primary focus:ring-primary pl-10 pr-10 transition-all duration-200 hover:border-gray-400"
                    />
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
      
                {/* Send Code Button */}
                <Button
                  onClick={handleSendMail}
                  className="w-full bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300"
                  disabled={pending || !passwordValidation.minLength || !passwordValidation.hasUpperCase || !passwordValidation.hasLowerCase || !passwordValidation.hasNumber || !passwordValidation.hasSpecialChar}
                >
                  {pending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          // Step 2: Code Verification
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold text-center text-gray-900">Code Verification</h2>
            <p className="text-sm text-gray-500 text-center">
              A code has been sent to <strong>{email}</strong>. Please enter it below.
            </p>
      
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
      
            <Button
              onClick={handleVerifyCode}
              className="w-full bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300"
            >
              Verify
            </Button>
          </div>
        )}
      
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or
            </span>
          </div>
        </div>
      
        {/* Google Sign Up Button */}
        <Button
          disabled={pending || loadingProvider !== null}
          onClick={() => handleProviderSignUp("google")}
          variant="outline"
          type="button"
          className="w-full rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-300"
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