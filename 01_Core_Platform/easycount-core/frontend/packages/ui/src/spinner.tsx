import * as React from "react";
import { cn } from "./utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function Spinner({ className, label, size = "md", ...props }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)} {...props}>
      <div
        className={cn(
          "animate-spin rounded-full border-zinc-800 border-t-cyan-500",
          sizes[size]
        )}
      />
      {label && <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{label}</span>}
    </div>
  );
}
