"use client"

import { useState, useTransition, useActionState } from "react"
import { Label } from "@/_components/ui/Label"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Checkbox } from "@/_components/ui/Checkbox"
import AuthLink from "../AuthLink"
import { AuthAction } from "../../../_servers/auth_action"
import { Loader, Rocket, MapPin } from "lucide-react"

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState(false)
  const [pending, startTransition] = useTransition()

  const [state, formAction] = useActionState(AuthAction, {
    error: "",
    errors: {},
  })

  return (
    <div className="flex min-h-[600px] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">

      {/* SECTION KIRI: Branding & Info */}
      <div className="hidden w-1/2 flex-col justify-between bg-violet-600 p-10 text-white lg:flex">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Rocket className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">Virspeed</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight">
              Information System Shift Management
            </h1>
            <p className="text-violet-100 leading-relaxed">
              Virspeed is an Shift and Attendance management system. designed to help efficiency workflow and real-time performance monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-violet-200">
          <MapPin className="h-4 w-4" />
          <span>Jakarta, Indonesia</span>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center p-8 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
            <p className="text-sm text-muted-foreground">
              Masukkan email dan password Anda untuk masuk.
            </p>
          </div>

          <form
            action={(formData) => startTransition(() => formAction(formData))}
            className="space-y-4"
          >
            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
              {state?.errors?.email && (
                <p className="text-xs text-red-500 font-medium">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
              {state?.errors?.password && (
                <p className="text-xs text-red-500 font-medium">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* REMEMBER & FORGOT */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <AuthLink href="/auth/forgot-password" link="Forgot Password?" />
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-violet-600 hover:bg-violet-700 transition-colors"
            >
              {pending ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Prosesing...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* GLOBAL ERROR */}
          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-center text-xs text-red-600 font-medium">
                {state.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
