import lucyLogo from "@/assets/lucy-logo.png";
import { cn } from "@/lib/utils";

interface LucyLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
};

export const LucyLogo = ({ size = "md", className, showGlow = true }: LucyLogoProps) => {
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center",
        sizeClasses[size],
        showGlow && "shadow-glow-violet animate-neural-pulse",
        className
      )}
    >
      <img 
        src={lucyLogo} 
        alt="Lucy AI" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};
