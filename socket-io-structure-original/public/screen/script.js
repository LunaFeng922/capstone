let socket;
let stage = 0;

function setup() {
  createCanvas(400, 400);

  socket = io.connect('localhost:8000');
  socket.on('CONNECTION_NAME', receiveData);
}

function draw() {
  background(255, 255, 0);
  if (stage == 3) background(255, 0, 255);
  text("screen", 10, 29);
}

function receiveData(data) {
  console.log(data);
  stage = data.stage;
}

