const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { createClient } = require("redis");

// Cấu hình máy chủ gửi mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hnd10112005@gmail.com",
    pass: "cqzx yepa spwn twwa", // Đảm bảo mật khẩu ứng dụng không có khoảng trắng
  },
});

// --- API 1: GỬI MÃ OTP ---
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Thiếu email!" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const redisClient = createClient({ url: "redis://redis:6379" });
    await redisClient.connect();
    await redisClient.setEx(`otp:${email}`, 300, otp);
    await redisClient.disconnect();

    const mailOptions = {
      from: '"Hệ thống Nghỉ phép" <hnd10112005@gmail.com>',
      to: email,
      subject: "Mã xác thực OTP của bạn",
      html: `<h3>Mã OTP của bạn là: <b style="color:red;">${otp}</b></h3>
             <p>Mã này sẽ hết hạn sau 5 phút.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Mã OTP đã được gửi vào email!" });
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    res.status(500).json({ message: "Không thể gửi email!" });
  }
});

// --- API 2: XÁC THỰC MÃ OTP (Bổ sung phần bị thiếu) ---
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Thiếu email hoặc mã OTP!" });
  }

  try {
    // 1. Kết nối Redis để lấy mã đã lưu
    const redisClient = createClient({ url: "redis://redis:6379" });
    await redisClient.connect();
    const storedOtp = await redisClient.get(`otp:${email}`);

    // 2. Kiểm tra mã
    if (!storedOtp) {
      await redisClient.disconnect();
      return res
        .status(400)
        .json({ message: "Mã OTP đã hết hạn hoặc không tồn tại!" });
    }

    if (storedOtp === otp) {
      // Xác thực thành công: Xóa mã ngay lập tức để bảo mật
      await redisClient.del(`otp:${email}`);
      await redisClient.disconnect();
      return res.json({ success: true, message: "Xác thực OTP thành công!" });
    } else {
      await redisClient.disconnect();
      return res.status(400).json({ message: "Mã OTP không chính xác!" });
    }
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi xác thực!" });
  }
});

const bcrypt = require("bcryptjs"); // Đảm bảo đã import bcrypt
const pool = require("../db"); // Import kết nối Postgres của bạn

// API: Đặt lại mật khẩu mới
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const redisClient = createClient({ url: "redis://redis:6379" });
    await redisClient.connect();
    const storedOtp = await redisClient.get(`otp:${email}`);

    if (storedOtp && storedOtp === otp) {
      // 1. Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 2. Cập nhật vào PostgreSQL
      await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
        hashedPassword,
        email,
      ]);

      await redisClient.del(`otp:${email}`);
      await redisClient.disconnect();
      return res.json({ success: true, message: "Đổi mật khẩu thành công!" });
    } else {
      await redisClient.disconnect();
      return res
        .status(400)
        .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

module.exports = router;
