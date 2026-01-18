import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State form (Dữ liệu nhập vào từ ô input)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "STAFF",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      // Chuẩn bị dữ liệu gửi đi
      // Khi đăng ký: Backend cần "fullName", "phone" (như khai báo ở backend routes)
      // Khi đăng nhập: Chỉ cần username, password
      const bodyData = isRegister
        ? {
            username: formData.username,
            password: formData.password,
            fullName: formData.fullName, // Gửi đúng tên biến Backend chờ
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          }
        : {
            username: formData.username,
            password: formData.password,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Có lỗi xảy ra");
      } else {
        // --- XỬ LÝ THÀNH CÔNG ---
        if (isRegister) {
          alert("Đăng ký thành công! Vui lòng chờ Admin xét duyệt.");
          setIsRegister(false); // Chuyển về form đăng nhập
        } else {
          alert("Đăng nhập thành công!");

          // 1. Lưu Token
          localStorage.setItem("token", data.token);

          // 2. Lưu User (Lúc này data.user đã có đủ email, avatar nhờ sửa Backend)
          localStorage.setItem("user", JSON.stringify(data.user));

          // 3. Chuyển trang
          if (data.user.role === "ADMIN" || data.user.role === "MANAGER") {
            navigate("/admin");
          } else {
            navigate("/employee");
          }
        }
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Không kết nối được tới Server backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2
          style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}
        >
          {isRegister ? "Đăng Ký Tài Khoản" : "Đăng Nhập"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <>
              <input
                required
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                style={styles.input}
              />
              <input
                required
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={styles.input}
              />
              <input
                required
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                style={styles.input}
              />
            </>
          )}

          <input
            required
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            style={styles.input}
          />
          <input
            required
            placeholder="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading
              ? "Đang xử lý..."
              : isRegister
              ? "Gửi Đăng Ký"
              : "Đăng Nhập"}
          </button>
        </form>

        <p style={styles.link} onClick={() => setIsRegister(!isRegister)}>
          {isRegister
            ? "Đã có tài khoản? Đăng nhập ngay"
            : "Chưa có tài khoản? Đăng ký tại đây"}
        </p>
      </div>
    </div>
  );
};

// CSS viết gọn vào object
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "12px",
    background: "#1890ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "0.3s",
  },
  link: {
    textAlign: "center",
    marginTop: "20px",
    color: "#1890ff",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Login;
