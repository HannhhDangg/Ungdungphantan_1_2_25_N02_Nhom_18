-- 1. Bảng Users (Nhân viên/Quản lý/Admin)
-- Lưu ý: Cột password sẽ lưu mã hóa (bcrypt), không lưu text thường
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(15),
    avatar_url VARCHAR(255),
    
    -- Phân quyền: STAFF (Nhân viên), MANAGER (Quản lý), ADMIN (Quản trị)
    role VARCHAR(20) DEFAULT 'STAFF', 
    
    -- Trạng thái: 
    -- 'PENDING_ADMIN': Chờ Admin duyệt
    -- 'PENDING_MANAGER': Chờ Manager duyệt (nếu cần quy trình 2 bước)
    -- 'ACTIVE': Đã kích hoạt, được phép đăng nhập
    -- 'LOCKED': Bị khóa
    status VARCHAR(20) DEFAULT 'PENDING_ADMIN', 
    
    -- Các trường phục vụ tính năng OTP và Logic nghiệp vụ
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    manager_id INTEGER, -- ID của người quản lý trực tiếp
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Leave Requests (Đơn nghỉ phép)
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id), -- Liên kết với bảng users
    
    reason TEXT, -- Lý do nghỉ
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT, -- Tổng số ngày nghỉ
    
    -- Trạng thái đơn: 'PENDING', 'APPROVED', 'REJECTED'
    status VARCHAR(20) DEFAULT 'PENDING', 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Thông tin người duyệt và thời gian duyệt (Yêu cầu hiển thị Dashboard)
    approved_at TIMESTAMP, 
    approver_id INT REFERENCES users(id),
    rejection_reason TEXT 
);

-- 3. DỮ LIỆU MẪU (Dùng để hiển thị danh sách, KHÔNG DÙNG ĐỂ ĐĂNG NHẬP NGAY)
-- Lưu ý: Mật khẩu ở đây là text thường ('123456'), Backend dùng bcrypt nên sẽ không khớp.
-- Bạn cần làm theo hướng dẫn bên dưới để có tài khoản đăng nhập được.

-- Tạo Admin giả
INSERT INTO users (username, password, full_name, email, role, status) 
VALUES ('admin', '123456', 'Super Admin', 'admin@test.com', 'ADMIN', 'ACTIVE');

-- Tạo Manager giả
INSERT INTO users (username, password, full_name, email, role, status) 
VALUES ('manager_1', '123456', 'Trần Quản Lý ', 'manager@test.com', 'MANAGER', 'ACTIVE');

-- Tạo Staff giả (ID=3)
INSERT INTO users (username, password, full_name, email, role, status) 
VALUES ('staff_1', '123456', 'Nguyễn Nhân Viên ', 'staff@test.com', 'STAFF', 'ACTIVE');

-- Tạo đơn nghỉ phép mẫu cho nhân viên ID 3
-- Đơn 1: Đã được duyệt
INSERT INTO leave_requests (user_id, reason, start_date, end_date, total_days, status, created_at, approved_at) 
VALUES (3, 'Bị ốm sốt cao', '2024-01-10', '2024-01-11', 1, 'APPROVED', NOW(), NOW());

-- Đơn 2: Chờ duyệt
INSERT INTO leave_requests (user_id, reason, start_date, end_date, total_days, status, created_at) 
VALUES (3, 'Đi đám cưới bạn', '2024-02-20', '2024-02-22', 2, 'PENDING', NOW());