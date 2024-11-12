"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import LoginButton from "@/components/LogInButton";

const SOCKET_SERVER_URL = "http://localhost:3001";

export default function Home() {
    const [roomID, setRoomID] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [playersOnline, setPlayersOnline] = useState(0);

    useEffect(() => {
        // Initialize socket connection
        const socketConnection = io(SOCKET_SERVER_URL);

        // Listen for online player updates
        socketConnection.on("updateOnlinePlayers", (count) => {
            setPlayersOnline(count);
        });

        setSocket(socketConnection);

        // Cleanup on component unmount
        return () => {
            socketConnection.disconnect();
        };
    }, []);

    const handleCreateRoom = () => {
        console.log("Creating room...");
        // Emit an event to create a room, if needed
        socket?.emit("createRoom", roomID); // Use optional chaining to avoid errors if socket is null
    };

    const handleJoinRoom = () => {
        console.log("Joining room with ID:", roomID);
        // Emit an event to join a room, if needed
        socket?.emit("joinRoom", roomID); // Use optional chaining to avoid errors if socket is null
    };

    // Placeholder stats data
    const stats = {
        playersOnline: 120, // Example static data
        totalMatches: 320,
        wins: 150,
        losses: 170,
        winRate: "47%",
    };

    return (
        <div className="flex min-h-screen bg-neutral-300">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-center w-full md:w-2/3 p-8 text-center">
                <h1 className="text-4xl font-bold text-blue-500 mb-4">
                    Welcome to Tic Tac Toe!
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                    Play a game of tic tac toe with friends by joining a room or
                    creating a new one.
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={handleCreateRoom}
                        className="w-full max-w-xs"
                    >
                        Create Room
                    </Button>

                    <div className="flex items-center space-x-2">
                        <Input
                            value={roomID}
                            onChange={(e) => setRoomID(e.target.value)}
                            placeholder="Enter Room ID"
                            className="w-full max-w-xs"
                        />
                        <Button onClick={handleJoinRoom}>Join Room</Button>
                    </div>
                </div>
                <div className="mt-6"></div>
            </div>

            {/* Stats Panel */}
            <div className="hidden md:flex flex-col items-start justify-center w-1/3 p-8">
                <div className="flex justify-between w-full mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Player Stats
                    </h2>
                    {/* Place the LoginButton at the end of the row */}
                    <LoginButton />
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 w-full mb-4">
                    <ul className="space-y-4">
                        <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                            <strong>Total Matches:</strong>
                            <span>{stats.totalMatches}</span>
                        </li>
                        <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                            <strong>Wins:</strong>
                            <span>{stats.wins}</span>
                        </li>
                        <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                            <strong>Losses:</strong>
                            <span>{stats.losses}</span>
                        </li>
                        <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                            <strong>Win Rate:</strong>
                            <span>{stats.winRate}</span>
                        </li>
                    </ul>
                </div>

                {/* Players Online Field */}
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />{" "}
                    {/* Simple green circle */}
                    <span className="text-lg font-semibold text-gray-800">
                        Players Online: {playersOnline}
                    </span>
                </div>
            </div>
        </div>
    );
}
