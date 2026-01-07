"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/_lib/utils"

const DialogVariantContext = React.createContext("info")
const useDialogVariant = () => React.useContext(DialogVariantContext)

const variantStyles = {
  info: {
    border: "border-slate-500",
    title: "text-slate-700",
  },
  warning: {
    border: "border-yellow-500",
    title: "text-yellow-700",
  },
  success: {
    border: "border-teal-500",
    title: "text-teal-600",
  },
  danger: {
    border: "border-rose-500",
    title: "text-rose-700",
  },

  blue: {
    border: "border-blue-500",
    title: "text-blue-700",
  },
  indigo: {
    border: "border-indigo-500",
    title: "text-indigo-700",
  },
  violet: {
    border: "border-violet-500",
    title: "text-violet-700",
  }
}

function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  variant = "info",
  showCloseButton = true,
  size = "lg", position = "center",
  ...props
}) {
  const style = variantStyles[variant] ?? variantStyles.info

  const positionMap = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",

    top: "top-10 left-1/2 -translate-x-1/2",
    bottom: "bottom-10 left-1/2 -translate-x-1/2",

    left: "left-10 top-1/2 -translate-y-1/2",
    right: "left-0 top-1/2 -translate-y-1/2",

    "top-left": "top-10 left-10",
    "top-right": "top-10 right-10",
    "bottom-left": "bottom-10 left-10",
    "bottom-right": "bottom-10 right-10",

    // Fixing nih posisi kaga danta
  }

  const sizeMap = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    full: "sm:max-w-[90vw]",
  }

  return (
    <DialogVariantContext.Provider value={variant}>
      <DialogPortal>
        <DialogOverlay />

        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "bg-white fixed top-1/2 left-1/2 z-50 grid w-full text-slate-500",
            "gap-4 rounded-lg border-0 p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            `border-l-4 
            
            ${style.border}`, sizeMap[size] ?? sizeMap.lg, positionMap[position] ?? positionMap.center, className
          )}
          {...props}
        >
          {children}

          {showCloseButton && (
            <DialogPrimitive.Close className="absolute top-7 right-5 text-slate-600 rounded-xs opacity-70 transition-opacity hover:opacity-100">
              <XIcon size={20} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogVariantContext.Provider>
  )
}


function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, variant, ...props }) {
  const inheritedVariant = useDialogVariant()
  const v = variant ?? inheritedVariant
  const style = variantStyles[v] ?? variantStyles.info

  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold", style.title, className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-slate-400 text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
