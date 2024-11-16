"use client";

import { useRouter } from "next/navigation";
import { useSocketContext } from "@/components/SocketProvider";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function RoomPage({
    params,
}: {
    params: Promise<{ roomID: string }>;
}) {
    const { roomID } = use(params); 

    const router = useRouter();
    const { socket, leaveRoom } = useSocketContext();

    const handleLeaveRoom = () => {
        if (socket) {
            leaveRoom(roomID); 
        }
        router.push(`/`);
    };

    return (
        <div>
            <h1>Welcome to Room {roomID}</h1>
            <Button onClick={handleLeaveRoom} className="mt-4">
                Leave Room
            </Button>
        </div>
    );
}
