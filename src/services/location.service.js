const locationRepo = require('../repositories/location.repo');

class LocationService {
    async addNewLocation(data, userId) {
        const patientId = await locationRepo.getPatientIdByUserId(userId);
        if (!patientId) throw new Error(`Không tìm thấy Patient cho User: ${userId}`);
        
        // Nếu địa chỉ mới này là mặc định, repo create sẽ lưu luôn. 
        // Nhưng nếu muốn chắc cú reset các cái cũ khi add mới + is_default=true, 
        // có thể gọi thêm logic reset ở đây nếu cần.
        data.patient_id = patientId;
        const locationId = await locationRepo.create(data);
        return { success: true, location_id: locationId };
    }

    async getListByUserId(userId) {
        const patientId = await locationRepo.getPatientIdByUserId(userId);
        if (!patientId) return [];
        return await locationRepo.getAllByPatientId(patientId);
    }

    async removeLocation(id) {
        return await locationRepo.delete(id);
    }

    async makeDefault(locationId) {
        return await locationRepo.setDefault(locationId);
    }
}

module.exports = new LocationService();