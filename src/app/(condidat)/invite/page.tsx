"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const updateUserDepartmentAndStatus = useMutation(api.mutations.user.updateUserDepartmentAndStatus);

  const { signIn } = useAuthActions(); // Use Convex's signIn function

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
    // Use Convex's signIn function with the "password" provider
    await signIn("password", {
      email,
      name,
      password,
      flow: "signUp", // Indicate this is a sign-up flow
    });
    await updateUserDepartmentAndStatus({ email });

    toast.success("Registration completed successfully!");
    // Redirect to dashboard using Next.js router
    router.push("/");
  } catch (error:any) {
    toast.error(error.message || "An error occurred. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 text-center">
            Complete Your Registration
          </CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            Welcome! Please fill in the details below to complete your registration.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              value={email || ""}
              disabled
              className="rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <Button
            onClick={handleCompleteRegistration}
            disabled={isLoading}
            className="w-full bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
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
      </Card>
    </div>
  );
}