import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create express app and http server
const app = express();
const server = http.createServer(app);
// Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});
// Store online users
// {userId:socketId}
export const userSocketMap = {};
// Socket.io connection handler
// io.on: nghe khi có client kết nối
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  //   Emit online users to all connected client
  //  io.emit:Gửi dữ liệu cho client đã kết nối (kể cả ng gửi)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  // socket.on: Nhận dữ liệu từ client
  socket.on("disconnect", () => {
    console.log("User disconnect", userId);
    delete userSocketMap[userId];
    // gửi lại ds ng online sau khi cập nhật lại
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
// Middleware setup
app.use(express.json({ limit: "4mb" }));

app.use(cors());
// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
// connect db
await connectDB();
if (process.env.NODE_ENV != "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("Server is running on Port :" + PORT));
}
export default server;
