"use client";

import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { Label } from "@/_components/ui/Label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/_servers/profile_action";

export default function ForgotPassword() {
    const [isPending, startTransition] = useTransition();
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(formData) {
        startTransition(async () => {
            await forgotPasswordAction(formData);
            setSubmitted(true);
        });
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border">

            <div className="flex items-center gap-3 mb-4">
                <Link href="/auth/login" className="p-2 hover:bg-gray-100 rounded-md">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Forgot Password
                </h1>
            </div>

            <p className="text-sm text-gray-600 mb-6">
                Enter your email address and we will send you a password reset link.
            </p>

            {submitted ? (
                <div className="text-green-600 text-sm bg-green-50 border border-green-200 p-3 rounded-md">
                    If the email is registered, a reset link has been sent.
                </div>
            ) : (
                <form action={handleSubmit} className="space-y-5">
                    <div className="space-y-3">
                        <Label>Verification Email</Label>
                        <Input
                            type="email"
                            name="email"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full text-base font-semibold bg-yellow-500 hover:bg-yellow-600 py-2.5"
                    >
                        {isPending ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            )}
        </div>
    );
}
