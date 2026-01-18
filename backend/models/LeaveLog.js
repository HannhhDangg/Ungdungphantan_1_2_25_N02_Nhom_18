const mongoose = require("mongoose");

const LeaveLogSchema = new mongoose.Schema({
  leave_request_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  action: { type: String, required: true }, // CREATE, APPROVED, REJECTED
  performed_by: { type: String, required: true },
  details: {
    full_name: String, // Lưu tên nhân viên tại thời điểm đó
    reason: String,
    start_date: Date,
    end_date: Date,
    total_days: Number,
    old_status: String, // Trạng thái cũ
    new_status: String, // Trạng thái mới
    rejection_reason: String, // Lý do từ chối (nếu có)
    note: String, // Ghi chú thêm
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LeaveLog", LeaveLogSchema);
