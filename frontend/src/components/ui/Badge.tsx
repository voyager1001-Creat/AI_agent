import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  children: React.ReactNode;
}

const badgeVariants: Record<string, string> = {
  default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300",
  destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
  outline: "text-gray-950 border-gray-200",
  success: "border-transparent bg-green-600 text-white hover:bg-green-700",
  warning: "border-transparent bg-yellow-600 text-white hover:bg-yellow-700"
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref: React.Ref<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
          badgeVariants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";








