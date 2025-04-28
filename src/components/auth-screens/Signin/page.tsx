"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export function UserAuthForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { signIn } = useAuthActions();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const [loadingProvider, setLoadingProvider] = useState<"github" | "google" | null>(null);

    const router = useRouter();

    const onPasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);
        try {
            await signIn("password", { email, password, flow: "signIn" });
            toast.success("Welcome!");
        } catch (error) {
            toast.error("Invalid email or password");
        } finally {
            setPending(false);
        }
    };

    const handleProviderSignIn = (provider: "github" | "google") => {
        setLoadingProvider(provider);
        signIn(provider)
            .finally(() => {
                setLoadingProvider(null);
            });
    };

    return (
        <div
            className={cn(
                "grid gap-6 w-full sm:w-[120%] sm:-ml-[10%]",
                className
            )}
            {...props}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Sign In with Email</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account and continue your work.
                    </CardDescription>
                </CardHeader>

                <form
                    onSubmit={onPasswordSignIn}
                    className="grid gap-1"
                    noValidate
                >
                    <CardContent className="space-y-3">
                        <div className="space-y-4 w-full">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email
                            </Label>
                            <div className="relative">
                                <Input
                                    disabled={pending || loadingProvider !== null}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    id="email"
                                    placeholder="Enter your email address"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="rounded-lg border border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary pl-10 transition-all duration-200 hover:border-gray-400"
                                />
                                <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lock className="h-4 w-4" /> Mot de passe
                            </Label>
                            <div className="relative">
                                <Input
                                    disabled={pending || loadingProvider !== null}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    id="password"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="rounded-lg border border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary pl-10 pr-10 transition-all duration-200 hover:border-gray-400"
                                />
                                <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} strokeWidth={2} className="text-muted-foreground/80" />
                                    ) : (
                                        <Eye size={16} strokeWidth={2} className="text-muted-foreground/80" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            disabled={pending || loadingProvider !== null}
                            className="w-full"
                            type="submit"
                        >
                            {pending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

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
                disabled={pending || loadingProvider !== null}
                onClick={() => handleProviderSignIn("google")}
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
