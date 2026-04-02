import { cn } from "../../utils/cn.js";

const sizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colors = {
  white: "border-white border-t-transparent",
  gray: "border-gray-400 border-t-transparent",
  primary: "border-primary-500 border-t-transparent",
};

const Spinner = ({ size = "md", color = "primary", className }) => {
  return (
    <div
      className={cn(
        "rounded-full border-2 animate-spin",
        sizes[size],
        colors[color],
        className
      )}
    />
  );
};

export default Spinner;