import * as React from "react";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "./utils";

interface ResponsiveCardGridProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
  emptyState?: React.ReactNode;
}

export function ResponsiveCardGrid<T>({
  data,
  renderCard,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  className,
  emptyState,
}: ResponsiveCardGridProps<T>) {
  const gridClasses = cn(
    "grid gap-3 sm:gap-4 md:gap-6",
    `grid-cols-${columns.mobile}`,
    `sm:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    className
  );

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={gridClasses}>
      {data.map((item, index) => (
        <div key={index}>{renderCard(item, index)}</div>
      ))}
    </div>
  );
}

// Responsive table wrapper that provides horizontal scroll on mobile
export function ResponsiveTableWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto -mx-4 sm:mx-0", className)}>
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}

// Mobile card view for table data
interface MobileCardProps {
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "destructive" | "outline" }>;
  items: Array<{ label: string; value: React.ReactNode }>;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  badges,
  items,
  actions,
  onClick,
  className,
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || "default"} className="text-xs">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Responsive content container
export function ResponsiveContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full min-w-0 space-y-4 sm:space-y-6", className)}>
      {children}
    </div>
  );
}

// Responsive header section
interface ResponsiveHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export function ResponsiveHeader({
  title,
  description,
  actions,
  badge,
}: ResponsiveHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl sm:text-3xl tracking-tight truncate">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

// Responsive stats grid
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function ResponsiveStatsGrid({
  stats,
  className,
}: {
  stats: StatCardProps[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-semibold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
              </div>
              {stat.icon && (
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
