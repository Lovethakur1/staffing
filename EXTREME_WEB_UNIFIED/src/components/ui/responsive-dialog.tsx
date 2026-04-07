import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";
import { cn } from "./utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-[95vw] sm:max-w-md",
  md: "max-w-[95vw] sm:max-w-lg",
  lg: "max-w-[95vw] sm:max-w-2xl",
  xl: "max-w-[95vw] sm:max-w-4xl",
  full: "max-w-[95vw] sm:max-w-6xl",
};

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ResponsiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] flex flex-col p-0",
          className
        )}
      >
        {/* Header - Fixed at top */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs sm:text-sm">{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
          {children}
        </div>

        {/* Footer - Fixed at bottom */}
        {footer && (
          <div className="border-t px-4 sm:px-6 py-4 bg-white flex-shrink-0">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Responsive button group for dialog footers
export function ResponsiveDialogFooter({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right" | "between";
}) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div className={cn("flex flex-col-reverse sm:flex-row gap-2 sm:gap-3", alignClasses[align])}>
      {children}
    </div>
  );
}

// Responsive full-width button for mobile, auto-width for desktop
export function ResponsiveButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("w-full sm:w-auto", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
