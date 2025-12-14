"use client";

import { useConfirmStore } from "@/_stores/common/useConfirmStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog";
import { Button } from "@/_components/ui/Button";
import { AlertTriangle, Trash2, CheckCircle, Info } from "lucide-react";

const variantStyles = {
  danger: {
    icon: <Trash2 className="text-rose-500" size={20} />,
    title: "Danger",
    iconBgColor: "bg-rose-100 text-rose-600 p-3 rounded-full",
    titleColor: "text-rose-600",
  },
  warning: {
    icon: <AlertTriangle className="text-indigo-500" size={20} />,
    title: "Warning",
    iconBgColor: "bg-indigo-100 text-indigo-600 p-3 rounded-full",
    titleColor: "text-indigo-600",
  },
  success: {
    icon: <CheckCircle className="text-teal-500" size={20} />,
    title: "Success",
    iconBgColor: "bg-teal-100 text-teal-600 p-3 rounded-full",
    titleColor: "text-teal-600",
  },
  info: {
    icon: <Info className="text-indigo-500" size={20} />,
    title: "Information",
    iconBgColor: "bg-indigo-100 text-indigo-600 p-3 rounded-full",
    titleColor: "text-indigo-600",
  },
};

export function ConfirmDialog() {
  const { open, message, variant, confirm, cancel } = useConfirmStore();
  const v = variantStyles[variant] || variantStyles.info;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && cancel()}>
      <DialogContent className="sm:max-w-lg" variant="none">
        <DialogHeader>

          <DialogTitle className="sr-only">{v.title}</DialogTitle>

          <div className="flex items-center space-x-2">
            <div className={v.iconBgColor}>{v.icon}</div>
            <h1 className={`text-lg font-semibold ${v.titleColor}`}>{v.title}</h1>
          </div>
        </DialogHeader>

        <p className="text-sm my-4 text-slate-500">{message}</p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={cancel}>Cancel</Button>
          <Button
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            onClick={confirm}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
