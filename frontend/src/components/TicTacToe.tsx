"use client";

import { useEffect, useState } from "react";
import { useSocketContext } from "@/components/SocketProvider";

type Cell = "X" | "O" | null;

interface Player {
    id: string;
    full_name: string;
}

interface Roles {
    X: Player | null;
    O: Player | null;
}

interface TicTacToeProps {
    roomID: string;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ roomID }) => {
    const [board, setBoard] = useState<Cell[][]>(
        Array(3)
            .fill(null)
            .map(() => Array(3).fill(null))
    );
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<Player | null>(null);
    const { socket } = useSocketContext();
    const [roles, setRoles] = useState<Roles | null>(null);
    const [blinkingCells, setBlinkingCells] = useState<
        {
            player: "X" | "O";
            row: number;
            col: number;
        }[]
    >([]);

    useEffect(() => {
        if (!socket) return;

        socket.emit("getRoomRoles", roomID, (roles: Roles | null) => {
            if (roles) {
                setRoles(roles);
            } else {
                console.log("Room not found");
            }
        });

        socket.on(
            "gameUpdate",
            ({
                board,
                isXNext,
                blinkingCell,
            }: {
                board: Cell[][];
                isXNext: boolean;
                blinkingCell:
                    | {
                          player: "X" | "O";
                          row: number;
                          col: number;
                      }[]
                    | null;
            }) => {
                setBoard(board);
                setIsXNext(isXNext);
                setBlinkingCells(blinkingCell || []);
            }
        );

        socket.on(
            "gameReset",
            ({ board, isXNext }: { board: Cell[][]; isXNext: boolean }) => {
                setBoard(board);
                setIsXNext(isXNext);
                setWinner(null);
                setBlinkingCells([]);
            }
        );

        socket.on("gameOver", ({ winner }: { winner: Player | null }) => {
            setWinner(winner);
        });

        return () => {
            socket.off("gameUpdate");
            socket.off("gameReset");
            socket.off("gameOver");
        };
    }, [roomID, socket]);

    const handleMove = (row: number, col: number) => {
        if (board[row][col] || winner) return;
        socket?.emit("makeMove", { roomID, row, col });
    };

    const resetGame = () => {
        socket?.emit("resetGame", roomID);
    };

    // Inline style for the blinking effect for X and O pieces
    const blinkingStyle = {
        animation: "blink 1s step-end infinite",
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-bold">Tic Tac Toe</h1>
            {!winner && (
                <p className="text-lg font-semibold">
                    {`It's ${
                        isXNext ? roles?.X?.full_name : roles?.O?.full_name
                    }'s (${isXNext ? "X" : "O"}) turn`}
                </p>
            )}
            {winner && (
                <p className="text-lg font-semibold">{`Winner: ${
                    winner.full_name
                } (${winner.id === roles?.X?.id ? "X" : "O"})`}</p>
            )}
            <style>
                {`
                @keyframes blink {
                    50% { opacity: 0.5; }
                }
                `}
            </style>
            <div className="grid grid-cols-3 gap-2">
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <button
                            key={`${rowIndex}-${colIndex}`}
                            className="w-16 h-16 border border-gray-300 flex items-center justify-center text-2xl"
                            onClick={() => handleMove(rowIndex, colIndex)}
                            disabled={cell !== null || winner !== null}
                        >
                            {cell && (
                                <span
                                    style={
                                        blinkingCells.some(
                                            (cellInfo) =>
                                                cellInfo.row === rowIndex &&
                                                cellInfo.col === colIndex
                                        )
                                            ? blinkingStyle
                                            : {}
                                    }
                                >
                                    {cell}
                                </span>
                            )}
                        </button>
                    ))
                )}
            </div>
            <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={resetGame}
            >
                Reset Game
            </button>
        </div>
    );
};

export default TicTacToe;
