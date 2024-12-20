import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "websocketserver-production-5f0d.up.railway.app", // Allow requests from your frontend
        methods: ["GET", "POST"],
        credentials: true, // Allow credentials
    },
});

let onlinePlayers = 0;
const rooms = {};

io.on("connection", (socket) => {
    onlinePlayers++;
    io.emit("updateOnlinePlayers", onlinePlayers);

    // Handle room creation
    socket.on("createRoom", ({ roomID, userProfile }, callback) => {
        if (!rooms[roomID]) {
            rooms[roomID] = {
                players: [],
                roles: { X: null, O: null },
                board: Array(3)
                    .fill()
                    .map(() => Array(3).fill(null)),
                isXNext: true, // Player X starts
                winner: null,
                gameStarted: false,
            };

            rooms[roomID].players.push({ id: socket.id });
            rooms[roomID].roles["X"] = {
                id: socket.id,
                full_name: userProfile.full_name,
                avatar_url: userProfile.avatar_url,
                uuid: userProfile.uuid,
                score: 0,
            };
            socket.currentRoom = roomID;
            socket.join(roomID);

            io.emit("roomCreated", roomID);
            callback();
        } else {
            callback("Room already exists");
        }
    });

    // Handle joining a room
    socket.on("joinRoom", ({ roomID, userProfile }, callback) => {
        const room = rooms[roomID];

        if (room) {
            if (room.players.length < 2) {
                // Add the player to the room's players list with their profile information
                if (!room.roles["O"]) {
                    room.players.push({ id: socket.id });
                    room.roles["O"] = {
                        id: socket.id,
                        full_name: userProfile.full_name,
                        avatar_url: userProfile.avatar_url,
                        uuid: userProfile.uuid,
                        score: 0,
                    };
                } else {
                    room.players.push({ id: socket.id });
                    room.roles["X"] = {
                        id: socket.id,
                        full_name: userProfile.full_name,
                        avatar_url: userProfile.avatar_url,
                        uuid: userProfile.uuid,
                        score: 0,
                    };
                }
                socket.currentRoom = roomID; // Store the room ID in the socket object
                socket.join(roomID);
                callback(); // Notify the client of success
                io.to(roomID).emit("playerJoined", {
                    id: socket.id,
                    ...userProfile,
                });
                console.log(`Player ${socket.id} joined room ${roomID}`);
            } else {
                callback("Room is full");
            }
        } else {
            callback("Room does not exist");
        }
    });

    socket.on("leaveRoom", (roomID) => {
        const room = rooms[roomID];
        if (room) {
            handleDisconnect(room, roomID);
        }
    });

    socket.on("getRoomInfo", (roomID, callback) => {
        const room = rooms[roomID];
        if (room) {
            callback({
                players: room.players,
                roles: room.roles,
                isXNext: room.isXNext,
                board: room.board,
                winner: room.winner,
                gameStarted: room.gameStarted,
            });
        } else {
            callback([]);
        }
    });

    socket.on("startGame", (roomID) => {
        const room = rooms[roomID];
        if (room && room.players.length === 2) {
            room.gameStarted = true;
            io.to(roomID).emit("gameStarted");
            console.log(`Game started in room ${roomID}`);
        } else {
            console.log("Room is not full yet, can't start the game.");
        }
    });

    // Handle making a move
    socket.on("makeMove", ({ roomID, row, col }) => {
        const room = rooms[roomID];
        if (!room) return;

        if (room.winner) {
            io.to(roomID).emit("gameOver", { winner: room.winner });
            return;
        }

        if (room.board[row][col] !== null) {
            socket.emit("invalidMove", "Cell is already occupied");
            return;
        }

        // Determine the current player based on turn
        const currentPlayer = room.isXNext ? "X" : "O";
        if (room.roles[currentPlayer].id !== socket.id) {
            socket.emit("invalidMove", "It's not your turn");
            return;
        }

        // Track player's moves
        if (!room.playerMoves) {
            room.playerMoves = { X: [], O: [] };
        }

        // Check if the player already has 3 pieces on the board
        if (room.playerMoves[currentPlayer].length === 3) {
            // Remove the oldest move
            const [oldRow, oldCol] = room.playerMoves[currentPlayer].shift();
            room.board[oldRow][oldCol] = null; // Clear the oldest piece
        }

        // Add the new move to the player's move list
        room.playerMoves[currentPlayer].push([row, col]);

        // Place the player's symbol on the board
        room.board[row][col] = currentPlayer;

        // Check if either "X" or "O" have exactly 3 pieces on the board
        const xMoves = room.playerMoves["X"];
        const oMoves = room.playerMoves["O"];

        if (xMoves.length === 3 || oMoves.length === 3) {
            if (xMoves.length === 3 && oMoves.length === 3) {
                // Set both cells to blink if both have 3 pieces
                room.blinkingCell = [
                    { player: "X", row: xMoves[0][0], col: xMoves[0][1] },
                    { player: "O", row: oMoves[0][0], col: oMoves[0][1] },
                ];
            } else if (xMoves.length === 3) {
                room.blinkingCell = [
                    { player: "X", row: xMoves[0][0], col: xMoves[0][1] },
                ];
            } else if (oMoves.length === 3) {
                room.blinkingCell = [
                    { player: "O", row: oMoves[0][0], col: oMoves[0][1] },
                ];
            }
        } else {
            room.blinkingCell = null; // Clear the blinking cell if not exactly 3 pieces
        }

        room.isXNext = !room.isXNext;

        // Emit the updated game state
        io.to(roomID).emit("gameUpdate", {
            board: room.board,
            isXNext: room.isXNext,
            blinkingCell: room.blinkingCell,
        });

        const winner = checkWinner(room.board, currentPlayer);
        if (winner) {
            handleGameOver(roomID, winner);
            return;
        }
    });

    // Handle game reset
    socket.on("resetGame", (roomID) => {
        if (rooms[roomID]) {
            rooms[roomID] = {
                players: rooms[roomID].players,
                board: Array(3)
                    .fill()
                    .map(() => Array(3).fill(null)),
                roles: rooms[roomID].roles,
                isXNext: rooms[roomID].isXNext,
                winner: null,
                gameStarted: true,
            };

            // Emit the reset event to the client to clear the board and start a new game
            io.to(roomID).emit("gameReset", {
                board: rooms[roomID].board,
                isXNext: rooms[roomID].isXNext,
            });
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        const roomID = socket.currentRoom;
        if (roomID) {
            const room = rooms[roomID];
            if (room) {
                handleDisconnect(room, roomID);
            }
        }

        // Update global player count
        onlinePlayers--;
        io.emit("updateOnlinePlayers", onlinePlayers);
    });

    // Helper function to check for a winner
    function checkWinner(board, currentPlayer) {
        // Check rows and columns
        for (let i = 0; i < 3; i++) {
            if (
                board[i][0] === currentPlayer &&
                board[i][1] === currentPlayer &&
                board[i][2] === currentPlayer
            ) {
                return currentPlayer;
            }
            if (
                board[0][i] === currentPlayer &&
                board[1][i] === currentPlayer &&
                board[2][i] === currentPlayer
            ) {
                return currentPlayer;
            }
        }

        // Check diagonals
        if (
            board[0][0] === currentPlayer &&
            board[1][1] === currentPlayer &&
            board[2][2] === currentPlayer
        ) {
            return currentPlayer;
        }
        if (
            board[0][2] === currentPlayer &&
            board[1][1] === currentPlayer &&
            board[2][0] === currentPlayer
        ) {
            return currentPlayer;
        }

        // No winner
        return null;
    }

    function handleGameOver(roomID, winner) {
        const room = rooms[roomID];
        if (!room) return;
        room.winner = winner;
        room.roles[winner].score++;
        room.gameStarted = false;
        io.to(roomID).emit("gameOver", {
            winner: winner,
            X: room.roles.X,
            O: room.roles.O,
        });
        console.log(
            `Emitting gameOver to room ${roomID} with winner: ${winner}`
        );
    }

    function handleDisconnect(room, roomID) {
        const playerIndex = room.players.findIndex(
            (player) => player.id === socket.id
        );

        if (playerIndex !== -1) {
            // Remove the player object from the players array
            room.players.splice(playerIndex, 1);
            io.to(roomID).emit("playerLeft", socket.id); // Notify others in the room
            console.log(`Player ${socket.id} left room ${roomID}`);
            // Set the corresponding role to null when a player leaves

            if (room.gameStarted && room.players.length === 1) {
                if (room.roles.X.id == socket.id) {
                    handleGameOver(roomID, "O");
                } else {
                    handleGameOver(roomID, "X");
                }
            }

            if (room.roles.X && room.roles.X.id === socket.id) {
                room.roles.X = null;
            } else if (room.roles.O && room.roles.O.id === socket.id) {
                room.roles.O = null;
            }
        }

        // Optionally clean up the room if it's empty
        if (room.players.length === 0) {
            delete rooms[roomID];
            console.log(`Room ${roomID} deleted (no players left)`);
        }
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
