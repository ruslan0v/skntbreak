import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

let connection: HubConnection | null = null;

export const getConnection = (): HubConnection | null => connection;
const HUB_URL = 'https://localhost:7059/breakQueueHub';

export const startConnection = async (): Promise<HubConnection> => {
    if (connection && connection.state === 'Connected') return connection;

    connection = new HubConnectionBuilder()
        .withUrl(HUB_URL, {
            withCredentials: true  // ← используй cookie вместо токена
        })
        .withAutomaticReconnect([0, 1000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

    try {
        await connection.start();
        console.log('SignalR Connected');
    } catch (err) {
        console.error('SignalR Connection Error:', err);
    }

    return connection;
};

export const stopConnection = async () => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};