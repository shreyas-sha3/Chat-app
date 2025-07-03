"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const userMap = new Map(); // socket.id -> code
const codeMap = new Map(); // code -> socket.id
function broadcastUserList() {
    const users = Array.from(userMap.values());
    io.emit("users update", users);
}
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
io.on("connection", (socket) => {
    const userCode = (0, uuid_1.v4)().slice(0, 6); // Shorten for display
    userMap.set(socket.id, userCode);
    codeMap.set(userCode, socket.id);
    socket.emit("your code", userCode);
    broadcastUserList();
    console.log("A user connected");
    socket.on("disconnect", () => {
        const code = userMap.get(socket.id);
        if (code) {
            codeMap.delete(code);
        }
        userMap.delete(socket.id);
        broadcastUserList();
        console.log("User disconnected");
    });
    socket.on("chat message", (msg) => {
        console.log("message: " + msg);
        io.emit("chat message", msg);
    });
    socket.on("private message", ({ toCode, message }) => {
        const targetSocketId = codeMap.get(toCode);
        if (targetSocketId) {
            const fromCode = userMap.get(socket.id);
            io.to(targetSocketId).emit("private message", {
                from: fromCode,
                message,
            });
        }
        else {
            socket.emit("error", "User not found");
        }
    });
});
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public", "index.html"));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


import { themes } from './themes'; // added by Deva for themes