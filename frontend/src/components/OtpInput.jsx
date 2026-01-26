import React, { useState, useRef } from "react";
import axios from "axios";

const OtpInput = ({ email, onVerifySuccess }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // Xử lý khi nhập số
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Tự động chuyển sang ô tiếp theo
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Xử lý nút Backspace (Xóa ngược)
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) return setError("Vui lòng nhập đủ 6 số");

    setLoading(true);
    setError("");
    try {
      // Gọi đến API qua Nginx (cổng 80) mà bạn đã test thành công
      const res = await axios.post("/api/otp/verify-otp", {
        email,
        otp: otpCode,
      });
      if (res.data.success) {
        onVerifySuccess(); // Thông báo cho cha là đã thành công
      }
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <h3>Xác thực OTP</h3>
      <p>
        Mã đã được gửi đến: <b>{email}</b>
      </p>

      <div className="otp-inputs">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="otp-field"
          />
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button onClick={handleVerify} disabled={loading} className="verify-btn">
        {loading ? "Đang xác thực..." : "Xác nhận"}
      </button>
    </div>
  );
};

export default OtpInput;
