const db = require("../config/database");

class MasterDataRepo {
  // --- 1. SPECIALTY ---
  async createSpecialty(data) {
    const sql = `INSERT INTO specialties (name, description, image, content_html, content_markdown) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [data.name || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getSpecialtyById(result.insertId);
  }
  async updateSpecialty(data) {
    const sql = `UPDATE specialties SET name=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=?`;
    await db.execute(sql, [data.name || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getSpecialtyById(data.id);
  }
  async getSpecialtyById(id) {
    const [rows] = await db.execute("SELECT * FROM specialties WHERE id = ?", [id]);
    return rows[0];
  }
  async getAllSpecialties() {
    const [rows] = await db.execute("SELECT * FROM specialties ORDER BY id DESC");
    return { data: rows };
  }
  async deleteSpecialty(id) { await db.execute("DELETE FROM specialties WHERE id = ?", [id]); return true; }

  // --- 2. CLINIC ---
  async createClinic(data) {
    const sql = `INSERT INTO clinics (name, address, description, image, content_html, content_markdown) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [data.name || null, data.address || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null]);
    return this.getClinicById(result.insertId);
  }
  async updateClinic(data) {
    const sql = `UPDATE clinics SET name=?, address=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=?`;
    await db.execute(sql, [data.name || null, data.address || null, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return this.getClinicById(data.id);
  }
  async getClinicById(id) {
    const [rows] = await db.execute("SELECT * FROM clinics WHERE id = ?", [id]);
    return rows[0];
  }
  async getAllClinics() {
    const [rows] = await db.execute("SELECT * FROM clinics ORDER BY id DESC");
    return { data: rows };
  }
  async deleteClinic(id) { await db.execute("DELETE FROM clinics WHERE id = ?", [id]); return true; }

  // --- 3. ROOM (ID, name, clinicId, location, description) ---
  async createRoom(data) {
    // 1. Insert dữ liệu vào bảng rooms
    const sqlInsert = `INSERT INTO rooms (name, clinic_id, location, description) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sqlInsert, [
      data.name || null, 
      data.clinicId || null, 
      data.location || null, 
      data.description || null // Nãy tui viết thiếu chữ 'data.' ở đây nè, sửa lại nhé!
    ]);

    // 2. Query lại để lấy thông tin kèm tên Clinic (clinicName)
    const sqlSelect = `
      SELECT r.*, c.name as clinicName 
      FROM rooms r 
      LEFT JOIN clinics c ON r.clinic_id = c.id 
      WHERE r.id = ?`;
    
    const [rows] = await db.execute(sqlSelect, [result.insertId]);

    // 3. Trả về object xịn xò
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
    // Sửa clinicId thành clinic_id cho đúng tên cột DB
    const [rows] = await db.execute("SELECT * FROM rooms WHERE clinic_id = ?", [clinicId]);
    return { data: rows };
  }

  // --- 4. SERVICE (ĐỒNG BỘ CÁCH TRẢ VỀ) ---
  async createService(data) {
    const sql = `INSERT INTO services (name, price, description, image, content_html, content_markdown) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name || null,
      data.price || 0,
      data.description || null,
      data.image || null,
      data.content_html || null,
      data.content_markdown || null
    ]);
    // Trả về thêm ID vào data ban đầu
    return { 
        id: result.insertId, 
        ...data 
    };
  }
  async deleteRoom(id) { await db.execute("DELETE FROM rooms WHERE id = ?", [id]); return true; }

  // --- 4. SERVICE (CÁI ÔNG CẦN NHẤT) ---
  async createService(data) {
    const sql = `INSERT INTO services (name, price, description, image, content_html, content_markdown) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name || null,
      data.price || 0,
      data.description || null,
      data.image || null,
      data.content_html || null,
      data.content_markdown || null
    ]);
    return { id: result.insertId, ...data };
  }
  async updateService(data) {
    const sql = `UPDATE services SET name=?, price=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=?`;
    await db.execute(sql, [data.name || null, data.price || 0, data.description || null, data.image || null, data.content_html || null, data.content_markdown || null, data.id]);
    return data;
  }
  async getAllServices() {
    const [rows] = await db.execute("SELECT * FROM services ORDER BY id DESC");
    return { data: rows };
  }
  async deleteService(id) { await db.execute("DELETE FROM services WHERE id = ?", [id]); return true; }

  // --- 5. DRUGS ---
  async createDrug(data) {
    const sql = `INSERT INTO drugs (name, unit, price, description, content_html, content_markdown) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [data.name || null, data.unit || null, data.price || 0, data.description || null, data.content_html || null, data.content_markdown || null]);
    return { id: result.insertId, ...data };
  }
  async getDrugById(id) {
    const [rows] = await db.execute("SELECT * FROM drugs WHERE id = ?", [id]);
    return rows[0];
  }
  async getAllDrugs() {
    const [rows] = await db.execute("SELECT * FROM drugs ORDER BY id DESC");
    return { data: rows };
  }

  // --- 6. ALLCODES ---
  async createAllCode(data) {
    const sql = `INSERT INTO allcodes (type, \`key\`, value_vi, value_en) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [data.type || null, data.key || null, data.value_vi || null, data.value_en || null]);
    return { id: result.insertId, ...data };
  }
  async getAllCodes(type) {
    const [rows] = await db.execute("SELECT * FROM allcodes WHERE type = ?", [type]);
    return { data: rows };
  }
  async deleteAllCode(id) { await db.execute("DELETE FROM allcodes WHERE id = ?", [id]); return true; }
}

module.exports = new MasterDataRepo();