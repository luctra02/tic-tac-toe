"use client";

import { useRouter } from "next/navigation";
import { useSocketContext } from "@/components/SocketProvider";
import { Button } from "@/components/ui/button";
import { useState, useEffect, use } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import TicTacToe from "@/components/TicTacToe";
import { createSupabaseBrowser } from "@/lib/supabase/client";
const supabase = createSupabaseBrowser();

interface User {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    uuid?: string | null;
    score: number;
}

interface Roles {
    winner: "X" | "O" | null; // Indicates the winning role or null for a draw
    X: User | null;
    O: User | null;
}

export default function RoomPage({
    params,
}: {
    params: Promise<{ roomID: string }>;
}) {
    const { roomID } = use(params);
    const router = useRouter();
    const { socket } = useSocketContext();
    const [roomUsers, setRoomUsers] = useState<string[]>([]);
    const [players, setPlayers] = useState<Roles | null>(null);
    const [hostScore, setHostScore] = useState<number>(0);
    const [playerScore, setPlayerScore] = useState<number>(0);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.emit("getRoomUsers", roomID, (users: string[]) => {
            setRoomUsers(users);
        });

        const handlePlayerJoined = (newUser: string) => {
            setRoomUsers((prevUsers) => [...prevUsers, newUser]);
            socket.emit("getRoomRoles", roomID, (roles: Roles | null) => {
                setPlayers(roles);
            });
        };

        const handlePlayerLeft = (userId: string) => {
            setRoomUsers((prevUsers) =>
                prevUsers.filter((user) => user !== userId)
            );
            socket.emit("getRoomRoles", roomID, (roles: Roles | null) => {
                setPlayers(roles);
            });
        };

        socket.emit("getRoomRoles", roomID, (roles: Roles | null) => {
            setPlayers(roles);
            setHostScore(players?.X?.score || 0);
            setPlayerScore(players?.O?.score || 0);
        });

        const handleGameStart = () => {
            setGameStarted(true);
        };

        const handleGameOver = async (roles: Roles) => {
            console.log(roles);
            setHostScore(roles.X?.score || 0);
            setPlayerScore(roles.O?.score || 0);
            if (roles.X?.uuid) {
                const { data } = await supabase
                    .from("playerstats")
                    .select("total_matches")
                    .eq("id", roles.X.uuid)
                    .single();

                const newTotalMatches = (data?.total_matches || 0) + 1;
                const {} = await supabase
                    .from("playerstats")
                    .update({ total_matches: newTotalMatches })
                    .eq("id", roles.X.uuid);
            }

            if (roles.O?.uuid) {
                const { data } = await supabase
                    .from("playerstats")
                    .select("total_matches")
                    .eq("id", roles.O.uuid)
                    .single();

                const newTotalMatches = (data?.total_matches || 0) + 1;
                const {} = await supabase
                    .from("playerstats")
                    .update({ total_matches: newTotalMatches })
                    .eq("id", roles.O.uuid);
            }
            const winnerID = roles?.[roles.winner as "X" | "O"]?.uuid;
            if (winnerID) {
                const { data } = await supabase
                    .from("playerstats")
                    .select("wins")
                    .eq("id", winnerID)
                    .single();

                const newWins = (data?.wins || 0) + 1;
                const {} = await supabase
                    .from("playerstats")
                    .update({ wins: newWins })
                    .eq("id", winnerID);
            }
        };

        socket.on("playerJoined", handlePlayerJoined);
        socket.on("playerLeft", handlePlayerLeft);
        socket.on("gameStarted", handleGameStart);
        socket.on("gameOver", handleGameOver);

        return () => {
            socket.off("playerJoined", handlePlayerJoined);
            socket.off("playerLeft", handlePlayerLeft);
            socket.off("gameStarted", handleGameStart);
            socket.off("gameOver", handleGameOver);
        };
    }, [socket, roomID, roomUsers, players?.X?.score, players?.O?.score]);

    const handleLeaveRoom = () => {
        socket?.emit("leaveRoom", roomID, () => {});
        router.push(`/`);
    };

    const handleStartGame = () => {
        if (roomUsers.length > 1) {
            socket?.emit("startGame", roomID); // Emit event to start the game
        }
    };

    const player1 = players?.X || null;
    const player2 = players?.O || null;

    return (
        <div className="relative min-h-screen bg-gray-50">
            {/* Room Title */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
                <h1 className="text-2xl font-bold">Welcome to Room {roomID}</h1>
                <Button
                    onClick={handleLeaveRoom}
                    className="mt-2 bg-red-500 text-white hover:bg-red-600"
                >
                    Leave Room
                </Button>
            </div>

            {/* Host - Top Left */}
            <div className="absolute top-6 left-6 flex flex-col items-center">
                {player1 ? (
                    <div className="flex flex-row items-center space-x-4">
                        <div className="flex flex-col items-center text-center">
                            <Avatar className="w-20 h-20 mb-2">
                                <AvatarImage
                                    src={player1.avatar_url || ""}
                                    alt={player1.full_name}
                                />
                                <AvatarFallback>
                                    {player1.full_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-lg font-medium">
                                {player1.full_name}
                            </h2>
                            <span className="text-sm text-gray-500">
                                Player 1
                            </span>
                        </div>
                        {/* Host Score */}
                        <div className="text-center bg-blue-100 px-4 py-2 rounded-lg">
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="text-lg font-bold">{hostScore}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Waiting for player...</p>
                )}
            </div>

            {/* Other Player - Top Right */}
            <div className="absolute top-6 right-6 flex flex-col items-center">
                {player2 ? (
                    <div className="flex flex-row items-center space-x-4">
                        {/* Player Score */}
                        <div className="text-center bg-blue-100 px-4 py-2 rounded-lg">
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="text-lg font-bold">{playerScore}</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Avatar className="w-20 h-20 mb-2">
                                <AvatarImage
                                    src={player2.avatar_url || ""}
                                    alt={player2.full_name}
                                />
                                <AvatarFallback>
                                    {player2.full_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-lg font-medium">
                                {player2.full_name}
                            </h2>
                            <span className="text-sm text-gray-500">
                                Player 2
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Waiting for a player...</p>
                )}
            </div>

            {/* Start Game Button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                {roomUsers.length > 1 && !gameStarted && (
                    <Button
                        onClick={handleStartGame}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        Start Game
                    </Button>
                )}
            </div>

            {/* Tic Tac Toe Game */}
            {gameStarted && (
                <div className="flex items-center justify-center h-screen">
                    <TicTacToe roomID={roomID} players={roomUsers.length} />
                </div>
            )}
        </div>
    );
}
