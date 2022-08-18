import { io } from "socket.io-client";

const socket = io("ws://localhost:3000");
  
socket.on("chat-message", (data) => {
  console.log(`${data}`);
});

socket.on("user-connected", (name) => {
  console.log(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  console.log(`${name} disconnected`);
});

export default socket;
