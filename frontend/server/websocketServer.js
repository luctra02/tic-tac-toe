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
        console.log(roomID, userProfile);
        if (!rooms[roomID]) {
            rooms[roomID] = { players: [] };
            console.log(rooms);

            // Add the player to the room
            rooms[roomID].players.push({ id: socket.id, ...userProfile });
            socket.currentRoom = roomID; // Store the room ID in the socket object

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

                console.log(`Player ${socket.id} joined room ${roomID}`);
                console.log(room);

                callback(); // Notify the client of success
                io.to(roomID).emit("playerJoined", {
                    id: socket.id,
                    ...userProfile,
                }); // Broadcast player join with profile data
            } else {
                callback("Room is full");
            }
        } else {
            callback("Room does not exist");
        }
    });

    // Handle leaving a room
    socket.on("leaveRoom", (roomID) => {
        const room = rooms[roomID];
        if (room) {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                console.log(`Player ${socket.id} left room ${roomID}`);
                io.to(roomID).emit("playerLeft", socket.id); // Notify others in the room
            }

            // Optionally clean up the room if it's empty
            if (room.players.length === 0) {
                delete rooms[roomID];
                console.log(`Room ${roomID} deleted (no players left)`);
            }
        }

        // No need to update `onlinePlayers` count unless a full disconnect happens
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        const roomID = socket.currentRoom;
        if (roomID) {
            const room = rooms[roomID];
            const playerIndex = room?.players.indexOf(socket.id);

            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                console.log(`Player ${socket.id} left room ${roomID}`);
                io.to(roomID).emit("playerLeft", socket.id); // Notify others in the room
            }

            // Optionally, clean up if the room is empty
            if (room && room.players.length === 0) {
                delete rooms[roomID];
                console.log(`Room ${roomID} deleted (no players left)`);
            }
        }

        // Update global player count
        onlinePlayers--;
        io.emit("updateOnlinePlayers", onlinePlayers);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
