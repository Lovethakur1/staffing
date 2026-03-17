import logoImg from '../assets/logo.png';

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
      src={logoImg}
      alt="EXTREME"
      className={`object-contain ${sizeClasses[size]} ${className}`}
    />
  );
}
