require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { Server } = require('socket.io');
const http = require("http");
const express = require('express'); // 🎯 THÊM EXPRESS

// --- 1. KHỞI TẠO EXPRESS & SOCKET.IO ---
const appExpress = express();
const httpServer = http.createServer(appExpress); // Cho Express chạy chung httpServer
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// --- 2. LOGIC SOCKET.IO ---
io.on("connection", (socket) => {
  console.log("Co thiet bi ket noi socket:", socket.id);

  socket.on("register", (userId) => {
    const cleanId = String(userId).replace(/['"]+/g, ''); 
    const roomName = `user_${cleanId}`;
    socket.join(roomName);
    console.log(`User ${cleanId} da join phong: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("Thiet bi ngat ket noi socket");
  });
});

global._io = io; // Lưu biến global để dùng ở các handler khác

// --- 3. 🎯 ROUTE "CỬA SAU" ĐỂ FAKE THANH TOÁN (DÙNG ĐỂ DEMO) ---
appExpress.get('/fake-pay/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log(`🚀 [FAKE PAYMENT] Đang bắn tín hiệu thành công cho User: ${userId}`);

    if (global._io) {
        // Bắn đúng cái Event mà Flutter đang lắng nghe
        global._io.to(`user_${userId}`).emit("PAYMENT_SUCCESS_EVENT", {
            status: "PAID",
            message: "Hệ thống đã nhận được tiền thành công!"
        });
        return res.send(`✅ Đã "phù phép" cho User ${userId} thành công! App sẽ tự nhảy trang.`);
    }
    res.status(500).send("❌ Lỗi: Socket.io chưa sẵn sàng");
});

// Chạy Server Socket & Express
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(SOCKET_PORT, () => {
  console.log(`🚀 Socket.io & Fake-Pay Route dang chay tai port: ${SOCKET_PORT}`);
});

// --- 4. IMPORT CÁC HANDLER gRPC ---
const authHandler = require("./handlers/auth.handler");
const profileHandler = require("./handlers/profile.handler");
const masterHandler = require("./handlers/master_data.handler");
const doctorHandler = require("./handlers/doctor.handler");
const scheduleHandler = require("./handlers/schedule.handler");
const bookingHandler = require("./handlers/booking.handler");
const appointmentHandler = require("./handlers/appointment.handler");
const patientProfileHandler = require("./handlers/patientProfile.handler");
const notificationHandler = require("./handlers/notification.handler");
const statisticHandler = require("./handlers/statistic.handler");
const feedbackHandler = require("./handlers/feedback.handler");
const locationHandler = require("./handlers/location.handler");
const checkAuth = require("./utils/grpc.interceptor");
const searchHandler = require("./handlers/search.handler");
const treatmentHandler = require("./handlers/treatment.handler");
const paymentHandler = require("./handlers/payment.handler");
const userHandler = require("./handlers/user.handler");

// --- 5. CẤU HÌNH gRPC SERVER ---
const server = new grpc.Server();

const loadProto = (filename) => {
  const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "protos", filename),
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    },
  );
  return grpc.loadPackageDefinition(packageDefinition);
};

// Đăng ký các dịch vụ gRPC (Tui giữ nguyên logic cũ của ông)
const authPackage = loadProto("auth.proto").auth;
server.addService(authPackage.AuthService.service, {
  Register: authHandler.register,
  Login: authHandler.login,
  RefreshToken: authHandler.refreshToken,
  Logout: authHandler.logout,
  ForgotPassword: authHandler.forgotPassword,
  ResetPassword: authHandler.resetPassword,
  VerifyOTP: authHandler.VerifyOTP,
});

const profilePackage = loadProto("profile.proto").profile;
server.addService(profilePackage.ProfileService.service, {
  GetMyProfile: checkAuth(profileHandler.GetMyProfile),
  UpdateProfile: checkAuth(profileHandler.UpdateProfile),
  RequestChangePasswordOTP: checkAuth(profileHandler.RequestChangePasswordOTP),
  ChangePassword: checkAuth(profileHandler.ChangePassword),
});

const masterPackage = loadProto("master_data.proto").master_data;
server.addService(masterPackage.MasterDataService.service, {
  CreateSpecialty: masterHandler.CreateSpecialty,
  UpdateSpecialty: masterHandler.UpdateSpecialty,
  DeleteSpecialty: masterHandler.DeleteSpecialty,
  GetSpecialtyById: masterHandler.GetSpecialtyById,
  GetAllSpecialties: masterHandler.GetAllSpecialties,
  CreateClinic: masterHandler.CreateClinic,
  UpdateClinic: masterHandler.UpdateClinic,
  DeleteClinic: masterHandler.DeleteClinic,
  GetClinicById: masterHandler.GetClinicById,
  GetAllClinics: masterHandler.GetAllClinics,
  CreateRoom: masterHandler.CreateRoom,
  UpdateRoom: masterHandler.UpdateRoom,
  DeleteRoom: masterHandler.DeleteRoom,
  GetRoomById: masterHandler.GetRoomById,
  GetAllRooms: masterHandler.GetAllRooms,
  GetRoomsByClinicId: masterHandler.GetRoomsByClinicId,
  CreateService: masterHandler.CreateService,
  UpdateService: masterHandler.UpdateService,
  DeleteService: masterHandler.DeleteService,
  GetServiceById: masterHandler.GetServiceById,
  GetAllServices: masterHandler.GetAllServices,
  GetDoctorsByService: masterHandler.GetDoctorsByService,
  GetDoctorsByRoomId: masterHandler.GetDoctorsByRoomId,
  CreateDrug: masterHandler.CreateDrug,
  UpdateDrug: masterHandler.UpdateDrug,
  DeleteDrug: masterHandler.DeleteDrug,
  GetDrugById: masterHandler.GetDrugById,
  GetAllDrugs: masterHandler.GetAllDrugs,
  CreateAllCode: masterHandler.CreateAllCode,
  UpdateAllCode: masterHandler.UpdateAllCode,
  DeleteAllCode: masterHandler.DeleteAllCode,
  GetAllCodeById: masterHandler.GetAllCodeById,
  GetAllCodes: masterHandler.GetAllCodes, 
});

const doctorPackage = loadProto("doctor.proto").doctor;
server.addService(doctorPackage.DoctorService.service, {
  CreateDoctor: doctorHandler.CreateDoctor,
  GetAllDoctors: doctorHandler.GetAllDoctors,
  GetDoctorById: doctorHandler.GetDoctorById,
  AssignServiceToDoctor: doctorHandler.AssignServiceToDoctor,
  GetDoctorServices: doctorHandler.GetDoctorServices,
  GlobalSearch: doctorHandler.GlobalSearch,
  UpdateDoctor: doctorHandler.UpdateDoctor,
  DeleteDoctor: doctorHandler.DeleteDoctor,
});

const schedulePackage = loadProto("schedule.proto").schedule;
server.addService(schedulePackage.ScheduleService.service, {
  BulkCreateSchedule: checkAuth(scheduleHandler.BulkCreateSchedule),
  GetScheduleByDate: scheduleHandler.GetScheduleByDate,
});

const bookingPackage = loadProto("booking.proto").booking;
server.addService(bookingPackage.BookingService.service, {
  CreateBooking: checkAuth(bookingHandler.CreateBooking),
  GetBookingHistory: checkAuth(bookingHandler.GetBookingHistory),
  CancelBooking: checkAuth(bookingHandler.CancelBooking),
  DeleteBooking: checkAuth(bookingHandler.DeleteBooking),
});

const appointmentPackage = loadProto("appointment.proto").appointment;
server.addService(appointmentPackage.AppointmentService.service, {
  GetListPatientForDoctor: checkAuth(appointmentHandler.GetListPatientForDoctor),
  VerifyBooking: checkAuth(appointmentHandler.VerifyBooking),
  FinishAppointment: checkAuth(appointmentHandler.FinishAppointment),
});

const patientProfilePackage = loadProto("patientProfile.proto").patient_profile;
server.addService(patientProfilePackage.PatientProfileService.service, {
  GetAllProfiles: checkAuth(patientProfileHandler.GetAllProfiles),
  CreateProfile: checkAuth(patientProfileHandler.CreateProfile),
  UpdateProfile: checkAuth(patientProfileHandler.UpdateProfile),
  DeleteProfile: checkAuth(patientProfileHandler.DeleteProfile),
  GetProfileById: checkAuth(patientProfileHandler.GetProfileById),
});

const notificationPackage = loadProto("notification.proto").notification;
server.addService(notificationPackage.NotificationService.service, {
  GetMyNotifications: notificationHandler.GetMyNotifications,
  MarkAsRead: notificationHandler.MarkAsRead,
  StreamNotifications: notificationHandler.StreamNotifications, 
  MarkAllAsRead: notificationHandler.MarkAllAsRead,
  CreateNotification: notificationHandler.CreateNotification,
});

const statisticPackage = loadProto("statistic.proto").statistic;
server.addService(statisticPackage.StatisticService.service, {
  GetAdminDashboard: statisticHandler.GetAdminDashboard,
});

const feedbackPackage = loadProto("feedback.proto").feedback;
server.addService(feedbackPackage.FeedbackService.service, {
  SendFeedback: feedbackHandler.SendFeedback,
  GetDoctorFeedbacks: feedbackHandler.GetDoctorFeedbacks,
  GetClinicFeedbacks: feedbackHandler.GetClinicFeedbacks,
  GetServiceFeedbacks: feedbackHandler.GetServiceFeedbacks,
  GetAllFeedbacks: feedbackHandler.GetAllFeedbacks,
});

const locationPackage = loadProto("location.proto").location;
server.addService(locationPackage.LocationService.service, {
  GetPatientLocations: checkAuth(locationHandler.getPatientLocations),
  AddNewLocation: checkAuth(locationHandler.addNewLocation),
  DeleteLocation: checkAuth(locationHandler.removeLocation),
  SetDefaultLocation: checkAuth(locationHandler.setDefaultLocation)
});

const searchPackage = loadProto("search.proto").search;
server.addService(searchPackage.SearchService.service, {
  GlobalSearch: searchHandler.GlobalSearch,
  GetSuggestions: searchHandler.GetSuggestions
});

const treatmentProto = loadProto("treatment.proto").treatment;
server.addService(treatmentProto.TreatmentService.service, {
  GetTreatmentByBooking: treatmentHandler.GetTreatmentByBooking,
  GetUserMedicalRecords: treatmentHandler.GetUserMedicalRecords
});

// 🎯 ĐẢM BẢO TÊN HÀM KHỚP VỚI HANDLER (Get viết hoa)
const paymentPackage = loadProto("payment.proto").payment;
server.addService(paymentPackage.PaymentService.service, {
  GetPaymentInstruction: paymentHandler.GetPaymentInstruction,
  PatientConfirmTransfer: paymentHandler.PatientConfirmTransfer,
  AdminVerifyPayment: paymentHandler.AdminVerifyPayment,
  GetPaymentStatus: paymentHandler.GetPaymentStatus,
  GetPaymentList: paymentHandler.GetPaymentList
});

const userPackage = loadProto("user.proto").user;
server.addService(userPackage.UserService.service, {
  GetAllUsers: userHandler.getAllUsers,
  ToggleUserStatus: userHandler.toggleUserStatus,
  ResetPassword: userHandler.resetPassword,
  DeleteUser: userHandler.deleteUser,
});

const PORT = process.env.PORT || 50051;
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Loi khoi dong gRPC Server:", error);
      return;
    }
    console.log(`gRPC Server dang chay tai 0.0.0.0:${PORT}`);
  },
);