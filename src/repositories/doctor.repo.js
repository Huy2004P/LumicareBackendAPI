const db = require("../config/database");

class DoctorRepository {
  async create(data) {
    const sql = `
      INSERT INTO doctors (user_id, full_name, phone, position, description, price, avatar, specialty_id, room_id, active, is_deleted, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
    `;
    const [result] = await db.execute(sql, [
      data.user_id, data.full_name, data.phone, data.position, 
      data.description, data.price, data.avatar, data.specialty_id, data.room_id
    ]);
    return result.insertId;
  }

  async findAll(filter) {
    let sql = `
      SELECT 
        d.*, 
        u.email, 
        s.name as specialty_name, 
        d.specialty_id, 
        r.name as room_name, 
        c.name as clinic_name 
      FROM doctors d 
      LEFT JOIN users u ON d.user_id = u.id 
      LEFT JOIN specialties s ON d.specialty_id = s.id 
      LEFT JOIN rooms r ON d.room_id = r.id 
      LEFT JOIN clinics c ON r.clinic_id = c.id 
      WHERE d.is_deleted = 0
    `;
    const params = [];
    if (filter.searchTerm) {
      sql += " AND d.full_name LIKE ?";
      params.push(`%${filter.searchTerm}%`);
    }
    if (filter.specialtyId > 0) {
      sql += " AND d.specialty_id = ?";
      params.push(filter.specialtyId);
    }
    sql += " ORDER BY d.created_at DESC";

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT 
        d.*, 
        u.email, 
        s.name as specialty_name, 
        d.specialty_id, 
        r.name as room_name, 
        c.name as clinic_name 
      FROM doctors d 
      LEFT JOIN users u ON d.user_id = u.id 
      LEFT JOIN specialties s ON d.specialty_id = s.id 
      LEFT JOIN rooms r ON d.room_id = r.id 
      LEFT JOIN clinics c ON r.clinic_id = c.id 
      WHERE d.id = ? AND d.is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  async assignServices(doctorId, serviceIds) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query("DELETE FROM doctor_services WHERE doctor_id = ?", [doctorId]);
      if (serviceIds && serviceIds.length > 0) {
        const values = serviceIds.map(sId => [doctorId, sId]);
        await connection.query("INSERT INTO doctor_services (doctor_id, service_id) VALUES ?", [values]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getServicesByDoctorId(doctorId) {
    const sql = `
      SELECT s.id, s.name, s.price, s.description, s.image 
      FROM services s 
      INNER JOIN doctor_services ds ON s.id = ds.service_id 
      WHERE ds.doctor_id = ? AND s.is_deleted = 0
    `;
    const [rows] = await db.execute(sql, [doctorId]);
    return rows;
  }

  async globalSearch(query, limit) {
    const term = `%${query}%`;
    const sql = `
      (SELECT d.id, d.full_name as name, s.name as subTitle, d.avatar, 'doctor' as type 
       FROM doctors d 
       LEFT JOIN specialties s ON d.specialty_id = s.id 
       WHERE d.full_name LIKE ? AND d.is_deleted = 0)
      UNION
      (SELECT id, name, 'Phòng khám' as subTitle, image as avatar, 'clinic' as type 
       FROM clinics 
       WHERE name LIKE ? AND is_deleted = 0)
      UNION
      (SELECT id, name, 'Chuyên khoa' as subTitle, image as avatar, 'specialty' as type 
       FROM specialties 
       WHERE name LIKE ? AND is_deleted = 0)
      LIMIT ?
    `;
    const [rows] = await db.execute(sql, [term, term, term, limit]);
    return rows;
  }
}

module.exports = new DoctorRepository();