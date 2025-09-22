import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    percentage: boolean;
  };
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  variant = "default",
  className,
  hideContent = false
}: MetricCardProps & { hideContent?: boolean }) {
  const variants = {
    default: "bg-gradient-primary",
    success: "bg-gradient-success", 
    warning: "bg-gradient-warning",
    danger: "bg-gradient-danger"
  };

  const glowVariants = {
    default: "shadow-glow",
    success: "shadow-glow", 
    warning: "shadow-glow",
    danger: "shadow-glow"
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-success";
    if (value < 0) return "text-danger";
    return "text-muted-foreground";
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm p-6 shadow-glass transition-all hover:shadow-glow hover:bg-card/80",
      glowVariants[variant],
      className
    )}>
      <div className="flex items-center justify-between">
        {!hideContent && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
            {change && (
              <p className={cn("text-sm font-medium", getChangeColor(change.value))}>
                {change.value > 0 ? "+" : ""}{change.value}{change.percentage ? "%" : ""}
              </p>
            )}
          </div>
        )}
        {icon && (
          <div className={cn(
            "rounded-xl p-3 shadow-glow backdrop-blur-sm",
            variants[variant]
          )}>
            <div className="text-white drop-shadow-lg">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-10 rounded-xl",
        variants[variant]
      )} />
      
      {/* Glass effect border */}
      <div className="absolute inset-0 rounded-xl border border-white/10" />
    </div>
  );
}