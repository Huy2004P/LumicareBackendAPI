const doctorRepo = require("../repositories/doctor.repo");
const userRepo = require("../repositories/user.repo");
const masterDataRepo = require("../repositories/masterData.repo");
const bcrypt = require("bcryptjs");

class DoctorService {
  async createDoctor(data) {
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) throw new Error("Email này đã được sử dụng!");
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userId = await userRepo.create({
      email: data.email,
      password: hashedPassword,
      role: 'doctor',
      fullName: data.fullName
    });

    const doctorId = await doctorRepo.create({
      user_id: userId,
      full_name: data.fullName,
      phone: data.phone,
      position: data.position,
      description: data.description,
      price: data.price,
      avatar: data.avatar,
      specialty_id: data.specialtyId,
      room_id: data.roomId
    });
    return await this.getDoctorById(doctorId);
  }

  async getAllDoctors(filter) {
    const safeFilter = {
      searchTerm: filter?.searchTerm || null,
      specialtyId: filter?.specialtyId || 0,
      roomId: filter?.roomId || 0
    };
    return await doctorRepo.findAll(safeFilter);
  }

  async getDoctorById(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Không tìm thấy bác sĩ trong hệ thống!");
    return doctor;
  }

  async assignServicesToDoctor(data) {
    const { doctorId, serviceIds } = data;
    const doctor = await doctorRepo.findById(doctorId);
    if (!doctor) throw new Error("Bác sĩ không tồn tại!");

    const masterServices = await masterDataRepo.getServicesByIds(serviceIds);
    if (!masterServices || masterServices.length === 0) {
      throw new Error("Danh sách dịch vụ cung cấp không hợp lệ!");
    }

    for (const service of masterServices) {
      if (service.specialty_id !== doctor.specialty_id) {
        throw new Error(`Dịch vụ "${service.name}" không thuộc chuyên khoa của bác sĩ ${doctor.full_name}!`);
      }
    }

    await doctorRepo.assignServices(doctorId, serviceIds);
    return { success: true, message: "Cập nhật danh sách dịch vụ thành công!" };
  }

  async getDoctorServices(doctorId) {
    const doctor = await this.getDoctorById(doctorId);
    const services = await doctorRepo.getServicesByDoctorId(doctorId);
    return {
      doctorName: doctor.full_name,
      data: services
    };
  }

  async globalSearch(query, limit) {
    if (!query || query.trim() === "") return [];
    return await doctorRepo.globalSearch(query, limit);
  }

  async updateDoctor(data) {
    const doctor = await doctorRepo.findById(data.id);
    if (!doctor) throw new Error("Không tìm thấy bác sĩ để cập nhật!");
    
    await doctorRepo.update(data.id, data);
    return await this.getDoctorById(data.id);
  }

  async deleteDoctor(id) {
    const doctor = await doctorRepo.findById(id);
    if (!doctor) throw new Error("Bác sĩ không tồn tại hoặc đã bị xóa!");

    // Gọi logic xóa mềm chặt chẽ từ Repo
    return await doctorRepo.softDeleteDoctor(id);
  }
}

module.exports = new DoctorService();