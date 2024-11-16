// components/SocketProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import useSocket from "@/app/hooks/useSocket";
import { Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null; // Expose the socket instance
    playersOnline: number;
    leaveRoom: (roomID: string) => void; // Add leaveRoom method to the context
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { socket, playersOnline } = useSocket("http://localhost:3001");

    // Leave room handler
    const leaveRoom = (roomID: string) => {
        if (socket) {
            socket.emit("leaveRoom", roomID); // Emit custom leaveRoom event
        }
    };

    return (
        <SocketContext.Provider value={{ socket, playersOnline, leaveRoom }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within a SocketProvider");
    }
    return context;
};