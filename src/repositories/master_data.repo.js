const db = require("../config/database");

class MasterDataRepo {
  // =========================================================
  // 1. CHUYÊN KHOA (SPECIALTY)
  // =========================================================
  async createSpecialty(data) {
    const sql = `INSERT INTO specialties (name, description, image, content_html, content_markdown) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name,
      data.description,
      data.image,
      data.content_html,
      data.content_markdown,
    ]);
    return this.getSpecialtyById(result.insertId);
  }

  async updateSpecialty(data) {
    const sql = `UPDATE specialties SET name=?, description=?, image=?, content_html=?, content_markdown=? WHERE id=?`;
    await db.execute(sql, [
      data.name,
      data.description,
      data.image,
      data.content_html,
      data.content_markdown,
      data.id,
    ]);
    return this.getSpecialtyById(data.id);
  }

  async deleteSpecialty(id) {
    // Lưu ý: Nếu muốn Soft Delete thì đổi thành UPDATE specialties SET active=0...
    await db.execute("DELETE FROM specialties WHERE id = ?", [id]);
    return true;
  }

  async getSpecialtyById(id) {
    const [rows] = await db.execute("SELECT * FROM specialties WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  async getAllSpecialties({ keyword, limit, offset }) {
    let sql = "SELECT * FROM specialties";
    let countSql = "SELECT COUNT(*) as total FROM specialties";
    const params = [];

    if (keyword) {
      const filter = ` WHERE name LIKE ?`;
      sql += filter;
      countSql += filter;
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    // Limit và Offset phải là số nguyên
    params.push(Number(limit) || 10, Number(offset) || 0);

    const [rows] = await db.execute(sql, params);

    // Đếm tổng số để phân trang
    const [countRows] = await db.execute(
      countSql,
      keyword ? [`%${keyword}%`] : [],
    );

    return { data: rows, total_count: countRows[0].total };
  }

  // =========================================================
  // 2. CƠ SỞ Y TẾ (CLINIC)
  // =========================================================
  async createClinic(data) {
    // Proto có thêm trường 'type'
    const sql = `INSERT INTO clinics (name, address, description, image, type) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name,
      data.address,
      data.description,
      data.image,
      data.type,
    ]);
    return this.getClinicById(result.insertId);
  }

  async updateClinic(data) {
    const sql = `UPDATE clinics SET name=?, address=?, description=?, image=?, type=? WHERE id=?`;
    await db.execute(sql, [
      data.name,
      data.address,
      data.description,
      data.image,
      data.type || "", // Handle null nếu cần
      data.id,
    ]);
    return this.getClinicById(data.id);
  }

  async deleteClinic(id) {
    await db.execute("DELETE FROM clinics WHERE id = ?", [id]);
    return true;
  }

  async getClinicById(id) {
    const [rows] = await db.execute("SELECT * FROM clinics WHERE id = ?", [id]);
    return rows[0];
  }

  async getAllClinics({ keyword, limit, offset }) {
    let sql = "SELECT * FROM clinics";
    let countSql = "SELECT COUNT(*) as total FROM clinics";
    const params = [];

    if (keyword) {
      const filter = ` WHERE name LIKE ?`;
      sql += filter;
      countSql += filter;
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(Number(limit) || 10, Number(offset) || 0);

    const [rows] = await db.execute(sql, params);
    const [countRows] = await db.execute(
      countSql,
      keyword ? [`%${keyword}%`] : [],
    );

    return { data: rows, total_count: countRows[0].total };
  }

  // =========================================================
  // 3. PHÒNG KHÁM (ROOM)
  // =========================================================
  async createRoom(data) {
    const sql = `INSERT INTO rooms (name, clinic_id, location, description) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name,
      data.clinicId,
      data.location,
      data.description,
    ]);
    return this.getRoomById(result.insertId); // Dùng hàm getById để join bảng lấy tên clinic
  }

  async updateRoom(data) {
    const sql = `UPDATE rooms SET name=?, location=?, description=? WHERE id=?`;
    // Lưu ý: Thường ít khi cho update clinic_id, nếu cần thì thêm vào
    await db.execute(sql, [
      data.name,
      data.location,
      data.description,
      data.id,
    ]);
    return this.getRoomById(data.id);
  }

  async deleteRoom(id) {
    await db.execute("DELETE FROM rooms WHERE id = ?", [id]);
    return true;
  }

  async getRoomById(id) {
    // Join để lấy tên Clinic
    const sql = `
        SELECT r.*, c.name as clinic_name 
        FROM rooms r 
        LEFT JOIN clinics c ON r.clinic_id = c.id 
        WHERE r.id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  async getAllRooms({ clinicId, keyword }) {
    let sql = `
        SELECT r.*, c.name as clinic_name 
        FROM rooms r 
        LEFT JOIN clinics c ON r.clinic_id = c.id 
        WHERE 1=1
    `;
    const params = [];

    if (clinicId) {
      sql += " AND r.clinic_id = ?";
      params.push(clinicId);
    }

    if (keyword) {
      sql += " AND r.name LIKE ?";
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY r.id DESC";
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // =========================================================
  // 4. DỊCH VỤ (SERVICE)
  // =========================================================
  async createService(data) {
    // Proto chưa có content_html/markdown cho service trong đoạn bạn gửi
    // Nhưng nếu DB có thì nên thêm, ở đây tôi làm theo đúng Proto bạn gửi
    const sql = `INSERT INTO services (name, price, description, image) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name,
      data.price,
      data.description,
      data.image,
    ]);
    return this.getServiceById(result.insertId);
  }

  async updateService(data) {
    const sql = `UPDATE services SET name=?, price=?, description=?, image=? WHERE id=?`;
    await db.execute(sql, [
      data.name,
      data.price,
      data.description,
      data.image,
      data.id,
    ]);
    return this.getServiceById(data.id);
  }

  async deleteService(id) {
    await db.execute("DELETE FROM services WHERE id = ?", [id]);
    return true;
  }

  async getServiceById(id) {
    const [rows] = await db.execute("SELECT * FROM services WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  async getAllServices({ keyword, limit, offset }) {
    let sql = "SELECT * FROM services";
    let countSql = "SELECT COUNT(*) as total FROM services";
    const params = [];

    if (keyword) {
      const filter = " WHERE name LIKE ?";
      sql += filter;
      countSql += filter;
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(Number(limit) || 10, Number(offset) || 0);

    const [rows] = await db.execute(sql, params);
    const [countRows] = await db.execute(
      countSql,
      keyword ? [`%${keyword}%`] : [],
    );

    return { data: rows, total_count: countRows[0].total };
  }

  // =========================================================
  // 5. THUỐC (DRUGS) - MỚI
  // =========================================================
  async createDrug(data) {
    const sql = `INSERT INTO drugs (name, unit, price, description, content_html, content_markdown) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.name,
      data.unit,
      data.price,
      data.description,
      data.content_html,
      data.content_markdown,
    ]);
    return this.getDrugById(result.insertId);
  }

  async updateDrug(data) {
    const sql = `UPDATE drugs SET name=?, unit=?, price=?, description=?, content_html=?, content_markdown=? WHERE id=?`;
    await db.execute(sql, [
      data.name,
      data.unit,
      data.price,
      data.description,
      data.content_html,
      data.content_markdown,
      data.id,
    ]);
    return this.getDrugById(data.id);
  }

  async deleteDrug(id) {
    await db.execute("DELETE FROM drugs WHERE id = ?", [id]);
    return true;
  }

  async getDrugById(id) {
    const [rows] = await db.execute("SELECT * FROM drugs WHERE id = ?", [id]);
    return rows[0];
  }

  async getAllDrugs({ keyword, limit, offset }) {
    let sql = "SELECT * FROM drugs";
    let countSql = "SELECT COUNT(*) as total FROM drugs";
    const params = [];

    if (keyword) {
      const filter = " WHERE name LIKE ?";
      sql += filter;
      countSql += filter;
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(Number(limit) || 10, Number(offset) || 0);

    const [rows] = await db.execute(sql, params);
    const [countRows] = await db.execute(
      countSql,
      keyword ? [`%${keyword}%`] : [],
    );

    return { data: rows, total_count: countRows[0].total };
  }

  // =========================================================
  // 6. ALLCODES (MÃ CHUNG) - MỚI
  // =========================================================
  async createAllCode(data) {
    // Chữ 'key' là từ khóa SQL nên cần bọc backticks ``
    const sql = `INSERT INTO allcodes (type, \`key\`, value_vi, value_en) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      data.type,
      data.key,
      data.value_vi,
      data.value_en,
    ]);
    // Với AllCode có thể không cần getById phức tạp, trả về object luôn cho nhanh
    return { id: result.insertId, ...data };
  }

  async updateAllCode(data) {
    const sql = `UPDATE allcodes SET type=?, \`key\`=?, value_vi=?, value_en=? WHERE id=?`;
    await db.execute(sql, [
      data.type,
      data.key,
      data.value_vi,
      data.value_en,
      data.id,
    ]);
    return { id: data.id, ...data };
  }

  async deleteAllCode(id) {
    await db.execute("DELETE FROM allcodes WHERE id = ?", [id]);
    return true;
  }

  async getAllCodes(type) {
    let sql = "SELECT * FROM allcodes";
    const params = [];

    if (type) {
      sql += " WHERE type = ?";
      params.push(type);
    }

    // AllCodes thường ít nên không cần phân trang
    const [rows] = await db.execute(sql, params);
    return { data: rows }; // Trả về dạng { data: [...] } để khớp với AllCodeListResponse
  }
}

module.exports = new MasterDataRepo();

// const db = require("../config/database");

// class MasterDataRepo {
//   // 1. CHUYÊN KHOA (Fix lỗi trả về id: 0)
//   async createSpecialty(data) {
//     // B1: Insert
//     const sql =
//       "INSERT INTO specialties (name, description, image) VALUES (?, ?, ?)";
//     await db.execute(sql, [data.name, data.description, data.image]);

//     // B2: Query lấy lại ngay thằng vừa tạo (Lấy thằng mới nhất)
//     const [rows] = await db.execute(
//       "SELECT * FROM specialties ORDER BY id DESC LIMIT 1"
//     );
//     return rows[0];
//   }

//   async getAllSpecialties() {
//     const [rows] = await db.execute("SELECT * FROM specialties");
//     return rows;
//   }

//   // 2. PHÒNG KHÁM (Fix lỗi trả về id: 0)
//   async createClinic(data) {
//     const sql =
//       "INSERT INTO clinics (name, address, description, image) VALUES (?, ?, ?, ?)";
//     await db.execute(sql, [
//       data.name,
//       data.address,
//       data.description,
//       data.image,
//     ]);

//     // Query lại ID thật
//     const [rows] = await db.execute(
//       "SELECT * FROM clinics ORDER BY id DESC LIMIT 1"
//     );
//     return rows[0];
//   }

//   async getAllClinics() {
//     const [rows] = await db.execute("SELECT * FROM clinics");
//     return rows;
//   }

//   // 3. PHÒNG - ROOM (Fix lỗi trả về id: 0)
//   async createRoom(data) {
//     const sql =
//       "INSERT INTO rooms (name, clinic_id, location, description) VALUES (?, ?, ?, ?)";
//     await db.execute(sql, [
//       data.name,
//       data.clinicId,
//       data.location,
//       data.description,
//     ]);

//     // Query lại ID thật + Join tên Clinic luôn
//     const [rows] = await db.execute(`
//       SELECT r.id, r.name, r.location, r.description, c.name as clinic_name
//       FROM rooms r
//       JOIN clinics c ON r.clinic_id = c.id
//       ORDER BY r.id DESC LIMIT 1
//     `);
//     return rows[0];
//   }

//   async getAllRooms(clinicId) {
//     let sql = `
//       SELECT r.id, r.name, r.location, r.description, c.name as clinic_name
//       FROM rooms r
//       JOIN clinics c ON r.clinic_id = c.id
//     `;
//     const params = [];
//     if (clinicId) {
//       sql += " WHERE r.clinic_id = ?";
//       params.push(clinicId);
//     }
//     const [rows] = await db.execute(sql, params);
//     return rows;
//   }

//   // 4. DỊCH VỤ (Fix lỗi trả về id: 0)
//   async createService(data) {
//     // Thêm cột image vào câu lệnh SQL
//     const sql =
//       "INSERT INTO services (name, price, description, image) VALUES (?, ?, ?, ?)";

//     // Truyền tham số theo đúng thứ tự
//     await db.execute(sql, [
//       data.name,
//       data.price,
//       data.description,
//       data.image,
//     ]);

//     // Query lại lấy dòng vừa tạo (Trả về Object)
//     const [rows] = await db.execute(
//       "SELECT * FROM services ORDER BY id DESC LIMIT 1"
//     );
//     return rows[0];
//   }

//   async getAllServices() {
//     const [rows] = await db.execute("SELECT * FROM services");
//     return rows;
//   }
// }

// module.exports = new MasterDataRepo();
