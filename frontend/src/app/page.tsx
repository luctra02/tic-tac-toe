"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import LoginButton from "@/components/LogInButton";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@/components/SocketProvider";
import useUser from "@/app/hooks/useUser";
import { createSupabaseBrowser } from "@/lib/supabase/client";

interface statsData {
    wins: number;
    total_matches: number;
}

export default function Home() {
    const { playersOnline, socket } = useSocketContext();
    const [roomID, setRoomID] = useState("");
    const router = useRouter();
    const { data } = useUser();
    const supabase = createSupabaseBrowser();
    const [playerStats, setPlayerStats] = useState<statsData | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (data?.id) {
                const { data: statsData, error } = await supabase
                    .from("playerstats")
                    .select("wins, total_matches")
                    .eq("id", data.id)
                    .single();

                if (error) {
                    console.error("Error fetching player stats:", error);
                } else {
                    setPlayerStats(statsData);
                }
            }
        };

        fetchStats();
    }, [data?.id, supabase]);

    const userProfile = {
        full_name: data?.user_metadata?.full_name || "Guest",
        avatar_url: data?.user_metadata?.avatar_url || null,
        uuid: data?.id || null,
    };

    const handleCreateRoom = () => {
        const newRoomID = nanoid(6); // Generate a 6-character ID
        socket?.emit("createRoom", { roomID: newRoomID, userProfile }, () => {
            router.push(`/room/${newRoomID}`);
        });
    };

    const handleJoinRoom = () => {
        if (roomID) {
            // Emit event to join the room
            socket?.emit(
                "joinRoom",
                { roomID: roomID, userProfile },
                (error: string | undefined) => {
                    if (error) {
                        alert(error);
                    } else {
                        router.push(`/room/${roomID}`);
                    }
                }
            );
        } else {
            alert("Please enter a room ID.");
        }
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
                <div className="relative bg-white rounded-lg shadow-md p-4 w-full mb-4">
                    {data?.id ? (
                        <ul className="space-y-4">
                            <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                <strong>Total Matches:</strong>
                                <span>{playerStats?.total_matches}</span>
                            </li>
                            <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                <strong>Wins:</strong>
                                <span>{playerStats?.wins}</span>
                            </li>
                            <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                <strong>Losses:</strong>
                                <span>
                                    {(playerStats?.total_matches || 0) -
                                        (playerStats?.wins || 0)}
                                </span>
                            </li>
                            <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                <strong>Win Rate:</strong>
                                <span>
                                    {playerStats?.total_matches
                                        ? (
                                              (playerStats.wins /
                                                  playerStats.total_matches) *
                                              100
                                          ).toFixed(2) + "%"
                                        : "0%"}
                                </span>
                            </li>
                        </ul>
                    ) : (
                        <>
                            {/* Blur and Overlay */}
                            <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center">
                                <p className="text-lg font-semibold">
                                    Log in or register to view stats!
                                </p>
                            </div>
                            {/* Blurred stats for visual consistency */}
                            <ul className="space-y-4 filter blur-md">
                                <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                    <strong>Total Matches:</strong>
                                    <span>--</span>
                                </li>
                                <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                    <strong>Wins:</strong>
                                    <span>--</span>
                                </li>
                                <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                    <strong>Losses:</strong>
                                    <span>--</span>
                                </li>
                                <li className="flex justify-between p-2 bg-gray-100 rounded-md">
                                    <strong>Win Rate:</strong>
                                    <span>--</span>
                                </li>
                            </ul>
                        </>
                    )}
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
