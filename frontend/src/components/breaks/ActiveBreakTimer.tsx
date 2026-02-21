import { useEffect, useState } from "react";
import { breaksApi } from "../../api/breaks";
import type { ActiveBreakDto } from "../../types";
import { useCountdown } from "../../hooks/useCountdown";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Coffee } from "lucide-react";

interface Props {
    onEnd?: () => void;
}

export default function ActiveBreakTimer({ onEnd }: Props) {
    const [activeBreak, setActiveBreak] = useState<ActiveBreakDto | null>(null);
    const [ending, setEnding] = useState(false);

    useEffect(() => {
        breaksApi.getMyActive().then((res) => {
            if (res.hasActiveBreak && res.breakData) setActiveBreak(res.breakData);
        });
    }, []);

    const endTime = activeBreak
        ? new Date(
            new Date(activeBreak.startTime).getTime() +
            activeBreak.durationMinutes * 60_000
        )
        : null;

    const { display, remaining } = useCountdown(endTime);

    const handleEnd = async () => {
        if (!activeBreak) return;
        setEnding(true);
        try {
            await breaksApi.endBreak(activeBreak.id);
            setActiveBreak(null);
            onEnd?.();
        } finally {
            setEnding(false);
        }
    };

    if (!activeBreak) {
        return (
            <Card>
                <div className="text-center py-6">
                    <Coffee className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 text-sm">Нет активного перерыва</p>
                </div>
            </Card>
        );
    }

    const isOverdue = remaining <= 0;

    return (
        <Card
            className={
                isOverdue
                    ? "border-red-300 bg-red-50"
                    : "border-indigo-300 bg-indigo-50"
            }
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Coffee
                    size={20}
                    className={isOverdue ? "text-red-500" : "text-indigo-500"}
                />
                Активный перерыв
            </h3>

            <div className="text-center mb-4">
                <p
                    className={`text-4xl font-mono font-bold ${isOverdue ? "text-red-600" : "text-indigo-600"
                        }`}
                >
                    {isOverdue ? "Время вышло!" : display}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Перерыв #{activeBreak.breakNumber} · {activeBreak.durationMinutes} мин
                </p>
            </div>

            <Button
                onClick={handleEnd}
                loading={ending}
                variant={isOverdue ? "danger" : "primary"}
                className="w-full"
            >
                Завершить перерыв
            </Button>
        </Card>
    );
}
