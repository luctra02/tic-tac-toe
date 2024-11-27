"use client";

import { useEffect, useState } from "react";
import { useSocketContext } from "@/components/SocketProvider";

type Cell = Player | null;

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


    //Connect component to the websocketserver
    useEffect(() => {
        if (!socket) return;

        socket.emit("getRoomRoles", roomID, (roles: Roles | null) => {
            if (roles) {
                setRoles(roles);
            } else {
                console.log("Room not found");
            }
        });

        // Listen for game updates
        socket.on(
            "gameUpdate",
            ({ board, isXNext }: { board: Cell[][]; isXNext: boolean }) => {
                setBoard(board);
                setIsXNext(isXNext); // Update the turn state
            }
        );

        // Listen for game reset
        socket.on(
            "gameReset",
            ({ board, isXNext }: { board: Cell[][]; isXNext: boolean }) => {
                setBoard(board);
                setIsXNext(isXNext);
                setWinner(null);
            }
        );

        return () => {
            socket.off("gameUpdate");
            socket.off("gameReset");
        };
    }, [roomID, socket]);

    // Handle user moves
    const handleMove = (row: number, col: number) => {
        if (board[row][col] || winner) return; // Check if cell is occupied or game is over

        // Emit the move to the server with the passed roomID
        socket?.emit("makeMove", { roomID, row, col });
    };

    // Reset the game by emitting the reset event to the server
    const resetGame = () => {
        socket?.emit("resetGame", roomID);
    };

    console.log(roles);

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
                <p className="text-lg font-semibold">{`Winner: ${winner}`}</p>
            )}
            <div className="grid grid-cols-3 gap-2">
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <button
                            key={`${rowIndex}-${colIndex}`}
                            className="w-16 h-16 border border-gray-300 flex items-center justify-center text-2xl"
                            onClick={() => handleMove(rowIndex, colIndex)}
                            disabled={cell !== null || winner !== null}
                        >
                            {cell}
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
