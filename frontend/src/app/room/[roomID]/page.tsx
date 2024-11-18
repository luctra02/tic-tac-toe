"use client";

import { useRouter } from "next/navigation";
import { useSocketContext } from "@/components/SocketProvider";
import { Button } from "@/components/ui/button";
import { useState, useEffect, use } from "react";

export default function RoomPage({
    params,
}: {
    params: Promise<{ roomID: string }>;
}) {
    const { roomID } = use(params);
    const router = useRouter();
    const { socket, leaveRoom } = useSocketContext();
    const [roomUsers, setRoomUsers] = useState([]);

    // Fetch users when the component mounts
    useEffect(() => {
        if (socket) {
            // Request users in the room
            socket.emit("getRoomUsers", roomID, (users) => {
                setRoomUsers(users); // Update state with the list of users
            });
        }
    }, [socket, roomID]);
    console.log(roomUsers);

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
