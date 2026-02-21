import { useState, useEffect, useRef } from "react";

export function useCountdown(
    targetDate: Date | null,
    onComplete?: () => void
) {
    const [remaining, setRemaining] = useState(0);
    const cbRef = useRef(onComplete);
    cbRef.current = onComplete;

    useEffect(() => {
        if (!targetDate) {
            setRemaining(0);
            return;
        }

        const tick = () => {
            const diff = Math.max(
                0,
                Math.floor((targetDate.getTime() - Date.now()) / 1000)
            );
            setRemaining(diff);
            if (diff <= 0) cbRef.current?.();
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return {
        remaining,
        minutes,
        seconds,
        display: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    };
}
