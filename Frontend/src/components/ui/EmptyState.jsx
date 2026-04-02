import { cn } from "../../utils/cn.js";
import Button from "./Button.jsx";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-16 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && actionLabel && (
        <Button onClick={action} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;