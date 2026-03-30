let socket;

function setup() {
  createCanvas(400, 400);

  socket = io.connect('localhost:8000');
  //socket.on('CONNECTION_NAME', receiveData);
}

function draw() {
  background(255, 0, 0);
  text("phone", 10, 29);
}

function mousePressed() {
  //JS Object
  let data = {
    stage: 3,
  }
  socket.emit('CONNECTION_NAME', data);
}