import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserRegisterForm } from "@/components/auth-screens/Signup/user-register-form";

export const metadata: Metadata = {
    title: "Register",
    description: "Register forms built using the components.",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Hidden for small screens */}
            <div className="md:hidden flex justify-center">
                <div className="w-1/2"> {/* Adjust parent container width */}
                    <Image
                        src="/logo-black.svg"
                        layout="responsive" // Makes it responsive
                        width={400} // Specify original image width for aspect ratio
                        height={400} // Use the same width and height for a perfect circle
                        alt="Authentication"
                        className="block dark:hidden rounded-full object-cover" // Rounded and centered
                    />
                    <Image
                        src="/logo-white.png"
                        layout="responsive"
                        width={400}
                        height={400} // Same width and height for consistency
                        alt="Authentication"
                        className="hidden dark:block rounded-full object-cover" // Rounded and centered
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container relative flex flex-1 flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <Link
                    href="/signin"
                    className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "my-6 md:my-0 md:absolute md:right-8 md:top-8 flex justify-center"
                    )}
                >
                    Signin
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
                        Welcome to COFICAB’s portal. Sign up to access your account and explore our latest updates and resources.
                    </p>
                </div>

                {/* Right Panel */}
                <div className="lg:p-8 flex flex-col justify-center flex-1">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Create an account
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your informations below to create your account
                            </p>
                        </div>
                        <UserRegisterForm />
                        <p className="px-8 text-center text-sm text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <Link
                                href="/terms"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy"
                                className="underline underline-offset-4 hover:text-primary"
                            >
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
