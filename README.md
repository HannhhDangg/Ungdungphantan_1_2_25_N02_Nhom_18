# Leave Management System (Microservices Architecture)
Hệ thống quản lý nghỉ phép hiện đại được xây dựng trên kiến trúc Microservices-oriented, tập trung vào khả năng mở rộng, xử lý bất đồng bộ và thông báo thời gian thực.
+4

- Mục lục
Kiến trúc hệ thống

Công nghệ sử dụng

Tính năng cốt lõi

Cơ chế Real-time & Đồng bộ

Hướng dẫn cài đặt

- Kiến trúc hệ thống
Dự án áp dụng mô hình phân lớp, tách biệt hoàn toàn giữa giao diện, logic và lưu trữ thông qua Docker.

Gateway Layer: Sử dụng Nginx làm Reverse Proxy và Load Balancer để điều phối lưu lượng qua cổng 80.

Application Layer: Gồm React.js (Frontend) và Node.js/Express (Backend) được Scale lên 2 thực thể chạy song song.

Data Layer (Polyglot Persistence): Sử dụng kết hợp SQL, NoSQL và In-memory database để tối ưu cho từng loại dữ liệu.

 
Công nghệ sử dụng
Hệ thống tận dụng thế mạnh của nhiều công nghệ hiện đại:
Frontend: React.js (SPA) giúp trải nghiệm mượt mà, không cần tải lại trang.
Backend: Node.js & Express với cơ chế Asynchronous Processing (Async/Await) giúp xử lý hàng nghìn yêu cầu mà không nghẽn.


Databases:
PostgreSQL: Lưu trữ dữ liệu quan hệ (Users, Leave Requests) đảm bảo tính toàn vẹn.
MongoDB: Lưu trữ Audit Logs (Nhật ký hệ thống) với cấu trúc linh hoạt và tốc độ ghi cao.
Redis: Lưu trữ OTP xác thực và làm Socket.io Adapter để đồng bộ hóa dữ liệu.

DevOps: Docker, Docker Compose quản lý các service độc lập.


Tính năng cốt lõi:
Định danh & Bảo mật: Sử dụng JWT (JSON Web Token) để định danh người dùng xuyên suốt các node.
Quản lý nghiệp vụ: Đăng ký, đăng nhập, tính toán quỹ ngày nghỉ và quy trình duyệt đơn tự động.
Audit Trail: Mọi thay đổi trạng thái đều được ghi log chi tiết vào MongoDB để tra cứu.


Tính chịu lỗi (Failover): Tự động chuyển hướng yêu cầu sang server dự phòng nếu server chính gặp sự cố.

Cơ chế Real-time & Đồng bộ
Điểm nhấn của dự án là khả năng thông báo tức thời thông qua Socket.io + Redis Pub/Sub.

Khi có 1 đơn nghỉ phép mới:
Backend 1 nhận đơn và ghi vào Postgres.
Phát tín hiệu vào Redis.
Redis truyền tin tới Backend 2.
Admin nhận được thông báo nổi (Toast) ngay lập tức dù đang kết nối ở bất kỳ server nào.

