const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const CLIENT_PORT = process.env.CLIENT_PORT || 5173;

const io = new Server(server, {
  cors: {
    origin: [`http://localhost:${CLIENT_PORT}`],
  },
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

io.on("connection", (socket) => {
  console.log(`connect: ${socket.id}`);

  socket.on("hello!", () => {
    console.log(`hello from ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`disconnect: ${socket.id}`);
  });
});

io.listen(3001);

setInterval(() => {
  io.emit("message", new Date().toISOString());
}, 1000);
