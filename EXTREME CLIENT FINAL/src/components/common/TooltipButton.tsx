import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../ui/utils";
import { LucideIcon } from "lucide-react";

interface TooltipButtonProps {
  tooltip: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  tooltipSide?: "top" | "bottom" | "left" | "right";
}

export function TooltipButton({
  tooltip,
  children,
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  icon: Icon,
  tooltipSide = "top",
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={onClick}
          className={cn(className)}
          disabled={disabled}
        >
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface TooltipIconButtonProps {
  tooltip: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  tooltipSide?: "top" | "bottom" | "left" | "right";
}

export function TooltipIconButton({
  tooltip,
  icon: Icon,
  onClick,
  variant = "ghost",
  size = "icon",
  className,
  disabled = false,
  tooltipSide = "top",
}: TooltipIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={onClick}
          className={cn(className)}
          disabled={disabled}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
