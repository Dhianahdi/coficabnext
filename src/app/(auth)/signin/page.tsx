"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/auth-screens/Signin/page";
import { ResetPassword } from "@/components/auth-screens/ResetPassword/page";

export default function AuthenticationPage() {
    const [showResetPassword, setShowResetPassword] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hidden for small screens */}
            <div className="md:hidden flex justify-center">
                <div className="w-1/2">
                    {/* Light Mode Logo */}
                    <Image
                        src="/logo-black.svg"
                        layout="responsive"
                        width={400}
                        height={400}
                        alt="Authentication"
                        className="block dark:hidden rounded-full object-cover"
                    />
                    {/* Dark Mode Logo */}
                    <Image
                        src="/logo-white.png"
                        layout="responsive"
                        width={400}
                        height={400}
                        alt="Authentication"
                        className="hidden dark:block rounded-full object-cover"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container relative flex flex-1 flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <Link
                    href="/signup"
                    className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "my-6 md:my-0 md:absolute md:right-8 md:top-8 flex justify-center"
                    )}
                >
                    Sign Up
                </Link>

                {/* Left Panel */}
                <div className="relative hidden h-full flex-col items-center justify-center p-10 lg:flex dark:border-r">
                    <div className="w-1/2">
                        {/* Light Mode Logo */}
                        <Image
                            src="/logo-black.svg"
                            layout="responsive"
                            width={200}
                            height={200}
                            alt="Authentication"
                            className="block dark:hidden rounded-full object-cover mb-4"
                        />
                        {/* Dark Mode Logo */}
                        <Image
                            src="/logo-white.png"
                            layout="responsive"
                            width={200}
                            height={200}
                            alt="Authentication"
                            className="hidden dark:block rounded-full object-cover mb-4"
                        />
                    </div>
                    <p className="text-center text-lg font-medium">
                        Welcome to COFICAB’s portal. Sign in to access your account and explore our latest updates and resources.
                    </p>
                </div>

                {/* Right Panel */}
                <div className="lg:p-8 flex flex-col justify-center flex-1">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {showResetPassword ? "Reset Password" : "Welcome Back"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {showResetPassword
                                    ? "Enter your email to reset your password."
                                    : "Log in to access your account and manage your preferences."}
                            </p>
                        </div>

                        {/* Afficher UserAuthForm ou ResetPassword en fonction de l'état */}
                        {showResetPassword ? <ResetPassword /> : <UserAuthForm />}

                        {/* Bouton "Forgot Password" ou "Back to Sign In" */}
                        <button
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                        >
                            {showResetPassword ? "Back to Sign In" : "Forgot Password?"}
                        </button>

                        <p className="px-8 text-center text-sm text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}