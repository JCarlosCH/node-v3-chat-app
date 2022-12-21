import { createServer } from "node:http";
import path from "node:path";
import * as url from "node:url";

import express from "express";
import { Server } from "socket.io";

const { PORT } = process.env;

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(publicDirectoryPath));

io.on("connection", () => {
    console.log("New WebSocket connection");
});

server.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});
