import { useState, useEffect } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- HÀM TẠO ID DẠNG HD01, HD02... ---
  const formatID = (id) => {
    // Nếu id < 10 thì thêm số 0 đằng trước (VD: 5 -> 05), ngược lại giữ nguyên
    return `HD${String(id).padStart(2, "0")}`;
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        console.log("Dữ liệu nhận được từ API:", data); // Thêm dòng này để kiểm tra F12
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    console.log("Gọi fetchUsers từ useEffect");
  }, []);

  const handleToggleStatus = async (user) => {
    if (user.role === "ADMIN") return alert("Không thể khóa tài khoản Admin!");
    const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    const confirmMsg =
      user.status === "ACTIVE"
        ? `Khóa tài khoản ${user.username}?`
        : `Kích hoạt tài khoản ${user.username}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert("Cập nhật thành công!");
        console.log("Cập nhật trạng thái thành công cho user ID:", user.id);
        fetchUsers();
      } else {
        alert("Lỗi cập nhật!");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  // --- LOGIC LỌC NÂNG CAO (TÊN, EMAIL, ID) ---
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const formattedID = formatID(u.id).toLowerCase(); // Tạo ID giả để tìm kiếm (hd01)

    return (
      (u.full_name?.toLowerCase() || "").includes(term) ||
      (u.username?.toLowerCase() || "").includes(term) ||
      (u.email?.toLowerCase() || "").includes(term) ||
      formattedID.includes(term) // <--- Cho phép tìm theo HD01
    );
  });

  return (
    <div className="card">
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
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            outline: "none",
            width: "280px",
          }}
        />
      </div>

      {loading ? (
        <p>Đang tải...</p>
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
              <th style={{ padding: "10px" }}>Mã NV</th> {/* Đổi tên cột */}
              <th style={{ padding: "10px" }}>Nhân viên</th>
              <th style={{ padding: "10px" }}>Vai trò</th>
              <th style={{ padding: "10px" }}>Quỹ phép</th>
              <th style={{ padding: "10px" }}>Trạng thái</th>
              <th style={{ padding: "10px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  Không tìm thấy nhân viên nào.
                </td>
              </tr>
            )}
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                {/* HIỂN THỊ ID DẠNG HDxx */}
                <td
                  style={{ padding: "10px", fontWeight: "bold", color: "#666" }}
                >
                  {formatID(u.id)}
                </td>

                <td style={{ padding: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={
                        u.avatar_url
                          ? u.avatar_url
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        {u.full_name || u.username}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px" }}>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: u.role === "ADMIN" ? "red" : "blue",
                    }}
                  >
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>{u.max_leave_days} ngày</td>
                <td style={{ padding: "10px" }}>
                  {u.status === "ACTIVE" ? (
                    <span
                      style={{
                        color: "green",
                        background: "#dcfce7",
                        padding: "4px 8px",
                        borderRadius: "10px",
                        fontSize: "12px",
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
                        fontSize: "12px",
                      }}
                    >
                      Chờ duyệt / Khóa
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {u.role !== "ADMIN" && (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        background:
                          u.status === "ACTIVE" ? "#fee2e2" : "#dcfce7",
                        color: u.status === "ACTIVE" ? "#991b1b" : "#166534",
                      }}
                    >
                      {u.status === "ACTIVE" ? "🔒 Khóa" : "🔓 Kích hoạt"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
