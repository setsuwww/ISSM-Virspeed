"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/_lib/utils"
import { buttonVariants } from "@/_components/ui/Button"
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

function AlertDialog({ ...props }) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

const variantStyles = {
  info: {
    border: "border-slate-400",
    icon: <Info className="w-7 h-7 text-slate-500" />,
    parentIcon: "bg-slate-100",
  },
  warning: {
    border: "border-yellow-500",
    icon: <AlertTriangle className="w-7 h-7 text-yellow-500" />,
    parentIcon: "bg-yellow-100",
  },
  success: {
    border: "border-emerald-500",
    icon: <CheckCircle2 className="w-7 h-7 text-emerald-500" />,
    parentIcon: "bg-emerald-100",
  },
  danger: {
    border: "border-red-500",
    icon: <XCircle className="w-7 h-7 text-red-500" />,
    parentIcon: "bg-red-100",
  },
}

function AlertDialogContent({ className, variant = "info", ...props }) {
  const style = variantStyles[variant] ?? variantStyles.info

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-white fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border-0 border-slate-200 shadow-lg duration-200 sm:max-w-lg data-[state=open]:animate-in data-[state=closed]:animate-out p-6",
          "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          `border-l-4 ${style.border}`,
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, children, icon, variant = "info", ...props }) {
  const style = variantStyles[variant] ?? variantStyles.info

  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("flex items-center gap-2 text-lg font-semibold text-slate-700", className)}
      {...props}
    >
      <div className={cn("p-2 rounded-full", style.parentIcon)}>
        {icon ?? style.icon}
      </div>
      {children}
    </AlertDialogPrimitive.Title>
  )
}

function AlertDialogSubtitle({ className, ...props }) {
  return (
    <p
      data-slot="alert-dialog-subtitle"
      className={cn("text-sm text-slate-600", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-slate-400", className)}
      {...props}
    />
  )
}

function AlertDialogAction({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogSubtitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
