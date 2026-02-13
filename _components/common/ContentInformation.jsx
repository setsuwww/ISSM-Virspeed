"use client"

import React from "react";
import { Button } from "@/_components/ui/Button";
import { useRouter } from "next/navigation";
import { PlusSquare } from "lucide-react";

export const ContentInformation = React.memo(function ContentInformation({
  heading,
  subheading,
  show = false,
  buttonText = "Create",
  href,
  autoMargin = "mb-3",
  variant = "primary",
  buttonIcon,
}) {

  const hasHeader = heading || subheading;
  const router = useRouter();

  if (!hasHeader) return null;

  return (
    <header className={`${autoMargin ? "mb-3" : "mb-0"} flex items-center justify-between`}>

      <div className="flex flex-col">
        {heading && (
          <h2 className="text-lg font-bold text-slate-700/80">
            {heading}
          </h2>
        )}
        {subheading && (
          <p className="text-sm text-slate-500">
            {subheading}
          </p>
        )}
      </div>

      {show && (
        <Button
          variant={variant}
          onClick={() => href && router.push(href)}
          className="flex items-center gap-2"
        >
          {buttonIcon ?? <PlusSquare size={18} />}
          {buttonText}
        </Button>
      )}

    </header>
  );
});
