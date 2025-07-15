const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    onlineUsers[socket.id] = username;
    io.emit("userList", Object.values(onlineUsers));
    socket.broadcast.emit("notification", `${username} joined the chat`);
  });

  socket.on("chatMessage", ({ username, message }) => {
    const timestamp = new Date().toLocaleTimeString();
    io.emit("chatMessage", { username, message, timestamp });
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("disconnect", () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit("userList", Object.values(onlineUsers));
    if (username) io.emit("notification", `${username} left the chat`);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});