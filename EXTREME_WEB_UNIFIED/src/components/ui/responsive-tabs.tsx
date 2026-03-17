import * as React from "react";
import { TabsList } from "./tabs";
import { cn } from "./utils";

interface ResponsiveTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsList> {
  /**
   * Number of tabs/columns to display
   * On mobile, tabs will automatically scroll horizontally
   */
  children: React.ReactNode;
  className?: string;
}

/**
 * ResponsiveTabsList component that handles mobile overflow gracefully
 * - On mobile: Scrolls horizontally with proper spacing
 * - On desktop: Uses grid layout as specified
 */
export const ResponsiveTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  ResponsiveTabsListProps
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1">
        <TabsList
          ref={ref}
          className={cn(
            // Remove default grid on mobile, allow natural width
            "w-full min-w-max inline-flex",
            // Re-apply grid on larger screens if className contains grid
            className?.includes("grid") && "md:grid md:w-full",
            className
          )}
          {...props}
        >
          {children}
        </TabsList>
      </div>
    </div>
  );
});

ResponsiveTabsList.displayName = "ResponsiveTabsList";
