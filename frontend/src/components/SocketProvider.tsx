// components/SocketProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import useSocket from "@/app/hooks/useSocket";
import { Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null; // Expose the socket instance
    playersOnline: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { socket, playersOnline } = useSocket("websocketserver-production-5f0d.up.railway.app");

    return (
        <SocketContext.Provider value={{ socket, playersOnline }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error(
            "useSocketContext must be used within a SocketProvider"
        );
    }
    return context;
};
