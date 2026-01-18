import { useState, useRef, useEffect } from "react";

const ProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  // 1. Dùng useEffect để cập nhật form khi user thay đổi
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Cập nhật dữ liệu vào Form khi mở Modal
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "", // Nếu null thì thành chuỗi rỗng
        phone_number: user.phone_number || "",
        email: user.email || "",
      });
      setPreviewUrl(user.avatar_url || "");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("full_name", formData.full_name);
      dataToSend.append("phone_number", formData.phone_number);

      // Nếu user chọn file mới thì gửi file, không thì gửi link cũ
      if (selectedFile) {
        dataToSend.append("avatar", selectedFile);
      } else {
        dataToSend.append("avatar_url", user.avatar_url || "");
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        body: dataToSend,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Cập nhật thành công!");
        const updatedUser = { ...user, ...data.user };

        // Lưu lại vào LocalStorage để F5 không bị mất
        localStorage.setItem("user", JSON.stringify(updatedUser));

        onUpdateUser(updatedUser);
        onClose();
      } else {
        alert("Lỗi: " + (data.message || "Không thể lưu"));
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server (Kiểm tra xem Backend đã chạy chưa?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">Cập nhật Hồ Sơ</div>
        <div className="modal-avatar-upload">
          <div
            onClick={() => fileInputRef.current.click()}
            style={{
              cursor: "pointer",
              position: "relative",
              display: "inline-block",
            }}
          >
            <img
              src={previewUrl || "https://i.pravatar.cc/300?img=12"}
              alt="Avatar"
              className="modal-avatar-img"
              style={{
                objectFit: "cover",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "2px solid #ddd",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(0,0,0,0.6)",
                color: "white",
                fontSize: "10px",
                textAlign: "center",
              }}
            >
              Đổi ảnh
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập họ tên của bạn..."
              style={{ width: "100%", padding: "8px", margin: "5px 0" }}
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Nhập số điện thoại..."
              style={{ width: "100%", padding: "8px", margin: "5px 0" }}
            />
          </div>
          <div className="form-group">
            <label>Email (Không thể sửa)</label>
            <input
              value={formData.email}
              disabled
              style={{
                width: "100%",
                padding: "8px",
                background: "#eee",
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>
        <div
          className="modal-actions"
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="btn-cancel"
            onClick={onClose}
            style={{ padding: "8px 15px" }}
          >
            Hủy bỏ
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "8px 15px",
              background: "blue",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
        a
      </div>
    </div>
  );
};

export default ProfileModal;
