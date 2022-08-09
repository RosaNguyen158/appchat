import app from ("express");
import http from("http").Server(app);
import io from ("socket.io")(http);

app.get("/chat", function (req, res) {
  res.sendFile(__dirname + "/chat.html");
});

io.on("connection", function (socket) {
  socket.on("chat message", function (msg) {
    io.emit("chat message", msg);
  });
});

http.listen(3000, function () {
  console.log("listening on *:3000");
});
