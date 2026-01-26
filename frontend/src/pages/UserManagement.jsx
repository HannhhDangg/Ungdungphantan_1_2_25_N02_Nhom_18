import { useState, useEffect } from "react";
import { io } from "socket.io-client"; // Thư viện kết nối Socket phía Client

const UserManagement = () => {
  // --- KHAI BÁO CÁC STATE (TRẠNG THÁI) ---
  const [users, setUsers] = useState([]); // Lưu danh sách nhân viên lấy từ database
  const [loading, setLoading] = useState(true); // Trạng thái hiển thị chữ "Đang tải..."
  const [searchTerm, setSearchTerm] = useState(""); // Lưu từ khóa tìm kiếm người dùng nhập
  const [notify, setNotify] = useState(""); // Lưu nội dung thông báo khi có đơn mới (Toast)

  // --- HÀM TRỢ GIÚP: ĐỊNH DẠNG MÃ NHÂN VIÊN (VÍ DỤ: 5 -> HD05) ---
  const formatID = (id) => {
    // String(id).padStart(2, "0") đảm bảo ID luôn có 2 chữ số (VD: 1 thành 01)
    return `HD${String(id).padStart(2, "0")}`;
  };

  // --- HÀM GỌI API LẤY DANH SÁCH NHÂN VIÊN ---
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users"); // Gọi đến Router Backend xử lý SELECT dữ liệu
      if (res.ok) {
        const data = await res.json();
        setUsers(data); // Đưa dữ liệu vào State để render ra bảng
      }
    } catch (err) {
      console.error("Lỗi khi fetch users:", err);
    } finally {
      setLoading(false); // Dừng hiển thị loading sau khi đã nhận xong dữ liệu
    }
  };

  // --- EFFECT: KHỞI TẠO DỮ LIỆU VÀ THIẾT LẬP KẾT NỐI SOCKET ---
  useEffect(() => {
    fetchUsers(); // Lấy danh sách nhân viên ngay khi vừa mở trang

    // Thiết lập kết nối Socket thông qua Nginx (Gateway cổng 80)
    const socket = io("/", {
      transports: ["websocket", "polling"], // Các giao thức ưu tiên (WebSocket nhanh hơn)
      upgrade: true,
    });

    socket.on("connect", () => {
      console.log("🟢 UserManagement đã kết nối Socket thành công!");
    });

    // 🔔 LẮNG NGHE SỰ KIỆN: "new_leave_request" (Có đơn nghỉ phép mới được gửi)
    socket.on("new_leave_request", (data) => {
      console.log("🔔 Nhận tín hiệu Real-time từ Redis:", data);
      setNotify(data.message); // Hiển thị nội dung thông báo nổi lên màn hình

      // Sau 5 giây, tự động xóa thông báo khỏi màn hình
      setTimeout(() => setNotify(""), 5000);
    });

    // Hàm dọn dẹp (Cleanup): Ngắt kết nối socket khi người dùng rời khỏi Component này
    return () => socket.disconnect();
  }, []);

  // --- HÀM XỬ LÝ KHÓA/MỞ TÀI KHOÀN (ADMIN ACTION) ---
  const handleToggleStatus = async (user) => {
    // Chặn không cho phép Admin tự khóa chính mình (đảm bảo tính an toàn)
    if (user.role === "ADMIN") return alert("Không thể khóa tài khoản Admin!");

    // Xác định trạng thái mới dựa trên trạng thái hiện tại
    const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";

    // Yêu cầu Admin xác nhận thao tác qua cửa sổ Confirm
    const confirmMsg =
      user.status === "ACTIVE"
        ? `Bạn có chắc muốn KHÓA tài khoản ${user.username}?`
        : `Bạn có chắc muốn KÍCH HOẠT tài khoản ${user.username}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // Gửi yêu cầu cập nhật trạng thái lên Server qua phương thức PUT
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert("Cập nhật trạng thái thành công!");
        fetchUsers(); // Gọi lại hàm lấy dữ liệu để cập nhật bảng ngay lập tức
      } else {
        alert("Lỗi khi cập nhật trạng thái!");
      }
    } catch (err) {
      alert("Lỗi kết nối đến Server");
    }
  };

  // --- LOGIC LỌC TÌM KIẾM TẠI CLIENT ---
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase(); // Viết thường từ khóa để so sánh không phân biệt hoa thường
    const formattedID = formatID(u.id).toLowerCase(); // So sánh với cả mã HDxx

    return (
      (u.full_name?.toLowerCase() || "").includes(term) || // Tìm theo tên
      (u.username?.toLowerCase() || "").includes(term) || // Tìm theo username
      (u.email?.toLowerCase() || "").includes(term) || // Tìm theo email
      formattedID.includes(term) // Tìm theo mã NV (HD01, HD02...)
    );
  });

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* 1. HIỂN THỊ THÔNG BÁO NỔI (TOAST NOTIFICATION) */}
      {notify && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#10b981",
            color: "white",
            padding: "15px 25px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontWeight: "bold",
            zIndex: 9999,
            animation: "slideIn 0.5s ease",
          }}
        >
          🔔 {notify}
        </div>
      )}

      {/* 2. THANH TIÊU ĐỀ VÀ Ô TÌM KIẾM */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "var(--primary-color)", margin: 0 }}>
          Quản Lý Nhân Sự
        </h2>
        <input
          type="text"
          placeholder="🔍 Tìm ID (HD..), tên, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật State liên tục khi gõ
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            width: "280px",
          }}
        />
      </div>

      {/* 3. BẢNG DỮ LIỆU NHÂN VIÊN */}
      {loading ? (
        <p>Đang tải dữ liệu nhân viên...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f9fafb",
                textAlign: "left",
                borderBottom: "2px solid #ddd",
              }}
            >
              <th style={{ padding: "10px" }}>Mã NV</th>
              <th style={{ padding: "10px" }}>Nhân viên</th>
              <th style={{ padding: "10px" }}>Vai trò</th>
              <th style={{ padding: "10px" }}>Quỹ phép</th>
              <th style={{ padding: "10px" }}>Trạng thái</th>
              <th style={{ padding: "10px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Không tìm thấy nhân viên nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                  {/* Cột mã nhân viên định dạng HDxx */}
                  <td
                    style={{
                      padding: "10px",
                      fontWeight: "bold",
                      color: "#666",
                    }}
                  >
                    {formatID(u.id)}
                  </td>

                  {/* Cột thông tin chi tiết */}
                  <td style={{ padding: "10px" }}>
                    <div style={{ fontWeight: "bold" }}>
                      {u.full_name || u.username}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {u.email}
                    </div>
                  </td>

                  {/* Cột vai trò (Admin/Staff) */}
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        color: u.role === "ADMIN" ? "red" : "blue",
                        fontWeight: "bold",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: "10px" }}>{u.max_leave_days} ngày</td>

                  {/* Cột trạng thái với màu sắc trực quan */}
                  <td style={{ padding: "10px" }}>
                    {u.status === "ACTIVE" ? (
                      <span
                        style={{
                          color: "green",
                          background: "#dcfce7",
                          padding: "4px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        Hoạt động
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#b45309",
                          background: "#fef3c7",
                          padding: "4px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        Bị khóa
                      </span>
                    )}
                  </td>

                  {/* Cột hành động quản trị */}
                  <td style={{ padding: "10px" }}>
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "none",
                          background:
                            u.status === "ACTIVE" ? "#fee2e2" : "#dcfce7",
                          color: u.status === "ACTIVE" ? "#991b1b" : "#166534",
                          fontWeight: "bold",
                        }}
                      >
                        {u.status === "ACTIVE" ? "🔒 Khóa" : "🔓 Kích hoạt"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Định nghĩa CSS Animation cho hiệu ứng trượt thông báo */}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

export default UserManagement;
