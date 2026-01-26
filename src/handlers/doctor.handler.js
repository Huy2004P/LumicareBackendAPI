const doctorService = require("../services/doctor.service");

// Helper function de map du lieu tu DB sang proto
const mapDoctorToResponse = (d) => ({
  id: d.id,
  fullName: d.full_name,
  email: d.email,
  phone: d.phone,
  position: d.position,
  description: d.description,
  price: d.price,
  avatar: d.avatar,
  specialtyName: d.specialty_name || "",
  roomName: d.room_name || "", // Moi
  clinicName: d.clinic_name || "", // Moi
  active: !!d.active, // Chuyen int 1/0 sang boolean
});

//tao bac si
const createDoctor = async (call, callback) => {
  try {
    const result = await doctorService.createDoctor(call.request);
    callback(null, mapDoctorToResponse(result));
  } catch (error) {
    console.error("Error:", error.message);
    callback({ code: 13, details: error.message });
  }
};

//lay toan bo bac si
const getAllDoctors = async (call, callback) => {
  try {
    const doctors = await doctorService.getAllDoctors(call.request);
    callback(null, { doctors: doctors.map(mapDoctorToResponse) });
  } catch (error) {
    callback({ code: 13, details: error.message });
  }
};

//lay bac si theo id
const getDoctorById = async (call, callback) => {
  try {
    const doctor = await doctorService.getDoctorById(call.request.id);
    callback(null, mapDoctorToResponse(doctor));
  } catch (error) {
    callback({ code: 5, details: error.message });
  }
};

module.exports = { createDoctor, getAllDoctors, getDoctorById };
