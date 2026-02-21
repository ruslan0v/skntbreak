import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
};

export default function Badge({ children, variant = "default" }: Props) {
    return (
        <span
            className={clsx(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variants[variant]
            )}
        >
            {children}
        </span>
    );
}
