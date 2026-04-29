const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Hàm load proto file
const loadProto = (filename) => {
  const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "../protos", filename),
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }
  );
  return grpc.loadPackageDefinition(packageDefinition);
};

// Hàm đăng ký services vào server
const registerServices = (server, handlers, interceptor) => {
  const services = [
    { proto: "auth.proto", pkg: "auth", service: "AuthService", handler: handlers.auth },
    { proto: "profile.proto", pkg: "profile", service: "ProfileService", handler: handlers.profile, private: true },
    { proto: "master_data.proto", pkg: "master_data", service: "MasterDataService", handler: handlers.master },
    { proto: "doctor.proto", pkg: "doctor", service: "DoctorService", handler: handlers.doctor },
    { proto: "schedule.proto", pkg: "schedule", service: "ScheduleService", handler: handlers.schedule, private: true },
    { proto: "booking.proto", pkg: "booking", service: "BookingService", handler: handlers.booking, private: true },
    { proto: "appointment.proto", pkg: "appointment", service: "AppointmentService", handler: handlers.appointment, private: true },
    { proto: "patientProfile.proto", pkg: "patient_profile", service: "PatientProfileService", handler: handlers.patientProfile, private: true },
    { proto: "notification.proto", pkg: "notification", service: "NotificationService", handler: handlers.notification },
    { proto: "statistic.proto", pkg: "statistic", service: "StatisticService", handler: handlers.statistic },
    { proto: "feedback.proto", pkg: "feedback", service: "FeedbackService", handler: handlers.feedback },
  ];
  services.forEach((s) => {
    const protoPkg = loadProto(s.proto)[s.pkg];
    const implementation = {};
    Object.keys(s.handler).forEach((method) => {
      implementation[method] = s.private ? interceptor(s.handler[method]) : s.handler[method];
    });
    server.addService(protoPkg[s.service].service, implementation);
  });
};

module.exports = registerServices;