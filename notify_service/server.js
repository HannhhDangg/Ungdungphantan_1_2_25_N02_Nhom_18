const express = require("express");
const cors = require("cors");
const pool = require("./db");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const mongoose = require("mongoose"); // 🔥 THIẾU DÒNG NÀY

// Import routes
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;

// --- CẤU HÌNH SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- CẤU HÌNH REDIS ---
const redisUrl = `redis://${redisHost}:${redisPort}`;
(async () => {
  try {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log(`✅ Socket.io đã kết nối Redis tại ${redisUrl}`);
  } catch (err) {
    console.warn("⚠️ Không thể kết nối Redis, chạy mặc định.");
  }
})();

app.set("socketio", io);
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sử dụng Routes

app.use("/api/users", userRoutes);

// --- 🔥 KẾT NỐI MONGODB (Đã sửa vị trí) ---
const mongoURI = process.env.MONGO_URI || "mongodb://db-mongo:27017/leave_logs"; // Chú ý: dùng 'db-mongo' theo tên container trong log của bạn
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Đã kết nối MongoDB thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// API Test
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json({ message: "DB OK", count: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: "Lỗi DB" });
  }
});

server.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
