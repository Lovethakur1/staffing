import xtremeLogoLight from "figma:asset/d33993304c8022e8a9a85301922ccd9bcde8e510.png";

interface XtremeLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function XtremeLogo({ size = "md", className = "" }: XtremeLogoProps) {
  const sizeClasses = {
    sm: "h-10",
    md: "h-16", 
    lg: "h-24",
    xl: "h-32"
  };

  return (
    <img 
      src={xtremeLogoLight} 
      alt="Extreme Staffing" 
      className={`w-auto object-contain ${sizeClasses[size]} ${className}`}
    />
  );
}