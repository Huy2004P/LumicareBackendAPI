const db = require('../config/database');

class LocationRepository {
    async getPatientIdByUserId(userId) {
        const [rows] = await db.execute("SELECT id FROM patients WHERE user_id = ? LIMIT 1", [userId]);
        return rows.length > 0 ? rows[0].id : null;
    }

    async create(data) {
        const query = `
            INSERT INTO locations 
            (patient_id, label, address_detail, province, district, ward, latitude, longitude, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [data.patient_id, data.label, data.address_detail, data.province, data.district, data.ward, data.latitude, data.longitude, data.is_default];
        const [result] = await db.execute(query, values);
        return result.insertId;
    }

    async getAllByPatientId(patientId) {
        const query = "SELECT * FROM locations WHERE patient_id = ? ORDER BY is_default DESC, created_at DESC";
        const [rows] = await db.execute(query, [patientId]);
        return rows;
    }

    async delete(id) {
        const [result] = await db.execute("DELETE FROM locations WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    // Logic Set Default: Phải biết location này của patient nào để reset các cái khác
    async setDefault(locationId) {
        // 1. Tìm patient_id của cái location này trước
        const [loc] = await db.execute("SELECT patient_id FROM locations WHERE id = ?", [locationId]);
        if (loc.length === 0) return false;
        
        const patientId = loc[0].patient_id;

        // 2. Reset tất cả địa chỉ của patient này về 0
        await db.execute("UPDATE locations SET is_default = 0 WHERE patient_id = ?", [patientId]);

        // 3. Set cái được chọn lên 1
        const [result] = await db.execute("UPDATE locations SET is_default = 1 WHERE id = ?", [locationId]);
        return result.affectedRows > 0;
    }
}

module.exports = new LocationRepository();