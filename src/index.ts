import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userMap = new Map<string, string>(); // socket.id -> code
const codeMap = new Map<string, string>(); // code -> socket.id

function broadcastUserList() {
  const users = Array.from(userMap.values());
  io.emit("users update", users);
}

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket: Socket) => {
  const userCode = uuidv4().slice(0, 6); // Shorten for display
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

  socket.on("chat message", (msg: string) => {
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
    } else {
      socket.emit("error", "User not found");
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

