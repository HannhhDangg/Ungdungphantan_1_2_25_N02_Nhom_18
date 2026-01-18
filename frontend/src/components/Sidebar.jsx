import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartPie,
  FaUsers,
  FaUserCircle,
  FaPlusCircle,
  FaSignOutAlt,
  FaLeaf,
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const goTo = (path) => navigate(path);

  // Logic kiểm tra Active chuẩn xác
  const isActive = (path) => {
    // Nếu là trang gốc (/admin hoặc /employee) -> Phải giống hệt mới sáng
    if (path === "/admin" || path === "/employee") {
      return location.pathname === path ? "menu-item active" : "menu-item";
    }
    // Các trang con -> Dùng startsWith để bao gồm cả các trang sâu hơn
    return location.pathname.startsWith(path)
      ? "menu-item active"
      : "menu-item";
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="sidebar">
      <div className="logo-area">
        <FaLeaf size={24} /> LeaveApp
      </div>

      {/* --- MENU ADMIN --- */}
      {user.role === "ADMIN" && (
        <>
          <div className="menu-label">Quản trị</div>

          {/* 1. Trang chủ (MỚI) */}
          <div className={isActive("/admin")} onClick={() => goTo("/admin")}>
            <FaUserCircle /> Trang chủ
          </div>

          {/* 2. Quản lý đơn nghỉ (ĐỔI LINK) */}
          <div
            className={isActive("/admin/leaves")}
            onClick={() => goTo("/admin/leaves")}
          >
            <FaChartPie /> Quản lý đơn nghỉ
          </div>

          {/* 3. Quản lý nhân sự */}
          <div
            className={isActive("/admin/users")}
            onClick={() => goTo("/admin/users")}
          >
            <FaUsers /> Quản lý nhân sự
          </div>
        </>
      )}

      {/* --- MENU NHÂN VIÊN --- */}
      {(user.role === "STAFF" || user.role === "MANAGER") && (
        <>
          <div className="menu-label">Cá nhân</div>
          <div
            className={isActive("/employee")}
            onClick={() => goTo("/employee")}
          >
            <FaUserCircle /> Trang chủ
          </div>
          <div
            className={isActive("/employee/leaves")}
            onClick={() => goTo("/employee/leaves")}
          >
            <FaPlusCircle /> Quản lý nghỉ phép
          </div>
        </>
      )}

      <button
        className="menu-item logout-btn"
        onClick={handleLogout}
        style={{ marginTop: "auto" }}
      >
        <FaSignOutAlt /> Đăng xuất
      </button>
    </div>
  );
};

export default Sidebar;
