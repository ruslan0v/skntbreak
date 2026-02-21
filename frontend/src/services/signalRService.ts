import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@microsoft/signalr';

let connection: HubConnection | null = null;
let startPromise: Promise<HubConnection> | null = null;

export const getConnection = (): HubConnection | null => connection;

// Автоматически определяем правильный URL на основе VITE_API_URL, 
// чтобы избежать проблем с несоответствием портов или протоколов (CORS/ERR_CONNECTION_REFUSED)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7059/api';
const HUB_URL = API_BASE_URL.replace(/\/api\/?$/, '') + '/breakQueueHub';

export const startConnection = async (): Promise<HubConnection> => {
    // Если соединение уже установлено, возвращаем его
    if (connection?.state === HubConnectionState.Connected) {
        return connection;
    }

    // Если процесс подключения уже идет, не начинаем новый, а ждем текущий
    if (startPromise) {
        return startPromise;
    }

    connection = new HubConnectionBuilder()
        .withUrl(HUB_URL, {
            // Передаем JWT токен явно, решая проблему с cookie и CORS политиками
            accessTokenFactory: () => localStorage.getItem('token') || ''
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

    startPromise = connection.start()
        .then(() => {
            console.log(`SignalR Connected to ${HUB_URL}`);
            return connection!;
        })
        .catch((err) => {
            console.error(`SignalR Connection Error to ${HUB_URL}:`, err);
            startPromise = null;
            throw err;
        });

    return startPromise;
};

export const stopConnection = async () => {
    if (connection) {
        try {
            await connection.stop();
        } catch (err) {
            console.error('Error stopping SignalR connection:', err);
        } finally {
            connection = null;
            startPromise = null;
        }
    }
};
