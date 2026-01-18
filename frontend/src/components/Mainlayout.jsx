import { useState, useEffect } from "react"; // Import thêm useState
import Sidebar from "./Sidebar";
import ProfileModal from "./ProfileModal"; // Import Modal vừa tạo

const MainLayout = ({ children }) => {
  // State quản lý user hiện tại
  const [currentUser, setCurrentUser] = useState({});
  // State quản lý việc đóng mở Modal
  const [showModal, setShowModal] = useState(false);

  // Lấy user từ localStorage khi mới vào
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  // Hàm cập nhật lại giao diện ngay khi sửa xong
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <div className="top-header">
          {/* Bấm vào đây để mở Modal */}
          <div
            className="user-profile-box"
            onClick={() => setShowModal(true)} // Sự kiện mở modal
            style={{ cursor: "pointer" }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>
                {currentUser.full_name || currentUser.username}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                {currentUser.role}
              </div>
            </div>
            <div className="avatar-circle">
              <img
                src={
                  currentUser.avatar_url || "https://i.pravatar.cc/150?img=12"
                }
                alt="User"
              />
            </div>
          </div>
        </div>

        <div className="page-scroll">{children}</div>
      </div>

      {/* Hiển thị Modal nếu showModal = true */}
      <ProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

export default MainLayout;
