const db = require("../config/database");

class PaymentRepository {
  // Lấy thông tin đơn hàng để hiển thị nội dung chuyển khoản
  async getBookingForPayment(bookingId) {
    const sql = `
      SELECT b.id, b.price, d.full_name as doctorName, b.payment_method 
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      WHERE b.id = ? AND b.is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [bookingId]);
    return rows[0];
  }

  // 🛠️ SỬA LẠI TRONG PaymentRepository
async updatePaymentStatus(bookingId, status, transactionId = null) {
  const sql = `
    UPDATE bookings 
    SET payment_status = ?, 
        /* ✅ Nếu transactionId truyền vào là null thì giữ nguyên giá trị cũ trong DB */
        transaction_id = COALESCE(?, transaction_id), 
        payment_date = IF(? = 1, NOW(), payment_date),
        updated_at = NOW()
    WHERE id = ?
  `;
  
  // COALESCE sẽ lấy giá trị đầu tiên khác null. 
  // Nếu tham số thứ 2 (transactionId) là null, nó lấy chính nó (transaction_id cũ).
  const [result] = await db.execute(sql, [status, transactionId, status, bookingId]);
  return result.affectedRows > 0;
}

  // Lấy trạng thái hiện tại để trả về cho Flutter
  async getStatus(bookingId) {
    const [rows] = await db.execute(
      "SELECT payment_status, transaction_id FROM bookings WHERE id = ?",
      [bookingId]
    );
    return rows[0];
  }

  async getPaymentList(searchTerm, status) {
  let sql = `
    SELECT 
        b.id as bookingId, 
        p.full_name as patientName, 
        b.price as amount, 
        /* 🎯 Lấy tên tiếng Việt thay vì mã code PAY1, PAY2 */
        a.value_vi as method, 
        b.payment_status as status, 
        b.transaction_id as transactionId, 
        b.created_at as createdAt
    FROM bookings b
    JOIN patients p ON b.patient_id = p.id
    /* 🔗 Join với bảng allcodes để lấy tên phương thức thanh toán */
    LEFT JOIN allcodes a ON b.payment_method = a.key AND a.type = 'PAYMENT'
    WHERE b.is_deleted = 0
      /* 🛡️ Chặn đơn đã hủy (status = cancelled hoặc 6 như trong hình của ông) */
      AND b.status != 'cancelled' 
      AND b.status != '6' 
      AND b.payment_status != 3
  `;
  const params = [];

  // Lọc theo trạng thái thanh toán từ ComboBox C#
  if (status !== -1) {
    sql += " AND b.payment_status = ?";
    params.push(status);
  }

  // Tìm kiếm theo tên khách hoặc mã giao dịch
  if (searchTerm) {
    sql += " AND (p.full_name LIKE ? OR b.transaction_id LIKE ?)";
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  sql += " ORDER BY b.created_at DESC";

  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ [SQL Error]:", error.message);
    throw error;
  }
}
}

module.exports = new PaymentRepository();