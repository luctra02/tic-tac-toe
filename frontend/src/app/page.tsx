"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
    const [roomID, setRoomID] = useState("");

    const handleCreateRoom = () => {
        console.log("Creating room...");
    };

    const handleJoinRoom = () => {
        console.log("Joining room with ID:", roomID);
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
            </div>

            {/* Stats Panel */}
            <div className="hidden md:flex flex-col items-start justify-center w-1/3 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Player Stats
                </h2>
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
                        Players Online: {stats.playersOnline}
                    </span>
                </div>
            </div>
        </div>
    );
}
