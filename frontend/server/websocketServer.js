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
    socket.on("createRoom", (roomID, callback) => {
        if (!rooms[roomID]) {
            // Create the room if it doesn't exist
            rooms[roomID] = { players: [] };
            console.log(`Room ${roomID} created`);

            // Broadcast that a new room was created
            io.emit("roomCreated", roomID);

            // Notify the client that the room was created
            callback();
        } else {
            // If the room already exists, handle that case
            callback("Room already exists");
        }
    });

    // Handle joining a room
    socket.on("joinRoom", (roomID, callback) => {
        const room = rooms[roomID];

        if (room && room.players.length < 2) {
            // Add the player to the room if it's not full (assuming 2 players max per room)
            room.players.push(socket.id);
            console.log(`Player joined room ${roomID}`);

            // Notify the client that they joined the room
            callback();

            // Optionally, broadcast the updated players in the room
            io.to(roomID).emit("playerJoined", socket.id);
        } else if (room && room.players.length >= 2) {
            callback("Room is full");
        } else {
            callback("Room does not exist");
        }
    });

    // Handle player disconnection
    socket.on("disconnect", () => {
        onlinePlayers--;
        io.emit("updateOnlinePlayers", onlinePlayers);

        // Remove player from any room they were in
        for (const roomID in rooms) {
            const room = rooms[roomID];
            const index = room.players.indexOf(socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                io.to(roomID).emit("playerLeft", socket.id); // Notify others in the room
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
