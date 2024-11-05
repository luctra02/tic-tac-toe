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

io.on("connection", (socket) => {
    onlinePlayers++;
    io.emit("updateOnlinePlayers", onlinePlayers);

    socket.on("disconnect", () => {
        onlinePlayers--;
        io.emit("updateOnlinePlayers", onlinePlayers);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
