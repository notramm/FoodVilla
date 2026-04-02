import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      containerClassName,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-gray-300 bg-white",
              "px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500",
              error && "border-red-400 focus:ring-red-400",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              !fullWidth && "w-auto",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;