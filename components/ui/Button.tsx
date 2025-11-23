import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/helpers";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Minimum touch target
          "min-h-[44px]",
          // Variants
          variant === "primary" &&
            "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
          variant === "secondary" &&
            "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500",
          variant === "outline" &&
            "border-2 border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500",
          variant === "ghost" &&
            "bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500",
          // Sizes
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-base",
          size === "lg" && "px-6 py-3 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
