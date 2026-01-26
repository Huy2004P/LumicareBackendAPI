const db = require("../config/database");

class DoctorRepo {
  //Tao moi bac si (danh cho admin)
  async create(data) {
    const sql = `
      INSERT INTO doctors 
      (user_id, full_name, phone, position, description, price, avatar, specialty_id, room_id, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;
    await db.execute(sql, [
      data.userId,
      data.fullName,
      data.phone,
      data.position,
      data.description,
      data.price,
      data.avatar,
      data.specialtyId,
      data.roomId,
    ]);

    const [rows] = await db.execute(`
      SELECT d.*, s.name as specialty_name, r.name as room_name, c.name as clinic_name
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      ORDER BY d.id DESC LIMIT 1
    `);

    return rows[0];
  }

  // 2. lay danh sach bac si
  async findAll(filter = {}) {
    let sql = `
      SELECT d.*, u.email, s.name as specialty_name, r.name as room_name, c.name as clinic_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
    `;

    const params = [];
    const conditions = [];

    if (filter.specialtyId) {
      conditions.push("d.specialty_id = ?");
      params.push(filter.specialtyId);
    }
    // Lọc theo Room
    if (filter.roomId) {
      conditions.push("d.room_id = ?");
      params.push(filter.roomId);
    }
    if (filter.searchTerm) {
      conditions.push("d.full_name LIKE ?");
      params.push(`%${filter.searchTerm}%`);
    }

    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");

    sql += " ORDER BY d.id DESC";

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // 3. xem chi tiet bac si
  async findById(id) {
    const sql = `
      SELECT d.*, u.email, s.name as specialty_name, r.name as room_name, c.name as clinic_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      WHERE d.id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
}

module.exports = new DoctorRepo();
