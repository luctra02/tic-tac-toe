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
            rooms[roomID] = { players: [] };

            // Add the player to the room
            rooms[roomID].players.push({ id: socket.id, ...userProfile });
            socket.currentRoom = roomID; // Store the room ID in the socket object
            socket.join(roomID);

            console.log(
                `Room ${roomID} created with players: ${rooms[roomID]}`
            );

            // Broadcast that a new room was created
            io.emit("roomCreated", roomID);

            // Notify the client that the room was created
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
                socket.currentRoom = roomID; // Store the room ID in the socket object
                socket.join(roomID);
                callback(); // Notify the client of success
                io.to(roomID).emit("playerJoined", {
                    id: socket.id,
                    ...userProfile,
                }); // Broadcast player join with profile data
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
            callback([]); // Return an empty array if the room does not exist
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
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
