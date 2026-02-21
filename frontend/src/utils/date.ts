export function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

export function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("ru-RU");
}

export function minutesToHM(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}
