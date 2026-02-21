import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
    label: string;
    value: string | number;
    icon: ReactNode;
    color?: "indigo" | "green" | "amber" | "red" | "blue";
}

const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
};

export default function StatCard({
    label,
    value,
    icon,
    color = "indigo",
}: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div
                className={clsx(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    colorMap[color]
                )}
            >
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
}
