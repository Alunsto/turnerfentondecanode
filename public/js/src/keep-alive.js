var socket;

$(document).ready(function() {
  socket = io.connect('http://localhost:9000');
  if (!socket.connected) {
    socket.disconnect();
    socket = io.connect('https://localhost:9000');
  }

  socket.on("connect", function() {
    socket.emit("identifyUser", {studentNumber: studentNumber});
  });
});
