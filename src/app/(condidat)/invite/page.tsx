"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [formStep, setFormStep] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const updateUserDepartmentAndStatus = useMutation(api.mutations.user.updateUserDepartmentAndStatus);

  const { signIn } = useAuthActions();

  // Vérification de la force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "Weak", color: "bg-red-500" };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 1) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Medium", color: "bg-yellow-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleCompleteRegistration = async () => {
    if (!name || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    if (!email) {
      toast.error("Invalid email.");
      return;
    }

    setIsLoading(true);

    try {
      await signIn("password", {
        email,
        name,
        password,
        flow: "signUp",
      });
      await updateUserDepartmentAndStatus({ email });

      setFormStep(1); // Passer à l'étape de succès
      
      // Rediriger après un court délai pour montrer l'animation de succès
      setTimeout(() => {
        toast.success("Registration completed successfully!");
        router.push("/");
      }, 2000);
      
    } catch (error:any) {
      toast.error(error.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col items-center justify-center p-6">
      {/* Logo en haut */}
      <div className="mb-8 w-32 h-32 relative animate-fade-in-down">
        <Image
          src="/logo-black.svg"
          alt="COFICAB"
          layout="fill"
          className="block dark:hidden "
        />
        <Image
          src="/logo-white.png"
          alt="COFICAB"
          layout="fill"
          className="hidden dark:block "
        />
      </div>
      
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 animate-slide-in-right">
        {formStep === 0 ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                Complete Your Registration
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                Welcome to COFICAB! Please fill in the details below to complete your registration.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={email || ""}
                    disabled
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 pl-10"
                  />
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="rounded-lg border border-gray-300 dark:border-gray-700 focus:border-black focus:ring-black pl-10 transition-all duration-200 hover:border-gray-400"
                  />
                  <User className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="rounded-lg border border-gray-300 dark:border-gray-700 focus:border-black focus:ring-black pl-10 pr-10 transition-all duration-200 hover:border-gray-400"
                  />
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Password strength:</span>
                      <span className="text-xs font-medium">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="rounded-lg border border-gray-300 dark:border-gray-700 focus:border-black focus:ring-black pl-10 pr-10 transition-all duration-200 hover:border-gray-400"
                  />
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <Button
                onClick={handleCompleteRegistration}
                disabled={isLoading}
                className="w-full bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Completing Registration...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-800 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/signin" className="text-black dark:text-white font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              Your account has been created successfully. Redirecting you to the dashboard...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full animate-progress"></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}