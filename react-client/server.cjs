const PORT = 5173;

const io = require("socket.io")({
  cors: {
    origin: [`http://localhost:${PORT}`],
  },
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
