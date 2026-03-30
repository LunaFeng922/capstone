const express = require('express');
const app = express();
const server = require('http').createServer(app);

app.use(express.static('public'));

let socket = require('socket.io');
const io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log(' new connection: ' + socket.id);

  socket.on('stage-n', showState);
  function showState(data) {
    console.log(data);
    socket.broadcast.emit('stage-n', data);
  }

  socket.on('start-projector', () => {
    socket.broadcast.emit('start-projector');
  });

  socket.on('projector-ready', () => {
    socket.broadcast.emit('projector-ready');
  });

  socket.on('exam-start', () => {
    io.emit('exam-start');
  });

  socket.on('answer-correct', (data) => {
    io.emit('answer-correct', data);
  });

  socket.on('exam-finished', () => {
    io.emit('exam-finished'); 
});

}

server.listen(8000, () => {
  console.log("localhost:8000");
});