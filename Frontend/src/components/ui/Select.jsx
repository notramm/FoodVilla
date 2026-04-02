import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  ({ label, error, options = [], placeholder, className, required, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-gray-300 bg-white appearance-none",
              "px-3 py-2.5 text-sm text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              "transition-all duration-200",
              error && "border-red-400 focus:ring-red-400",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;