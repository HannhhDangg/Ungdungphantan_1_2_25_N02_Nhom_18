import { useState, useEffect } from "react";
import { FaUsers, FaUserInjured } from "react-icons/fa";

const AdminHome = () => {
  const [stats, setStats] = useState({ totalUsers: 0, absentToday: 0 });
  const [user] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    fetch("/api/leaves/stats/admin-summary")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card">
      <h2 style={{ color: "var(--primary-color)" }}>
        Xin chào Quản trị viên, {user?.full_name || "Admin"} 👋
      </h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Đây là tình hình nhân sự hôm nay.
      </p>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Card 1: Tổng nhân sự */}
        <div
          style={{
            ...cardStyle,
            background: "#e0f2fe",
            border: "1px solid #bae6fd",
          }}
        >
          <div style={{ fontSize: "40px", color: "#0284c7" }}>
            <FaUsers />
          </div>
          <div>
            <div
              style={{ fontSize: "14px", color: "#0369a1", fontWeight: "bold" }}
            >
              TỔNG NHÂN SỰ
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "bold", color: "#0c4a6e" }}
            >
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: "12px", color: "#0369a1" }}>
              Nhân viên trong hệ thống
            </div>
          </div>
        </div>

        {/* Card 2: Vắng mặt hôm nay */}
        <div
          style={{
            ...cardStyle,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <div style={{ fontSize: "40px", color: "#dc2626" }}>
            <FaUserInjured />
          </div>
          <div>
            <div
              style={{ fontSize: "14px", color: "#b91c1c", fontWeight: "bold" }}
            >
              VẮNG MẶT HÔM NAY
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: "bold", color: "#7f1d1d" }}
            >
              {stats.absentToday}
            </div>
            <div style={{ fontSize: "12px", color: "#b91c1c" }}>
              Đang nghỉ phép
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  flex: 1,
  padding: "20px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "20px",
};

export default AdminHome;
