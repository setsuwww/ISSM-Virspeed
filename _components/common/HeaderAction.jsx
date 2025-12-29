"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/_components/ui/DropdownMenu";
import { Button } from "@/_components/ui/Button";

export function ActionToolbar({ actions }) {
  return (
    <div className="flex items-center gap-x-2">
      {actions.map((action, i) => {
        if (action.type === "button") {
          return (
            <Button
              key={i}
              variant={action.variant ?? "ghost"}
              size="sm"
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          );
        }

        if (action.type === "dropdown") {
          return (
            <DropdownMenu key={i}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {action.icon}
                  {action.label}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{action.label}</DropdownMenuLabel>
                {action.items.map((item, idx) => (
                  <DropdownMenuItem key={idx} onClick={item.onClick}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      })}
    </div>
  );
}
