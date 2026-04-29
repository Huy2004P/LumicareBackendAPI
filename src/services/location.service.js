const locationRepo = require('../repositories/location.repo');

class LocationService {
    // Thêm một địa chỉ mới cho bệnh nhân dựa trên userId
    async addNewLocation(data, userId) {
        const patientId = await locationRepo.getPatientIdByUserId(userId);
        if (!patientId) throw new Error(`Không tìm thấy Patient cho User: ${userId}`);
        data.patient_id = patientId;
        const locationId = await locationRepo.create(data);
        return { success: true, location_id: locationId };
    }
    // Lấy danh sách địa chỉ của bệnh nhân dựa trên userId
    async getListByUserId(userId) {
        const patientId = await locationRepo.getPatientIdByUserId(userId);
        if (!patientId) return [];
        return await locationRepo.getAllByPatientId(patientId);
    }
    // Xoá thông tin địa chỉ dựa trên locationId
    async removeLocation(id) {
        return await locationRepo.delete(id);
    }
    // Đặt một địa chỉ làm mặc định dựa trên locationId
    async makeDefault(locationId) {
        return await locationRepo.setDefault(locationId);
    }
}

module.exports = new LocationService();