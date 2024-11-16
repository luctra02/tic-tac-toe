// hooks/useSocket.ts
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = (url: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [playersOnline, setPlayersOnline] = useState(0);

    useEffect(() => {
        const socketConnection = io(url);
        setSocket(socketConnection);

        socketConnection.on("updateOnlinePlayers", (count) => {
            setPlayersOnline(count);
        });

        return () => {
            socketConnection.disconnect();
        };
    }, [url]);

    return { socket, playersOnline };
};

export default useSocket;
