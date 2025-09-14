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
  className 
}: MetricCardProps) {
  const variants = {
    default: "bg-gradient-primary",
    success: "bg-gradient-success", 
    warning: "bg-gradient-warning",
    danger: "bg-gradient-danger"
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-success";
    if (value < 0) return "text-danger";
    return "text-muted-foreground";
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border bg-card p-6 shadow-md transition-all hover:shadow-lg",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
          {change && (
            <p className={cn("text-sm font-medium", getChangeColor(change.value))}>
              {change.value > 0 ? "+" : ""}{change.value}{change.percentage ? "%" : ""}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "rounded-full p-3",
            variants[variant]
          )}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        variants[variant]
      )} />
    </div>
  );
}