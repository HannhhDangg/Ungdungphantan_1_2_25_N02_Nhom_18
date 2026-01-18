import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify"; // Import toast

const LeavePage = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user")));

  const [formData, setFormData] = useState({
    reason: "",
    start_date: "",
    end_date: "",
  });
  const [totalDays, setTotalDays] = useState(0);
  const [leaves, setLeaves] = useState([]);

  // Hàm tải danh sách đơn
  const fetchLeaves = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/leaves/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    }
  }, [user?.id]);

  // --- 🔥 LOGIC SOCKET: LẮNG NGHE ADMIN DUYỆT 🔥 ---
  useEffect(() => {
    fetchLeaves(); // Tải dữ liệu lần đầu

    // 1. Kết nối Socket
    const socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
    });

    // 2. Lắng nghe sự kiện
    socket.on("leave_status_update", (data) => {
      // So sánh ID (dùng == cho an toàn)
      if (data.target_user_id == user.id) {
        console.log("🔔 Nhận thông báo:", data);

        // Hiển thị Toast đẹp
        if (data.status === "APPROVED") {
          toast.success(data.message);
        } else if (data.status === "REJECTED") {
          toast.error(data.message);
        } else {
          toast.info(data.message);
        }

        // Load lại bảng lịch sử ngay lập tức
        fetchLeaves();
      }
    });

    // 3. Cleanup khi rời trang
    return () => socket.disconnect();
  }, [fetchLeaves, user.id]);
  // ----------------------------------------------------

  // Tự động tính số ngày
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays > 0 ? diffDays : 0);
    }
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalDays <= 0)
      return toast.warning("Ngày kết thúc phải sau ngày bắt đầu!");

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          reason: formData.reason,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_days: totalDays,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Gửi đơn thành công! 🚀"); // Thay alert bằng toast
        setFormData({ reason: "", start_date: "", end_date: "" });
        setTotalDays(0);
        fetchLeaves();
      } else {
        toast.error(data.message || "Có lỗi xảy ra"); // Thay alert bằng toast
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span
            style={{
              color: "green",
              background: "#dcfce7",
              padding: "4px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            ✅ Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span
            style={{
              color: "red",
              background: "#fee2e2",
              padding: "4px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            ❌ Từ chối
          </span>
        );
      default:
        return (
          <span
            style={{
              color: "#b45309",
              background: "#fef3c7",
              padding: "4px 8px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            ⏳ Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "var(--primary-color)" }}>
        Nghỉ phép
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "20px",
        }}
      >
        {/* FORM TẠO ĐƠN */}
        <div className="card" style={styles.card}>
          <h3 style={{ marginTop: 0, color: "#2563eb", marginBottom: "15px" }}>
            📝 Tạo Đơn Mới
          </h3>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <label style={styles.label}>Lý do nghỉ:</label>
              <input
                required
                type="text"
                placeholder="VD: Nghỉ ốm..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Từ ngày:</label>
                <input
                  required
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Đến ngày:</label>
                <input
                  required
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
            </div>
            <div
              style={{
                background: "#f3f4f6",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              Tổng cộng:{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                {totalDays} ngày
              </span>
            </div>
            <button type="submit" style={styles.button}>
              🚀 Gửi Đơn
            </button>
          </form>
        </div>

        {/* DANH SÁCH LỊCH SỬ */}
        <div className="card" style={styles.card}>
          <h3 style={{ marginTop: 0, color: "#059669", marginBottom: "15px" }}>
            🕒 Lịch Sử Đơn
          </h3>
          <div style={{ overflowY: "auto", maxHeight: "500px" }}>
            {leaves.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center" }}>
                Chưa có đơn nào.
              </p>
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
                      borderBottom: "2px solid #eee",
                    }}
                  >
                    <th style={{ padding: "10px" }}>Thời gian</th>
                    <th>Lý do</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr
                      key={leave.id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "10px" }}>
                        <div>
                          {new Date(leave.start_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          ({leave.total_days} ngày)
                        </div>
                      </td>
                      <td>{leave.reason}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS styles đơn giản
const styles = {
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginTop: "5px",
  },
  label: { fontWeight: "bold", fontSize: "14px" },
  button: {
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
};

export default LeavePage;
