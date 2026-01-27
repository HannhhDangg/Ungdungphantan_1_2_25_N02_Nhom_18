import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notify, setNotify] = useState("");

  const formatID = (id) => `HD${String(id).padStart(2, "0")}`;

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/leave_ser");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        console.log("✅ Đã tải lại danh sách đơn mới."); // <--- LOG KIỂM TRA
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- KẾT NỐI SOCKET (SỬA LẠI) ---
  useEffect(() => {
    console.log(
      "🔄 Khởi tạo kết nối Socket và tải dữ liệu..------------------------------------.",
    );
    fetchRequests();

    const socket = io("/", {
      transports: ["websocket", "polling"], // Ưu tiên Websocket
      upgrade: true,
    });

    // 2. Kiểm tra xem có kết nối được không
    socket.on("connect", () => {
      console.log("🟢 Socket đã kết nối thành công! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Lỗi kết nối Socket:", err.message);
    });

    // 3. Lắng nghe sự kiện
    socket.on("new_leave_request", (data) => {
      console.log("🔔 NHẬN ĐƯỢC THÔNG BÁO TỪ SERVER:", data); // <--- LOG QUAN TRỌNG

      setNotify(data.message);
      fetchRequests(); // Tải lại danh sách ngay
      setTimeout(() => setNotify(""), 5000);
    });

    return () => socket.disconnect();
  }, []);

  const handleUpdateStatus = async (id, status, employeeName) => {
    const actionName = status === "APPROVED" ? "DUYỆT" : "TỪ CHỐI";
    if (
      !window.confirm(
        `Bạn chắc chắn muốn ${actionName} đơn của ${employeeName}?`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/leave_ser/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        alert(`Đã ${actionName} thành công!`);
        fetchRequests();
      } else {
        alert("Lỗi xử lý.");
      }
    } catch (err) {
      alert("Lỗi kết nối server!");
    }
  };

  const getStatusColor = (status) => {
    if (status === "APPROVED")
      return { bg: "#dcfce7", text: "#166534", label: "Đã duyệt" };
    if (status === "REJECTED")
      return { bg: "#fee2e2", text: "#991b1b", label: "Từ chối" };
    return { bg: "#fef3c7", text: "#b45309", label: "Chờ duyệt" };
  };

  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    const userCode = formatID(req.user_id).toLowerCase();
    return (
      (req.full_name?.toLowerCase() || "").includes(term) ||
      (req.username?.toLowerCase() || "").includes(term) ||
      userCode.includes(term)
    );
  });

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* THÔNG BÁO NỔI */}
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
          {notify}
        </div>
      )}

      {/* THANH TÌM KIẾM & TIÊU ĐỀ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h2 style={{ color: "var(--primary-color)", margin: 0 }}>
          Quản Lý Đơn Nghỉ Phép
        </h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="🔍 Tìm Mã NV (HD..), Tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              outline: "none",
              width: "220px",
            }}
          />
          <button
            onClick={fetchRequests}
            style={{
              cursor: "pointer",
              padding: "8px 15px",
              background: "#f3f4f6",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              minWidth: "800px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  textAlign: "left",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <th style={{ padding: "12px" }}>Nhân viên</th>
                <th style={{ padding: "12px" }}>Lý do & Thời gian</th>
                <th style={{ padding: "12px" }}>Tổng ngày</th>
                <th style={{ padding: "12px" }}>Trạng thái</th>
                <th style={{ padding: "12px" }}>Thời gian duyệt</th>
                <th style={{ padding: "12px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    {searchTerm
                      ? "Không tìm thấy kết quả nào."
                      : "Hiện tại chưa có đơn nghỉ phép nào."}
                  </td>
                </tr>
              )}
              {filteredRequests.map((req) => {
                const statusStyle = getStatusColor(req.status);
                return (
                  <tr
                    key={req.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={
                            req.avatar_url
                              ? req.avatar_url
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                          }}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: "500" }}>
                            {req.full_name || req.username}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              fontWeight: "bold",
                            }}
                          >
                            {formatID(req.user_id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "500" }}>{req.reason}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {new Date(req.start_date).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(req.end_date).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {req.total_days}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "13px",
                        color: "#555",
                      }}
                    >
                      {req.approved_at ? (
                        new Date(req.approved_at).toLocaleString("vi-VN")
                      ) : (
                        <span style={{ color: "#ccc" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {req.status === "PENDING" && (
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                req.id,
                                "APPROVED",
                                req.full_name,
                              )
                            }
                            style={{
                              border: "none",
                              background: "#dcfce7",
                              color: "green",
                              cursor: "pointer",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                req.id,
                                "REJECTED",
                                req.full_name,
                              )
                            }
                            style={{
                              border: "none",
                              background: "#fee2e2",
                              color: "red",
                              cursor: "pointer",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      {req.status !== "PENDING" && (
                        <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                          Đã xử lý
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};

export default AdminDashboard;
