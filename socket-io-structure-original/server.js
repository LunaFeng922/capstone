const express = require('express');
const app = express();
const server = require('http').createServer(app);

app.use(express.static('public'));

let socket = require('socket.io');
const io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log(' new connection: ' + socket.id);

  socket.on('CONNECTION_NAME', showState);
  function showState(data) {
    console.log(data);
    socket.broadcast.emit('CONNECTION_NAME', data);
  }
}

server.listen(8000);
console.log("localhost:8000");
