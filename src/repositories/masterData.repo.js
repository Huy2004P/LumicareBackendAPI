const db = require("../config/database");

class MasterDataRepo {
  // ==========================================
  // 1. SPECIALTY (Giữ nguyên gốc)
  // ==========================================
  async createSpecialty(data) {
    const sql = `INSERT INTO specialties (name, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getSpecialtyById(result.insertId);
  }

  async getSpecialtyById(id) {
    const [rows] = await db.execute("SELECT * FROM specialties WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }

  async getAllSpecialties() {
    const [rows] = await db.execute("SELECT * FROM specialties WHERE is_deleted = 0 ORDER BY id DESC");
    return { data: rows };
  }

  async updateSpecialty(data) {
    const sql = `UPDATE specialties SET name=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getSpecialtyById(data.id);
  }

  async deleteSpecialty(id) {
    await db.execute("UPDATE specialties SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // ==========================================
  // 2. CLINIC (Định chuẩn lấy Rating trung bình)
  // ==========================================
  async createClinic(data) {
    const sql = `INSERT INTO clinics (name, address, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.address || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getClinicById(result.insertId);
  }

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

  async updateClinic(data) {
    const sql = `UPDATE clinics SET name=?, address=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.address || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getClinicById(data.id);
  }

  async deleteClinic(id) {
    await db.execute("UPDATE clinics SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // ==========================================
  // 3. ROOM (Giữ nguyên gốc)
  // ==========================================
  async createRoom(data) {
    const sqlInsert = `INSERT INTO rooms (name, clinic_id, location, description, is_deleted) VALUES (?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sqlInsert, [data.name || null, data.clinicId || null, data.location || null, data.description || null]);
    return this.getRoomById(result.insertId);
  }

  async getRoomById(id) {
    const sql = `SELECT r.*, c.name as clinicName FROM rooms r LEFT JOIN clinics c ON r.clinic_id = c.id WHERE r.id = ? AND r.is_deleted = 0`;
    const [rows] = await db.execute(sql, [id]);
    if (rows.length > 0) {
      const room = rows[0];
      return { id: room.id, name: room.name, clinicId: room.clinic_id, location: room.location, description: room.description, clinicName: room.clinicName || "" };
    }
    return null;
  }

  async getAllRooms(clinicId) {
    let sql = `SELECT r.id, r.name, r.clinic_id AS clinicId, r.location, r.description, c.name AS clinicName FROM rooms r LEFT JOIN clinics c ON r.clinic_id = c.id WHERE r.is_deleted = 0`;
    let params = [];
    if (clinicId && clinicId !== 0) { sql += " AND r.clinic_id = ?"; params.push(clinicId); }
    sql += " ORDER BY r.id DESC";
    const [rows] = await db.execute(sql, params);
    return { data: rows };
  }

  async getRoomsByClinicId(clinicId) {
    const sql = `SELECT r.id, r.name, r.clinic_id AS clinicId, r.location, r.description, c.name AS clinicName FROM rooms r LEFT JOIN clinics c ON r.clinic_id = c.id WHERE r.clinic_id = ? AND r.is_deleted = 0`;
    const [rows] = await db.execute(sql, [clinicId]);
    return { data: rows };
  }

  async updateRoom(data) {
    const sql = `UPDATE rooms SET name=?, clinic_id=?, location=?, description=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.clinicId || data.clinic_id, data.location || null, data.description || null, data.id]);
    return this.getRoomById(data.id);
  }

  async deleteRoom(id) {
    await db.execute("UPDATE rooms SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // ==========================================
  // 4. SERVICE (Định chuẩn lấy Rating trung bình)
  // ==========================================
  async createService(data) {
    const sql = `INSERT INTO services (name, price, specialty_id, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.price || 0, data.specialty_id || data.specialtyId || null, data.description || null, data.image || null, data.content_html || data.contentHtml || null, data.content_markdown || data.contentMarkdown || null]);
    return this.getServiceById(result.insertId);
  }

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

  async updateService(data) {
    const sql = `UPDATE services SET name=?, price=?, specialty_id=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.price || 0, data.specialty_id || data.specialtyId || null, data.description || null, data.image || null, data.content_html || data.contentHtml || null, data.content_markdown || data.contentMarkdown || null, data.id]);
    return this.getServiceById(data.id);
  }

  async deleteService(id) {
    await db.execute("UPDATE services SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // --- GIỮ NGUYÊN GỐC (Bác sĩ riêng) ---
  // --- BẢNG TRUNG GIAN DOCTOR_SERVICES ---
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
        IFNULL(AVG(f.rating_doctor), 5.0) as rating -- 🎯 THÊM DÒNG NÀY
      FROM doctor_services ds
      JOIN doctors d ON ds.doctor_id = d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN feedbacks f ON d.id = f.doctor_id -- 🎯 JOIN THÊM FEEDBACKS
      WHERE ds.service_id = ? AND d.is_deleted = 0
      GROUP BY d.id -- 🎯 BẮT BUỘC CÓ GROUP BY
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
        IFNULL(AVG(f.rating_doctor), 5.0) as rating -- 🎯 THÊM DÒNG NÀY
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN feedbacks f ON d.id = f.doctor_id -- 🎯 JOIN THÊM FEEDBACKS
      WHERE d.room_id = ? AND d.is_deleted = 0
      GROUP BY d.id -- 🎯 BẮT BUỘC CÓ GROUP BY
    `;
    const [rows] = await db.execute(sql, [roomId]);
    return rows;
  }

  // ==========================================
  // 5. DRUGS (Giữ nguyên gốc)
  // ==========================================
  async createDrug(data) {
    const sql = `INSERT INTO drugs (name, unit, price, description, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.unit || null, data.price || 0, data.description || null, data.content_html || null, data.content_markdown || null]);
    return this.getDrugById(result.insertId);
  }

  async getDrugById(id) {
    const [rows] = await db.execute("SELECT * FROM drugs WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }

  async getAllDrugs() {
    const [rows] = await db.execute("SELECT * FROM drugs WHERE is_deleted = 0 ORDER BY id DESC");
    return { data: rows };
  }

  async updateDrug(data) {
    const sql = `UPDATE drugs SET name=?, unit=?, price=?, description=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.unit || null, data.price || 0, data.description || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getDrugById(data.id);
  }

  async deleteDrug(id) {
    await db.execute("UPDATE drugs SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // ==========================================
  // 6. ALLCODES (Giữ nguyên gốc)
  // ==========================================
  async createAllCode(data) {
    const sql = `INSERT INTO allcodes (type, \`key\`, value_vi, value_en, is_deleted) VALUES (?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.type || null, data.key || null, data.value_vi || null, data.value_en || null]);
    return this.getAllCodeById(result.insertId);
  }

  async getAllCodeById(id) {
    const [rows] = await db.execute("SELECT * FROM allcodes WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }

  async getAllCodes(type) {
    let sql = "SELECT * FROM allcodes WHERE is_deleted = 0";
    let params = [];
    if (type && type !== "") { sql += " AND type = ?"; params.push(type); }
    const [rows] = await db.execute(sql, params);
    return { data: rows };
  }

  async updateAllCode(data) {
    const sql = `UPDATE allcodes SET type=?, \`key\`=?, value_vi=?, value_en=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.type || null, data.key || null, data.value_vi || null, data.value_en || null, data.id]);
    return this.getAllCodeById(data.id);
  }

  async deleteAllCode(id) {
    await db.execute("UPDATE allcodes SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }
}

module.exports = new MasterDataRepo();