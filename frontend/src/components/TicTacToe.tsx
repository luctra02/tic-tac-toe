"use client";

import { useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;

const TicTacToe = () => {
    const [board, setBoard] = useState<Cell[][]>(
        Array(3).fill(Array(3).fill(null))
    );
    const [isXNext, setIsXNext] = useState(true);
    const [playerXMoves, setPlayerXMoves] = useState<[number, number][]>([]);
    const [playerOMoves, setPlayerOMoves] = useState<[number, number][]>([]);
    const [winner, setWinner] = useState<Player | null>(null);

    const handleMove = (row: number, col: number) => {
        if (board[row][col] || winner) return;

        const currentPlayer = isXNext ? "X" : "O";
        const updatedBoard = board.map((r, rowIndex) =>
            r.map((cell, colIndex) =>
                rowIndex === row && colIndex === col ? currentPlayer : cell
            )
        );

        // Update moves
        if (isXNext) {
            if (playerXMoves.length === 3) {
                const [oldRow, oldCol] = playerXMoves.shift()!;
                updatedBoard[oldRow][oldCol] = null; // Remove oldest move
            }
            setPlayerXMoves([...playerXMoves, [row, col]]);
        } else {
            if (playerOMoves.length === 3) {
                const [oldRow, oldCol] = playerOMoves.shift()!;
                updatedBoard[oldRow][oldCol] = null; // Remove oldest move
            }
            setPlayerOMoves([...playerOMoves, [row, col]]);
        }

        setBoard(updatedBoard);
        setIsXNext(!isXNext);
        checkWinner(updatedBoard);
    };

    const checkWinner = (currentBoard: Cell[][]) => {
        const lines = [
            [currentBoard[0][0], currentBoard[0][1], currentBoard[0][2]],
            [currentBoard[1][0], currentBoard[1][1], currentBoard[1][2]],
            [currentBoard[2][0], currentBoard[2][1], currentBoard[2][2]],
            [currentBoard[0][0], currentBoard[1][0], currentBoard[2][0]],
            [currentBoard[0][1], currentBoard[1][1], currentBoard[2][1]],
            [currentBoard[0][2], currentBoard[1][2], currentBoard[2][2]],
            [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]],
            [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]],
        ];

        for (const line of lines) {
            if (line.every((cell) => cell === "X")) {
                setWinner("X");
                return;
            }
            if (line.every((cell) => cell === "O")) {
                setWinner("O");
                return;
            }
        }
    };

    const resetGame = () => {
        setBoard(Array(3).fill(Array(3).fill(null)));
        setPlayerXMoves([]);
        setPlayerOMoves([]);
        setIsXNext(true);
        setWinner(null);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-bold">Tic Tac Toe</h1>
            {winner && (
                <p className="text-lg font-semibold">{`Winner: ${winner}`}</p>
            )}
            <div className="grid grid-cols-3 gap-2">
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-32 h-32 flex items-center justify-center border-2 border-gray-400 text-2xl font-bold ${
                                cell ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                            onClick={() => handleMove(rowIndex, colIndex)}
                        >
                            {cell}
                        </div>
                    ))
                )}
            </div>
            <button
                onClick={resetGame}
                className="px-4 py-2 bg-blue-500 text-white rounded shadow"
            >
                Reset Game
            </button>
        </div>
    );
};

export default TicTacToe;
