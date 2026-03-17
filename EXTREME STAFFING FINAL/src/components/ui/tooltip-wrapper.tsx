import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface TooltipWrapperProps {
  content: string;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  disabled?: boolean;
}

/**
 * Simple tooltip wrapper for buttons and interactive elements
 * Usage: <TooltipWrapper content="Click to submit"><Button>Submit</Button></TooltipWrapper>
 */
export function TooltipWrapper({
  content,
  children,
  side = "top",
  delayDuration = 300,
  disabled = false,
}: TooltipWrapperProps) {
  if (disabled || !content) {
    return children;
  }

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={4}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Tooltip for icon buttons with accessible label
 */
export function IconTooltip({
  content,
  children,
  side = "top",
}: {
  content: string;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          {React.cloneElement(children, {
            "aria-label": content,
          })}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={4}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Tooltip with keyboard shortcut display
 */
export function TooltipWithShortcut({
  content,
  shortcut,
  children,
  side = "top",
}: {
  content: string;
  shortcut: string;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={4}>
        <div className="flex items-center gap-2">
          <span>{content}</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            {shortcut}
          </kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Info tooltip for badges and labels
 */
export function InfoTooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactElement;
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
