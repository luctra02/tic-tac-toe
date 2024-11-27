import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow requests from your frontend
        methods: ["GET", "POST"],
        credentials: true, // Allow credentials
    },
});

let onlinePlayers = 0;
const rooms = {}; // Store room data (room ID -> list of player IDs)

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
            };

            rooms[roomID].players.push({ id: socket.id, ...userProfile });
            rooms[roomID].roles["X"] = {
                id: socket.id,
                full_name: userProfile.full_name,
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
                room.players.push({ id: socket.id, ...userProfile });
                room.roles["O"] = {
                    id: socket.id,
                    full_name: userProfile.full_name,
                };
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
            // Find the index of the player object by matching socket.id with the player id
            const playerIndex = room.players.findIndex(
                (player) => player.id === socket.id
            );

            if (playerIndex !== -1) {
                // Remove the player object from the players array
                room.players.splice(playerIndex, 1);
                io.to(roomID).emit("playerLeft", socket.id); // Notify others in the room
                console.log(`Player ${socket.id} left room ${roomID}`);
            }

            // Optionally clean up the room if it's empty
            if (room.players.length === 0) {
                delete rooms[roomID];
                console.log(`Room ${roomID} deleted (no players left)`);
            }
            if (typeof callback === "function") {
                callback();
            }
        }

        // No need to update `onlinePlayers` count unless a full disconnect happens
    });

    socket.on("getRoomUsers", (roomID, callback) => {
        const room = rooms[roomID];
        if (room) {
            // Return the list of players in the room
            callback(room.players);
        } else {
            callback([]); 
        }
    });

    socket.on("getRoomRoles", (roomID, callback) => {
        const room = rooms[roomID];
        if (room) {
            // Return the list of players in the room
            callback(room.roles);
        } else {
            callback([]); 
        }
    });

    socket.on("startGame", (roomID) => {
        const room = rooms[roomID];
        if (room && room.players.length === 2) {
            // Notify the players that the game has started
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
        console.log(currentPlayer);
        if (room.roles[currentPlayer].id !== socket.id) {
            socket.emit("invalidMove", "It's not your turn");
            return;
        }

        // Make the move
        room.board[row][col] = currentPlayer;
        room.isXNext = !room.isXNext; // Switch the turn

        // Check for a winner
        io.to(roomID).emit("gameUpdate", {
            board: room.board,
            isXNext: room.isXNext,
        });
        const winner = checkWinner(room.board);
        if (winner) {
            room.winner = winner;
            io.to(roomID).emit("gameOver", { winner });
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
                isXNext: true, 
                winner: null, 
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
            const playerIndex = room.players.findIndex(
                (player) => player.id === socket.id
            );

            if (playerIndex !== -1) {
                // Remove the player object from the players array
                room.players.splice(playerIndex, 1);
                io.to(roomID).emit("playerLeft", socket.id); // Notify others in the room
                console.log(`Player ${socket.id} left room ${roomID}`);
            }

            // Optionally clean up the room if it's empty
            if (room.players.length === 0) {
                delete rooms[roomID];
                console.log(`Room ${roomID} deleted (no players left)`);
            }
        }

        // Update global player count
        onlinePlayers--;
        io.emit("updateOnlinePlayers", onlinePlayers);
    });

    // Helper function to check for a winner
    function checkWinner(board) {
        // Check rows and columns
        for (let i = 0; i < 3; i++) {
            if (
                board[i][0] &&
                board[i][0] === board[i][1] &&
                board[i][1] === board[i][2]
            ) {
                return board[i][0];
            }
            if (
                board[0][i] &&
                board[0][i] === board[1][i] &&
                board[1][i] === board[2][i]
            ) {
                return board[0][i];
            }
        }
        // Check diagonals
        if (
            board[0][0] &&
            board[0][0] === board[1][1] &&
            board[1][1] === board[2][2]
        ) {
            return board[0][0];
        }
        if (
            board[0][2] &&
            board[0][2] === board[1][1] &&
            board[1][1] === board[2][0]
        ) {
            return board[0][2];
        }
        return null;
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
