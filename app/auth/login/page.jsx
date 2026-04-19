"use client"

import { useState, useTransition, useActionState } from "react"

import { Label } from "@/_components/ui/Label"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Checkbox } from "@/_components/ui/Checkbox"
import AuthForm from "../AuthForm"
import AuthLink from "../AuthLink"
import { AuthAction } from "../../../_servers/auth_action"
import { Loader } from "lucide-react"

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState(false)
  const [pending, startTransition] = useTransition()

  const [state, formAction] = useActionState(AuthAction, {
    error: "",
    errors: {},
  })

  return (
    <AuthForm headers="Login">
      <form
        action={(formData) =>
          startTransition(() => formAction(formData))
        }
        className="space-y-5"
      >

        {/* EMAIL */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="h-10"
            placeholder="Enter your email"
          />

          {state?.errors?.email && (
            <p className="text-xs text-red-500">
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
            className="h-10"
            placeholder="Enter your password"
          />

          {state?.errors?.password && (
            <p className="text-xs text-red-500">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {/* REMEMBER */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <Label htmlFor="remember">Remember Me</Label>
          </div>

          <AuthLink href="/auth/forgot-password" link="Forgot Password?" />
        </div>

        {/* BUTTON */}
        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-violet-500 hover:bg-violet-700"
        >
          {pending ? (
            <div className="flex items-center gap-1">
              <Loader className="animate-spin" />
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </Button>

      </form>

      {/* GLOBAL ERROR */}
      {state?.error && (
        <p className="mt-3 text-center text-sm text-red-500">
          {state.error}
        </p>
      )}
    </AuthForm>
  )
}

export default LoginPage
