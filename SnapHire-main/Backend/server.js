const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinCaptainRoom', (captainId) => {
    socket.join(`captain_${captainId}`);
  });
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});