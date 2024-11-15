"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (url: string) => {
    const [playersOnline, setPlayersOnline] = useState(0);

    useEffect(() => {
        const socket = io(url);

        // Listen for updates
        socket.on("updateOnlinePlayers", (count) => {
            setPlayersOnline(count);
        });

        // Cleanup
        return () => {
            socket.disconnect();
        };
    }, [url]);

    return { playersOnline };
};

export default useSocket;
