import React from "react";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: "default" | "info" | "warning" | "danger" | "success";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "default", title, children }: CalloutProps) {
  const Icon = {
    default: Info,
    info: Info,
    warning: AlertTriangle,
    danger: XCircle,
    success: CheckCircle,
  }[type];

  const variantStyles = {
    default: "bg-muted text-foreground border-border",
    info: "bg-blue-500/10 text-blue-800 border-blue-500/20 dark:text-blue-300",
    warning: "bg-amber-500/10 text-amber-800 border-amber-500/20 dark:text-amber-300",
    danger: "bg-red-500/10 text-red-800 border-red-500/20 dark:text-red-300",
    success: "bg-green-500/10 text-green-800 border-green-500/20 dark:text-green-300",
  };

  return (
    <div
      className={cn(
        "my-6 flex items-start rounded-md border py-4 px-4",
        variantStyles[type]
      )}
    >
      <div className="mr-4 mt-0.5 shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="w-full min-w-0 leading-relaxed">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="[&>p]:m-0 text-sm">{children}</div>
      </div>
    </div>
  );
}
