import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: ReactNode;
}

const variantStyles = {
    primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
    secondary:
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400",
    danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    ghost:
        "bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400",
};

const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
};

export default function Button({
    variant = "primary",
    size = "md",
    loading,
    icon,
    children,
    className,
    disabled,
    ...rest
}: Props) {
    return (
        <button
            className={clsx(
                "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon ? (
                icon
            ) : null}
            {children}
        </button>
    );
}
