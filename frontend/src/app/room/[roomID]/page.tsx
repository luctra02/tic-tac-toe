"use client";

import { useSocketContext } from "@/components/SocketProvider";

export default function RoomPage({ params }: { params: { roomID: string } }) {
    // Access `roomID` directly since `params` are passed synchronously here
    const { roomID } = params;

    const { socket } = useSocketContext();
    

    return <div>Welcome to Room {roomID}</div>;
    
}
