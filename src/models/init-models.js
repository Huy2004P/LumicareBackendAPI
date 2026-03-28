const DataTypes = require("sequelize").DataTypes;
const _admin_profiles = require("./admin_profiles");
const _allcodes = require("./allcodes");
const _appointment_records = require("./appointment_records");
const _appointments = require("./appointments");
const _booking_photos = require("./booking_photos");
const _bookings = require("./bookings");
const _clinics = require("./clinics");
const _doctor_services = require("./doctor_services");
const _doctors = require("./doctors");
const _drugs = require("./drugs");
const _feedbacks = require("./feedbacks");
const _notifications = require("./notifications");
const _patient_profiles = require("./patient_profiles");
const _patients = require("./patients");
const _prescriptions = require("./prescriptions");
const _rooms = require("./rooms");
const _schedules = require("./schedules");
const _services = require("./services");
const _specialties = require("./specialties");
const _treatments = require("./treatments");
const _users = require("./users");

function initModels(sequelize) {
  const admin_profiles = _admin_profiles(sequelize, DataTypes);
  const allcodes = _allcodes(sequelize, DataTypes);
  const appointment_records = _appointment_records(sequelize, DataTypes);
  const appointments = _appointments(sequelize, DataTypes);
  const booking_photos = _booking_photos(sequelize, DataTypes);
  const bookings = _bookings(sequelize, DataTypes);
  const clinics = _clinics(sequelize, DataTypes);
  const doctor_services = _doctor_services(sequelize, DataTypes);
  const doctors = _doctors(sequelize, DataTypes);
  const drugs = _drugs(sequelize, DataTypes);
  const feedbacks = _feedbacks(sequelize, DataTypes);
  const notifications = _notifications(sequelize, DataTypes);
  const patient_profiles = _patient_profiles(sequelize, DataTypes);
  const patients = _patients(sequelize, DataTypes);
  const prescriptions = _prescriptions(sequelize, DataTypes);
  const rooms = _rooms(sequelize, DataTypes);
  const schedules = _schedules(sequelize, DataTypes);
  const services = _services(sequelize, DataTypes);
  const specialties = _specialties(sequelize, DataTypes);
  const treatments = _treatments(sequelize, DataTypes);
  const users = _users(sequelize, DataTypes);

  doctors.belongsToMany(services, { as: 'service_id_services', through: doctor_services, foreignKey: "doctor_id", otherKey: "service_id" });
  services.belongsToMany(doctors, { as: 'doctor_id_doctors', through: doctor_services, foreignKey: "service_id", otherKey: "doctor_id" });
  appointment_records.belongsTo(appointments, { as: "appointment", foreignKey: "appointment_id"});
  appointments.hasMany(appointment_records, { as: "appointment_records", foreignKey: "appointment_id"});
  prescriptions.belongsTo(appointments, { as: "appointment", foreignKey: "appointment_id"});
  appointments.hasMany(prescriptions, { as: "prescriptions", foreignKey: "appointment_id"});
  treatments.belongsTo(appointments, { as: "appointment", foreignKey: "appointment_id"});
  appointments.hasMany(treatments, { as: "treatments", foreignKey: "appointment_id"});
  appointments.belongsTo(bookings, { as: "booking", foreignKey: "booking_id"});
  bookings.hasOne(appointments, { as: "appointment", foreignKey: "booking_id"});
  booking_photos.belongsTo(bookings, { as: "booking", foreignKey: "booking_id"});
  bookings.hasMany(booking_photos, { as: "booking_photos", foreignKey: "booking_id"});
  feedbacks.belongsTo(bookings, { as: "booking", foreignKey: "booking_id"});
  bookings.hasOne(feedbacks, { as: "feedback", foreignKey: "booking_id"});
  rooms.belongsTo(clinics, { as: "clinic", foreignKey: "clinic_id"});
  clinics.hasMany(rooms, { as: "rooms", foreignKey: "clinic_id"});
  appointments.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(appointments, { as: "appointments", foreignKey: "doctor_id"});
  bookings.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(bookings, { as: "bookings", foreignKey: "doctor_id"});
  doctor_services.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(doctor_services, { as: "doctor_services", foreignKey: "doctor_id"});
  schedules.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(schedules, { as: "schedules", foreignKey: "doctor_id"});
  prescriptions.belongsTo(drugs, { as: "drug", foreignKey: "drug_id"});
  drugs.hasMany(prescriptions, { as: "prescriptions", foreignKey: "drug_id"});
  bookings.belongsTo(patient_profiles, { as: "profile", foreignKey: "profile_id"});
  patient_profiles.hasMany(bookings, { as: "bookings", foreignKey: "profile_id"});
  bookings.belongsTo(patients, { as: "patient", foreignKey: "patient_id"});
  patients.hasMany(bookings, { as: "bookings", foreignKey: "patient_id"});
  feedbacks.belongsTo(patients, { as: "patient", foreignKey: "patient_id"});
  patients.hasMany(feedbacks, { as: "feedbacks", foreignKey: "patient_id"});
  patient_profiles.belongsTo(patients, { as: "owner_patient", foreignKey: "owner_patient_id"});
  patients.hasMany(patient_profiles, { as: "patient_profiles", foreignKey: "owner_patient_id"});
  doctors.belongsTo(rooms, { as: "room", foreignKey: "room_id"});
  rooms.hasMany(doctors, { as: "doctors", foreignKey: "room_id"});
  bookings.belongsTo(services, { as: "service", foreignKey: "service_id"});
  services.hasMany(bookings, { as: "bookings", foreignKey: "service_id"});
  doctor_services.belongsTo(services, { as: "service", foreignKey: "service_id"});
  services.hasMany(doctor_services, { as: "doctor_services", foreignKey: "service_id"});
  doctors.belongsTo(specialties, { as: "specialty", foreignKey: "specialty_id"});
  specialties.hasMany(doctors, { as: "doctors", foreignKey: "specialty_id"});
  services.belongsTo(specialties, { as: "specialty", foreignKey: "specialty_id"});
  specialties.hasMany(services, { as: "services", foreignKey: "specialty_id"});
  admin_profiles.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(admin_profiles, { as: "admin_profiles", foreignKey: "user_id"});
  doctors.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(doctors, { as: "doctor", foreignKey: "user_id"});
  feedbacks.belongsTo(users, { as: "doctor", foreignKey: "doctor_id"});
  users.hasMany(feedbacks, { as: "feedbacks", foreignKey: "doctor_id"});
  notifications.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "user_id"});
  patients.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(patients, { as: "patient", foreignKey: "user_id"});

  return {
    admin_profiles,
    allcodes,
    appointment_records,
    appointments,
    booking_photos,
    bookings,
    clinics,
    doctor_services,
    doctors,
    drugs,
    feedbacks,
    notifications,
    patient_profiles,
    patients,
    prescriptions,
    rooms,
    schedules,
    services,
    specialties,
    treatments,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
