const db = require("../config/database");

class MasterDataRepo {
  //Tạo mới 1 chuyên khoa
  async createSpecialty(data) {
    const sql = `INSERT INTO specialties (name, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getSpecialtyById(result.insertId);
  }
  // Lấy chuyên khoa theo ID
  async getSpecialtyById(id) {
    const [rows] = await db.execute("SELECT * FROM specialties WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }
  // Lấy tất cả chuyên khoa (có phân trang và tìm kiếm)
  async getAllSpecialties() {
    const [rows] = await db.execute("SELECT * FROM specialties WHERE is_deleted = 0 ORDER BY id DESC");
    return { data: rows };
  }
  // Cập nhật chuyên khoa
  async updateSpecialty(data) {
    const sql = `UPDATE specialties SET name=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getSpecialtyById(data.id);
  }
  // Xóa chuyên khoa (thực tế là đánh dấu is_deleted = 1)
  async deleteSpecialty(id) {
    await db.execute("UPDATE specialties SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // Tạo mới 1 cơ sở y tế
  async createClinic(data) {
    const sql = `INSERT INTO clinics (name, address, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.address || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getClinicById(result.insertId);
  }
  // Lấy cơ sở y tế theo ID (có tính toán rating trung bình)
  async getClinicById(id) {
    const sql = `
      SELECT c.*, IFNULL(AVG(f.rating_clinic), 5.0) as rating 
      FROM clinics c 
      LEFT JOIN feedbacks f ON c.id = f.clinic_id 
      WHERE c.id = ? AND c.is_deleted = 0
      GROUP BY c.id`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
  // Lấy tất cả cơ sở y tế (có tính toán rating trung bình)
  async getAllClinics() {
    const sql = `
      SELECT c.*, IFNULL(AVG(f.rating_clinic), 5.0) as rating 
      FROM clinics c 
      LEFT JOIN feedbacks f ON c.id = f.clinic_id 
      WHERE c.is_deleted = 0 
      GROUP BY c.id
      ORDER BY c.id DESC`;
    const [rows] = await db.execute(sql);
    return { data: rows };
  }
  // Cập nhật cơ sở y tế
  async updateClinic(data) {
    const sql = `UPDATE clinics SET name=?, address=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.address || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getClinicById(data.id);
  }
  // Xóa cơ sở y tế (thực tế là đánh dấu is_deleted = 1)
  async deleteClinic(id) {
    await db.execute("UPDATE clinics SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // Tạo mới phòng khám
  async createRoom(data) {
    const sqlInsert = `INSERT INTO rooms (name, clinic_id, location, description, is_deleted) VALUES (?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sqlInsert, [data.name || null, data.clinicId || null, data.location || null, data.description || null]);
    return this.getRoomById(result.insertId);
  }
  // Lấy phòng khám theo ID (có join lấy tên cơ sở y tế)
  async getRoomById(id) {
    const sql = `SELECT r.*, c.name as clinicName FROM rooms r LEFT JOIN clinics c ON r.clinic_id = c.id WHERE r.id = ? AND r.is_deleted = 0`;
    const [rows] = await db.execute(sql, [id]);
    if (rows.length > 0) {
      const room = rows[0];
      return { id: room.id, name: room.name, clinicId: room.clinic_id, location: room.location, description: room.description, clinicName: room.clinicName || "" };
    }
    return null;
  }
  // Lấy tất cả phòng khám (có join lấy tên cơ sở y tế, có thể lọc theo clinicId)
  async getAllRooms(clinicId) {
    let sql = `SELECT r.id, r.name, r.clinic_id AS clinicId, r.location, r.description, c.name AS clinicName FROM rooms r LEFT JOIN clinics c ON r.clinic_id = c.id WHERE r.is_deleted = 0`;
    let params = [];
    if (clinicId && clinicId !== 0) { sql += " AND r.clinic_id = ?"; params.push(clinicId); }
    sql += " ORDER BY r.id DESC";
    const [rows] = await db.execute(sql, params);
    return { data: rows };
  }
  // Lấy phòng khám theo id cơ sở (dành riêng cho Doctor khi tạo mới hoặc cập nhật bác sĩ)
  async getRoomsByClinicId(clinicId) {
    const sql = `SELECT r.id, r.name, r.clinic_id AS clinicId, r.location, r.description, c.name AS clinicName FROM rooms r LEFT JOIN clinics c ON r.clinic_id = c.id WHERE r.clinic_id = ? AND r.is_deleted = 0`;
    const [rows] = await db.execute(sql, [clinicId]);
    return { data: rows };
  }
  // Cập nhật phòng khám
  async updateRoom(data) {
    const sql = `UPDATE rooms SET name=?, clinic_id=?, location=?, description=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.clinicId || data.clinic_id, data.location || null, data.description || null, data.id]);
    return this.getRoomById(data.id);
  }
  // Xóa phòng khám (thực tế là đánh dấu is_deleted = 1)
  async deleteRoom(id) {
    await db.execute("UPDATE rooms SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // Tạo mới dịch vụ
  async createService(data) {
    const sql = `INSERT INTO services (name, price, specialty_id, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.price || 0, data.specialty_id || data.specialtyId || null, data.description || null, data.image || null, data.content_html || data.contentHtml || null, data.content_markdown || data.contentMarkdown || null]);
    return this.getServiceById(result.insertId);
  }
  // Lấy dịch vụ theo ID (có tính toán rating trung bình)
  async getServiceById(id) {
    const sql = `
      SELECT s.*, IFNULL(AVG(f.rating_service), 5.0) as rating
      FROM services s
      LEFT JOIN feedbacks f ON s.id = f.service_id
      WHERE s.id = ? AND s.is_deleted = 0
      GROUP BY s.id`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
  // Lấy tất cả dịch vụ (có tính toán rating trung bình)
  async getAllServices() {
    const sql = `
      SELECT s.*, IFNULL(AVG(f.rating_service), 5.0) as rating
      FROM services s
      LEFT JOIN feedbacks f ON s.id = f.service_id
      WHERE s.is_deleted = 0 
      GROUP BY s.id
      ORDER BY s.id DESC`;
    const [rows] = await db.execute(sql);
    return { data: rows };
  }
  // Cập nhật dịch vụ
  async updateService(data) {
    const sql = `UPDATE services SET name=?, price=?, specialty_id=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.price || 0, data.specialty_id || data.specialtyId || null, data.description || null, data.image || null, data.content_html || data.contentHtml || null, data.content_markdown || data.contentMarkdown || null, data.id]);
    return this.getServiceById(data.id);
  }
  // Xóa dịch vụ (thực tế là đánh dấu is_deleted = 1)
  async deleteService(id) {
    await db.execute("UPDATE services SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }
  // Lấy nhiều dịch vụ theo mảng ID (có tính toán rating trung bình)
  async getServicesByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const sql = `
      SELECT s.*, IFNULL(AVG(f.rating_service), 5.0) as rating
      FROM services s
      LEFT JOIN feedbacks f ON s.id = f.service_id
      WHERE s.id IN (${placeholders}) AND s.is_deleted = 0
      GROUP BY s.id`;
      
    const [rows] = await db.query(sql, ids);
    return rows;
  }

  // Lấy bác sĩ theo Dịch vụ (có tính toán rating trung bình)
  async getDoctorsByServiceId(serviceId) {
    const sql = `
      SELECT 
        d.id, 
        d.full_name, 
        d.phone, 
        d.avatar, 
        d.description, 
        d.price, 
        d.position, 
        d.specialty_id, 
        d.room_id,
        s.name as specialty_name,
        IFNULL(AVG(f.rating_doctor), 5.0) as rating
      FROM doctor_services ds
      JOIN doctors d ON ds.doctor_id = d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN feedbacks f ON d.id = f.doctor_id
      WHERE ds.service_id = ? AND d.is_deleted = 0
      GROUP BY d.id
    `;
    const [rows] = await db.execute(sql, [serviceId]);
    return rows;
  }

  // Lấy bác sĩ theo Phòng
  async getDoctorsByRoomId(roomId) {
    const sql = `
      SELECT 
        d.id, 
        d.full_name, 
        d.phone, 
        d.avatar, 
        d.description, 
        d.price, 
        d.position, 
        d.specialty_id, 
        d.room_id,
        s.name as specialty_name,
        IFNULL(AVG(f.rating_doctor), 5.0) as rating
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN feedbacks f ON d.id = f.doctor_id
      WHERE d.room_id = ? AND d.is_deleted = 0
      GROUP BY d.id
    `;
    const [rows] = await db.execute(sql, [roomId]);
    return rows;
  }

  // Tạo mới thuốc (có thêm trường specialty_id để liên kết với chuyên khoa)
  async createDrug(data) {
    const sql = `
      INSERT INTO drugs (
        name, unit, price, description, 
        content_html, content_markdown, specialty_id, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;

    const [result] = await db.execute(sql, [
      data.name || null,
      data.unit || null,
      data.price || 0,
      data.description || null,
      data.content_html || null,
      data.content_markdown || null,
      data.specialty_id || null
    ]);
    return this.getDrugById(result.insertId);
  }
  // Lấy thuốc theo ID (có join lấy tên chuyên khoa)
  async getDrugById(id) {
    const [rows] = await db.execute("SELECT * FROM drugs WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }
  // Lấy tất cả thuốc (có phân trang, tìm kiếm, và lọc theo chuyên khoa)
  async getAllDrugs(params = {}) {
    const { keyword, limit, offset, specialty_id } = params;
    let sql = `SELECT * FROM drugs WHERE is_deleted = 0`;
    const values = [];
    if (specialty_id && specialty_id > 0) {
      sql += ` AND specialty_id = ?`;
      values.push(specialty_id);
    }
    if (keyword) {
      sql += ` AND (name LIKE ? OR description LIKE ?)`;
      values.push(`%${keyword}%`, `%${keyword}%`);
    }
    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    values.push(limit || 999, offset || 0);
    const [rows] = await db.execute(sql, values);
    return { data: rows };
  }
  // Cập nhật thuốc
  async updateDrug(data) {
    const sql = `
      UPDATE drugs 
      SET name=?, unit=?, price=?, description=?, 
          content_html=?, content_markdown=?, specialty_id=? 
      WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [
      data.name || null,
      data.unit || null,
      data.price || 0,
      data.description || null,
      data.content_html || null,
      data.content_markdown || null,
      data.specialty_id || null, 
      data.id
    ]);
    return this.getDrugById(data.id);
  }
  // Xóa thuốc (thực tế là đánh dấu is_deleted = 1)
  async deleteDrug(id) {
    await db.execute("UPDATE drugs SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // Tạo mới một AllCode (dùng chung cho nhiều loại dữ liệu như giới tính, vị trí, chuyên khoa, phòng khám...)
  async createAllCode(data) {
    const sql = `INSERT INTO allcodes (type, \`key\`, value_vi, value_en, is_deleted) VALUES (?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.type || null, data.key || null, data.value_vi || null, data.value_en || null]);
    return this.getAllCodeById(result.insertId);
  }
  // Lấy AllCode theo ID
  async getAllCodeById(id) {
    const [rows] = await db.execute("SELECT * FROM allcodes WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }
  // Lấy tất cả AllCode theo type (có thể lấy tất cả nếu không truyền type)
  async getAllCodes(type) {
    let sql = "SELECT * FROM allcodes WHERE is_deleted = 0";
    let params = [];
    if (type && type !== "") { sql += " AND type = ?"; params.push(type); }
    const [rows] = await db.execute(sql, params);
    return { data: rows };
  }
  // Cập nhật AllCode
  async updateAllCode(data) {
    const sql = `UPDATE allcodes SET type=?, \`key\`=?, value_vi=?, value_en=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.type || null, data.key || null, data.value_vi || null, data.value_en || null, data.id]);
    return this.getAllCodeById(data.id);
  }
  // Xóa AllCode (thực tế là đánh dấu is_deleted = 1)
  async deleteAllCode(id) {
    await db.execute("UPDATE allcodes SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }
}

module.exports = new MasterDataRepo();