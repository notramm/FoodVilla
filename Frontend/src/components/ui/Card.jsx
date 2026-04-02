import { cn } from "../../utils/cn.js";

const Card = ({
  children,
  className,
  hover = false,
  onClick,
  padding = "md",
}) => {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-sm",
        hover &&
          "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Sub components for composition pattern!
Card.Header = ({ children, className }) => (
  <div className={cn("mb-4", className)}>{children}</div>
);

Card.Title = ({ children, className }) => (
  <h3 className={cn("text-lg font-semibold text-gray-900", className)}>
    {children}
  </h3>
);

Card.Body = ({ children, className }) => (
  <div className={cn(className)}>{children}</div>
);

Card.Footer = ({ children, className }) => (
  <div className={cn("mt-4 pt-4 border-t border-gray-100", className)}>
    {children}
  </div>
);

export default Card;