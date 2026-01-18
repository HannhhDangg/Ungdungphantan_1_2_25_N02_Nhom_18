const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const LeaveLog = require("../models/LeaveLog");

// --- CẤU HÌNH UPLOAD ẢNH (SỬA ĐƯỜNG DẪN TUYỆT ĐỐI) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Sử dụng đường dẫn tuyệt đối dựa trên thư mục gốc của project trong Docker
    // Điều này đảm bảo Multer luôn tìm thấy folder /app/uploads
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "user-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// --- 1. ADMIN: Lấy danh sách toàn bộ nhân viên ---
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, email, phone_number, role, status, avatar_url, max_leave_days FROM users ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// --- 2. ADMIN: Kích hoạt / Khóa tài khoản ---
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query("UPDATE users SET status = $1 WHERE id = $2", [
      status,
      id,
    ]);

    await LeaveLog.create({
      leave_request_id: 0,
      user_id: id,
      action: "UPDATE_STATUS",
      performed_by: "ADMIN",
      details: { new_status: status },
    });

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
});

// --- 3. User tự cập nhật hồ sơ ---
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.params.id,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", upload.single("avatar"), async (req, res) => {
  const { id } = req.params;
  const { full_name, phone_number } = req.body;

  try {
    const oldUser = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const currentUser = oldUser.rows[0];

    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const newFullName = full_name || currentUser.full_name;
    const newPhone = phone_number || currentUser.phone_number;
    let newAvatarUrl = currentUser.avatar_url;

    if (req.file) {
      // Lưu đường dẫn tương đối để frontend có thể gọi qua static middleware
      newAvatarUrl = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE users SET full_name = $1, phone_number = $2, avatar_url = $3 WHERE id = $4 RETURNING *`,
      [newFullName, newPhone, newAvatarUrl, id],
    );

    // 🔥 GHI LOG VÀO MONGODB
    await LeaveLog.create({
      leave_request_id: 0,
      user_id: id,
      action: "UPDATE_PROFILE",
      performed_by: "USER",
      details: {
        old_name: currentUser.full_name,
        new_name: newFullName,
        avatar_changed: !!req.file,
        reason_text: "Cập nhật thông tin cá nhân", // Bổ sung để dữ liệu đầy đủ hơn
      },
    });

    res.json({ message: "Update OK", user: result.rows[0] });
  } catch (err) {
    console.error("Lỗi cập nhật hồ sơ:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
