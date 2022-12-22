import { createServer } from "node:http";
import path from "node:path";
import * as url from "node:url";

import express from "express";
import { Server } from "socket.io";
import Filter from "bad-words";

import { generateLocationMessage, generateMessage } from "./utils/messages.mjs";
import { addUser, getUser, getUsersInRoom, removeUser } from "./utils/users.mjs";

const { PORT } = process.env;

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
    console.log("New WebSocket connection");

    socket.on("join", (options, acknowledge) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return acknowledge(error);
        }

        socket.join(user.room);

        socket.emit("message", generateMessage("Admin", "Welcome"));
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        acknowledge();
    });

    socket.on("sendMessage", (message, acknowledge) => {
        const user = getUser(socket.id);

        const filter = new Filter();

        if (filter.isProfane(message)) {
            return acknowledge("Profanity is not allowed!");
        }

        io.to(user.room).emit("message", generateMessage(user.username, message));
        acknowledge();
    });

    socket.on("sendLocation", (coords, acknowledge) => {
        const user = getUser(socket.id);

        socket.broadcast.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://maps.google.com/?q=${coords.latitude},${coords.longitude})`));
        acknowledge();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }

    });
});

server.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});
