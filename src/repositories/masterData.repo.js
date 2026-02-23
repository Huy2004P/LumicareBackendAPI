const db = require("../config/database");

class MasterDataRepo {
  // ==========================================
  // 1. SPECIALTY (Chuyên khoa)
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
  // 2. CLINIC (Bệnh viện / Phòng khám)
  // ==========================================
  async createClinic(data) {
    const sql = `INSERT INTO clinics (name, address, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.address || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getClinicById(result.insertId);
  }

  async getClinicById(id) {
    const [rows] = await db.execute("SELECT * FROM clinics WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }

  async getAllClinics() {
    const [rows] = await db.execute("SELECT * FROM clinics WHERE is_deleted = 0 ORDER BY id DESC");
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
  // 3. ROOM (Phòng khám cụ thể)
  // ==========================================
  async createRoom(data) {
    const sqlInsert = `INSERT INTO rooms (name, clinic_id, location, description, is_deleted) VALUES (?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sqlInsert, [data.name || null, data.clinicId || null, data.location || null, data.description || null]);
    return this.getRoomById(result.insertId);
  }

  async getRoomById(id) {
    const sql = `
      SELECT r.*, c.name as clinicName 
      FROM rooms r 
      LEFT JOIN clinics c ON r.clinic_id = c.id 
      WHERE r.id = ? AND r.is_deleted = 0`;
    const [rows] = await db.execute(sql, [id]);
    if (rows.length > 0) {
      const room = rows[0];
      return {
        id: room.id,
        name: room.name,
        clinicId: room.clinic_id,
        location: room.location,
        description: room.description,
        clinicName: room.clinicName || ""
      };
    }
    return null;
  }

  async getAllRooms(clinicId) {
    let sql = `
        SELECT r.id, r.name, r.clinic_id AS clinicId, r.location, r.description, c.name AS clinicName 
        FROM rooms r 
        LEFT JOIN clinics c ON r.clinic_id = c.id 
        WHERE r.is_deleted = 0 AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
    `;
    let params = [];
    if (clinicId && clinicId !== 0) {
      sql += " AND r.clinic_id = ?";
      params.push(clinicId);
    }
    sql += " ORDER BY r.id DESC";
    const [rows] = await db.execute(sql, params);
    return { data: rows };
  }

  async updateRoom(data) {
    const sql = `UPDATE rooms SET name=?, clinic_id=?, location=?, description=? WHERE id=? AND is_deleted = 0`;
    const clinicId = data.clinicId || data.clinic_id;
    await db.execute(sql, [data.name || null, clinicId, data.location || null, data.description || null, data.id]);
    return this.getRoomById(data.id);
  }

  async deleteRoom(id) {
    await db.execute("UPDATE rooms SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // ==========================================
  // 4. SERVICE (Gói dịch vụ)
  // ==========================================
  async createService(data) {
    const sql = `INSERT INTO services (name, price, description, image, content_html, content_markdown, is_deleted) VALUES (?, ?, ?, ?, ?, ?, 0)`;
    const [result] = await db.execute(sql, [data.name || null, data.price || 0, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getServiceById(result.insertId);
  }

  async getServiceById(id) {
    const [rows] = await db.execute("SELECT * FROM services WHERE id = ? AND is_deleted = 0", [id]);
    return rows[0];
  }

  async getAllServices() {
    const [rows] = await db.execute("SELECT * FROM services WHERE is_deleted = 0 ORDER BY id DESC");
    return { data: rows };
  }

  async updateService(data) {
    const sql = `UPDATE services SET name=?, price=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=? AND is_deleted = 0`;
    await db.execute(sql, [data.name || null, data.price || 0, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getServiceById(data.id);
  }

  async deleteService(id) {
    await db.execute("UPDATE services SET is_deleted = 1 WHERE id = ?", [id]);
    return true;
  }

  // ==========================================
  // 5. DRUGS (Thuốc)
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
  // 6. ALLCODES
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
    if (type && type !== "") {
      sql += " AND type = ?";
      params.push(type);
    }
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