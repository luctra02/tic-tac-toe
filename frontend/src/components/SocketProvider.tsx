// components/SocketProvider.tsx
"use client"; // Ensures this is a client component

import { createContext, useContext, ReactNode } from "react";
import useSocket from "@/app/hooks/useSocket";

interface SocketContextType {
    playersOnline: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { playersOnline } = useSocket("http://localhost:3001"); // Your socket URL

    return (
        <SocketContext.Provider value={{ playersOnline }}>
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
