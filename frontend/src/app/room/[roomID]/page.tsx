"use client";

import { useRouter } from "next/navigation";
import { useSocketContext } from "@/components/SocketProvider";
import { Button } from "@/components/ui/button";
import { useState, useEffect, use } from "react";

interface User {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

export default function RoomPage({
    params,
}: {
    params: Promise<{ roomID: string }>;
}) {
    const { roomID } = use(params);
    const router = useRouter();
    const { socket } = useSocketContext();
    const [roomUsers, setRoomUsers] = useState<User[]>([]);

    // Fetch users when the component mounts
    useEffect(() => {
        if (!socket) return;

        // Request users in the room when socket is first connected
        socket.emit("getRoomUsers", roomID, (users: User[]) => {
            setRoomUsers(users);
        });

        const handlePlayerJoined = (newUser: User) => {
            setRoomUsers((prevUsers) => [...prevUsers, newUser]);
        };

        const handlePlayerLeft = (userId: string) => {
            setRoomUsers((prevUsers) =>
                prevUsers.filter((user) => user.id !== userId)
            );
        };

        socket.on("playerJoined", handlePlayerJoined);
        socket.on("playerLeft", handlePlayerLeft);

        // Clean up listeners on unmount or if socket changes
        return () => {
            socket.off("playerJoined", handlePlayerJoined);
            socket.off("playerLeft", handlePlayerLeft);
        };
    }, [socket, roomID]);

    const handleLeaveRoom = () => {
        socket?.emit("leaveRoom", roomID, () => {});
        router.push(`/`);
    };

    return (
        <div>
            <h1>Welcome to Room {roomID}</h1>
            <Button onClick={handleLeaveRoom} className="mt-4">
                Leave Room
            </Button>
            <div className="mt-4">
                <h2>Users in Room:</h2>
                <ul>
                    {roomUsers.map((user, index) => (
                        <li key={index}>{user.full_name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
