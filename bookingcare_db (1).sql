-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th2 17, 2026 lúc 12:40 PM
-- Phiên bản máy phục vụ: 5.7.25
-- Phiên bản PHP: 7.1.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `bookingcare_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `allcodes`
--

CREATE TABLE `allcodes` (
  `id` int(11) NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_vi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `allcodes`
--

INSERT INTO `allcodes` (`id`, `type`, `key`, `value_vi`, `value_en`, `created_at`, `updated_at`) VALUES
(1, 'TIME', 'T1', '8:00 - 9:00', '8:00 AM - 9:00 AM', '2026-02-11 07:09:11', '2026-02-11 07:09:11'),
(2, 'TIME', 'T2', '9:00 - 10:00', '9:00 AM - 10:00 AM', '2026-02-11 07:09:20', '2026-02-11 07:09:20'),
(3, 'GENDER', 'M', 'Nam', 'Male', '2026-02-11 07:09:28', '2026-02-11 07:09:28'),
(4, 'GENDER', 'F', 'Nữ', 'Female', '2026-02-11 07:09:35', '2026-02-11 07:09:35'),
(5, 'POSITION', 'P1', 'Bác sĩ', 'Doctor', '2026-02-11 07:09:42', '2026-02-11 07:09:42'),
(6, 'POSITION', 'P2', 'Thạc sĩ', 'Master', '2026-02-11 07:09:49', '2026-02-11 07:09:49'),
(22, 'TIME', 'T3', '10:00 - 11:00', '10:00 AM - 11:00 AM', '2026-02-11 07:12:40', '2026-02-11 07:12:40'),
(23, 'TIME', 'T4', '11:00 - 12:00', '11:00 AM - 12:00 PM', '2026-02-11 07:12:40', '2026-02-11 07:12:40'),
(24, 'TIME', 'T5', '13:30 - 14:30', '01:30 PM - 02:30 PM', '2026-02-11 07:12:40', '2026-02-11 07:12:40'),
(25, 'TIME', 'T6', '14:30 - 15:30', '02:30 PM - 03:30 PM', '2026-02-11 07:12:40', '2026-02-11 07:12:40'),
(26, 'TIME', 'T7', '15:30 - 16:30', '03:30 PM - 04:30 PM', '2026-02-11 07:12:40', '2026-02-11 07:12:40'),
(27, 'TIME', 'T8', '16:30 - 17:30', '04:30 PM - 05:30 PM', '2026-02-11 07:12:40', '2026-02-11 07:12:40');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `status` enum('waiting','examining','done','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'waiting',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `appointment_records`
--

CREATE TABLE `appointment_records` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `symptoms` text COLLATE utf8mb4_unicode_ci,
  `diagnosis` text COLLATE utf8mb4_unicode_ci,
  `treatment_plan` text COLLATE utf8mb4_unicode_ci,
  `re_exam_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `profile_id` int(11) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_photos`
--

CREATE TABLE `booking_photos` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `clinics`
--

CREATE TABLE `clinics` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content_html` longtext COLLATE utf8mb4_unicode_ci,
  `content_markdown` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `clinics`
--

INSERT INTO `clinics` (`id`, `name`, `address`, `description`, `image`, `created_at`, `content_html`, `content_markdown`) VALUES
(1, 'Bệnh viện Đa khoa Hạnh Phúc', 'Số 123, Đường Trần Hưng Đạo, TP. Long Xuyên, An Giang', 'Bệnh viện tiêu chuẩn quốc tế với đội ngũ bác sĩ chuyên khoa giỏi.', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', '2026-02-11 06:32:42', NULL, NULL),
(2, 'Bệnh viện Đại học Y Dược TP.HCM', '215 Hồng Bàng, Phường 11, Quận 5, TP.HCM', 'Bệnh viện đa khoa hạng I với mô hình Trường - Viện hiện đại.', 'https://cdn.bookingcare.vn/fr/w800/2020/03/17/102936-benh-vien-dai-hoc-y-duoc-1.jpg', '2026-02-11 06:33:59', NULL, NULL),
(3, 'Hệ thống Y tế MEDLATEC', '42 Nghĩa Dũng, Ba Đình, Hà Nội', 'Đơn vị tiên phong trong dịch vụ lấy mẫu xét nghiệm tận nơi.', 'https://medlatec.vn/Content/images/logo-medlatec.png', '2026-02-11 06:34:20', NULL, NULL),
(4, 'Bệnh viện Hữu nghị Việt Đức', '40 Tràng Thi, Hoàn Kiếm, Hà Nội', 'Trung tâm phẫu thuật lớn nhất Việt Nam, tuyến cuối về ngoại khoa.', 'https://vietduc.gov.vn/logo.png', '2026-02-11 06:35:24', NULL, NULL),
(5, 'Bệnh viện Chợ Rẫy', '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM', 'Bệnh viện đa khoa trung ương hạng đặc biệt lớn nhất miền Nam.', 'https://choray.org.vn/images/logo.png', '2026-02-11 06:35:35', NULL, NULL),
(6, 'Phòng khám Đa khoa Quốc tế VietSing', 'Số 9 Đoàn Trần Nghiệp, Hai Bà Trưng, Hà Nội', 'Phòng khám tư nhân tiêu chuẩn quốc tế với dịch vụ cao cấp.', 'https://vietsing.com.vn/logo.png', '2026-02-11 06:35:45', NULL, NULL),
(7, 'Bệnh viện Đa khoa Quốc tế Thu Cúc TCI', '286 Thụy Khuê, Tây Hồ, Hà Nội', 'Top 3 bệnh viện tư nhân có điểm chất lượng cao nhất Hà Nội.', 'https://benhvienthucuc.vn/logo.png', '2026-02-11 06:35:54', NULL, NULL),
(8, 'Trung tâm Xét nghiệm Diag Labs', '414-420 Cao Thắng, Phường 12, Quận 10, TP.HCM', 'Mạng lưới xét nghiệm hiện đại với hơn 30 chi nhánh.', 'https://diag.vn/logo.png', '2026-02-11 06:36:04', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT NULL,
  `position` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialty_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `active` tinyint(4) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctor_services`
--

CREATE TABLE `doctor_services` (
  `doctor_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `drugs`
--

CREATE TABLE `drugs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `content_html` longtext COLLATE utf8mb4_unicode_ci,
  `content_markdown` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `drugs`
--

INSERT INTO `drugs` (`id`, `name`, `unit`, `description`, `price`, `content_html`, `content_markdown`) VALUES
(1, 'Paracetamol 500mg', 'Viên', 'Thuốc giảm đau, hạ sốt phổ biến.', '2000.00', '<p>Uống sau khi ăn, cách nhau 4-6 tiếng.</p>', 'Uống sau khi ăn, cách nhau **4-6 tiếng**.'),
(2, 'Gaviscon', 'Gói', 'Thuốc điều trị trào ngược dạ dày, ợ nóng.', '15000.00', '<h3>Hướng dẫn sử dụng</h3><p>Uống sau bữa ăn và trước khi đi ngủ.</p>', '### Hướng dẫn sử dụng\nUống sau bữa ăn và trước khi đi ngủ.'),
(3, 'Vitamin C Plus', 'Tuýp', 'Bổ sung Vitamin C, tăng cường sức đề kháng.', '45000.00', '<p>Hòa tan 1 viên vào 200ml nước lọc.</p>', 'Hòa tan **1 viên** vào **200ml** nước lọc.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(4) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `patients`
--

INSERT INTO `patients` (`id`, `user_id`, `full_name`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES
(4, 5, 'Admin Văn Bá Phát Huy', '0837444383', NULL, '2026-02-11 11:32:53', '2026-02-11 11:32:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `patient_profiles`
--

CREATE TABLE `patient_profiles` (
  `id` int(11) NOT NULL,
  `owner_patient_id` int(11) NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `relationship` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `drug_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `instruction` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clinic_id` int(11) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `location`, `clinic_id`, `description`) VALUES
(1, 'Phòng khám Nội số 01', 'Tầng 1 - Khu A', 1, 'Chuyên khám các bệnh lý về nội khoa tổng quát.'),
(2, 'Phòng khám Sản Phụ khoa 02', 'Lầu 2 - Tòa nhà B', 1, 'Chuyên siêu âm, khám thai định kỳ và tư vấn sức khỏe mẹ bầu.'),
(3, 'Phòng khám Nhi đồng - Cơ sở 1', 'Tầng trệt - Khu vui chơi trẻ em', 2, 'Không gian thiết kế thân thiện, giúp bé bớt sợ hãi khi thăm khám.'),
(4, 'Trung tâm lấy mẫu xét nghiệm lưu động', 'Phòng 105 - Khu kỹ thuật cao', 3, 'Đội ngũ kỹ thuật viên chuyên lấy mẫu tại nhà với quy trình bảo quản nghiêm ngặt.'),
(5, 'Phòng Phục hồi chức năng', 'Khu C - Cạnh nhà vật lý trị liệu', 1, 'Trang bị đầy đủ máy móc hỗ trợ phục hồi vận động cho bệnh nhân sau tai biến.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_booking` int(11) DEFAULT '1',
  `current_booking` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `content_html` longtext COLLATE utf8mb4_unicode_ci,
  `content_markdown` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `services`
--

INSERT INTO `services` (`id`, `name`, `image`, `description`, `price`, `content_html`, `content_markdown`) VALUES
(1, 'Gói xét nghiệm tổng quát tại nhà', 'https://cdn.bookingcare.vn/fr/w300/2019/12/13/121212-xet-nghiem-tai-nha.jpg', 'Kiểm tra 22 chỉ số máu và nước tiểu ngay tại nhà bạn.', '1200000.00', '<h3>Gói xét nghiệm máu 22 chỉ số</h3><p>Dành cho khách hàng muốn kiểm tra sức khỏe định kỳ mà không cần đến bệnh viện.</p><ul><li>Kiểm tra chức năng gan, thận</li><li>Tầm soát tiểu đường</li><li>Kiểm tra mỡ máu</li></ul>', '### Gói xét nghiệm máu 22 chỉ số\nDành cho khách hàng muốn kiểm tra sức khỏe định kỳ mà không cần đến bệnh viện.\n\n* **Kiểm tra chức năng gan, thận**\n* **Tầm soát tiểu đường**\n* **Kiểm tra mỡ máu**'),
(2, 'Thay băng, cắt chỉ và chăm sóc vết thương', 'https://cdn.bookingcare.vn/fr/w300/2021/01/15/thay-bang-tai-nha.jpg', 'Điều dưỡng chuyên nghiệp đến tận nhà hỗ trợ vệ sinh, thay băng vết thương sau phẫu thuật hoặc chấn thương.', '250000.00', '<h3>Chăm sóc vết thương chuẩn y khoa</h3><p>Dịch vụ bao gồm:</p><ul><li>Sát trùng vết thương bằng dung dịch chuyên dụng</li><li>Thay băng mới vô trùng</li><li>Kiểm tra tình trạng lành vết thương</li></ul>', '### Chăm sóc vết thương chuẩn y khoa\nDịch vụ bao gồm:\n* **Sát trùng** vết thương bằng dung dịch chuyên dụng\n* **Thay băng** mới vô trùng\n* **Kiểm tra** tình trạng lành vết thương'),
(3, 'Bác sĩ chuyên khoa Nhi khám tại nhà', 'https://cdn.bookingcare.vn/fr/w300/2021/04/10/kham-nhi-tai-nha.jpg', 'Thăm khám trực tiếp cho trẻ em các bệnh lý về hô hấp, tiêu hóa, dinh dưỡng.', '500000.00', '<h3>Khám bệnh Nhi khoa tận nhà</h3><p>Giúp bé thoải mái hơn, tránh lây nhiễm chéo tại bệnh viện. Bác sĩ tư vấn kỹ và có đơn thuốc kèm theo.</p>', '### Khám bệnh Nhi khoa tận nhà\nGiúp bé thoải mái hơn, **tránh lây nhiễm chéo** tại bệnh viện. Bác sĩ tư vấn kỹ và có đơn thuốc kèm theo.'),
(4, 'Gói tầm soát ung thư cổ tử cung tại nhà', 'https://cdn.bookingcare.vn/fr/w300/2020/08/20/tam-soat-ung-thu.jpg', 'Lấy mẫu xét nghiệm HPV và tế bào học tại nhà, bảo mật thông tin.', '850000.00', '<h3>Tầm soát HPV và tế bào học</h3><p>Phương pháp hiện đại giúp phát hiện sớm các dấu hiệu tiền ung thư với độ chính xác cao.</p>', '### Tầm soát HPV và tế bào học\nPhương pháp hiện đại giúp phát hiện sớm các **dấu hiệu tiền ung thư** với độ chính xác cao.'),
(5, 'Vật lý trị liệu & Phục hồi chức năng tại nhà', 'https://cdn.bookingcare.vn/fr/w300/2021/05/12/vat-ly-tri-lieu.jpg', 'Kỹ thuật viên hướng dẫn các bài tập phục hồi vận động, giảm đau cơ xương khớp.', '400000.00', '<h3>Phục hồi vận động tận nơi</h3><p>Áp dụng cho bệnh nhân sau tai biến, chấn thương thể thao hoặc người già bị thoái hóa khớp.</p>', '### Phục hồi vận động tận nơi\nÁp dụng cho bệnh nhân sau tai biến, chấn thương thể thao hoặc người già bị **thoái hóa khớp**.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `specialties`
--

CREATE TABLE `specialties` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_html` longtext COLLATE utf8mb4_unicode_ci,
  `content_markdown` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `specialties`
--

INSERT INTO `specialties` (`id`, `name`, `description`, `image`, `content_html`, `content_markdown`) VALUES
(1, 'Cơ Xương Khớp', 'Chuyên khám và điều trị các bệnh lý về xương khớp, cột sống.', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', '<h3>Điều trị Cơ Xương Khớp</h3><p>Chuyên trị: Thoái hóa khớp, thoát vị đĩa đệm, viêm khớp dạng thấp.</p>', '### Điều trị Cơ Xương Khớp\n* **Thoái hóa khớp**\n* **Thoát vị đĩa đệm**\n* **Viêm khớp dạng thấp**'),
(2, 'Sức khỏe tâm thần', 'Tư vấn và điều trị các rối loạn tâm lý, trầm cảm, lo âu.', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', '<h3>Tư vấn tâm lý chuyên sâu</h3><p>Điều trị các triệu chứng: Mất ngủ kéo dài, stress, rối loạn lo âu, trầm cảm sau sinh.</p>', '### Tư vấn tâm lý chuyên sâu\nĐiều trị các triệu chứng: **Mất ngủ kéo dài, stress, rối loạn lo âu, trầm cảm sau sinh**.'),
(3, 'Tiêu hóa', 'Khám các bệnh về dạ dày, đại tràng, gan mật.', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', '<h3>Chuyên khoa Tiêu hóa - Gan mật</h3><p>Dịch vụ: Nội soi dạ dày, đại tràng không đau. Điều trị viêm loét dạ dày, trào ngược.</p>', '### Chuyên khoa Tiêu hóa - Gan mật\n**Dịch vụ:** Nội soi dạ dày, đại tràng không đau. Điều trị viêm loét dạ dày, trào ngược.'),
(4, 'Da liễu', 'Điều trị các bệnh lý về da, thẩm mỹ da liễu.', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', '<h3>Khám Da liễu</h3><ul><li>Trị mụn, nám, tàn nhang.</li><li>Viêm da cơ địa, vảy nến.</li><li>Tẩy nốt ruồi, mụn cóc.</li></ul>', '### Khám Da liễu\n* Trị mụn, nám, tàn nhang.\n* **Viêm da cơ địa**, vảy nến.\n* Tẩy nốt ruồi, mụn cóc.'),
(5, 'Nội tiết', 'Điều trị tiểu đường và các rối loạn tuyến nội tiết.', 'icon_noi_tiet', '<h3>Chuyên khoa Nội tiết</h3><p>Chuyên sâu về: Bệnh tiểu đường (Type 1, Type 2), bệnh tuyến giáp, rối loạn hormone.</p>', '### Chuyên khoa Nội tiết\nChuyên sâu về: **Bệnh tiểu đường**, bệnh tuyến giáp, rối loạn hormone.'),
(6, 'Sản Phụ Khoa', 'Chăm sóc sức khỏe phụ nữ, thai sản và kế hoạch hóa gia đình.', 'icon_san_phu_khoa', '<h3>Dịch vụ Sản Phụ Khoa toàn diện</h3><p>Cung cấp các gói khám: Quản lý thai kỳ, tầm soát ung thư cổ tử cung, điều trị vô sinh hiếm muộn và các bệnh lý phụ khoa thường gặp.</p>', '### Dịch vụ Sản Phụ Khoa toàn diện\nCung cấp các gói khám: **Quản lý thai kỳ, tầm soát ung thư cổ tử cung, điều trị vô sinh hiếm muộn** và các bệnh lý phụ khoa thường gặp.'),
(7, 'Nhi Khoa', 'Khám và điều trị các bệnh lý cho trẻ sơ sinh và trẻ nhỏ dưới 16 tuổi.', 'icon_nhi_khoa', '<h3>Khám Nhi khoa chất lượng cao</h3><p>Chuyên trị: Viêm đường hô hấp, rối loạn tiêu hóa, tư vấn dinh dưỡng và tiêm chủng phòng bệnh cho trẻ em.</p>', '### Khám Nhi khoa chất lượng cao\nChuyên trị: **Viêm đường hô hấp, rối loạn tiêu hóa, tư vấn dinh dưỡng** và tiêm chủng phòng bệnh cho trẻ em.'),
(8, 'Mắt (Nhãn khoa)', 'Khám mắt định kỳ và điều trị các tật khúc xạ, bệnh lý về mắt.', 'icon_mat', '<h3>Chăm sóc đôi mắt sáng khỏe</h3><p>Dịch vụ: Đo thị lực, điều trị cận - viễn - loạn thị, đục thủy tinh thể và các bệnh lý đáy mắt.</p>', '### Chăm sóc đôi mắt sáng khỏe\nDịch vụ: **Đo thị lực, điều trị cận - viễn - loạn thị**, đục thủy tinh thể và các bệnh lý đáy mắt.'),
(9, 'Hồi sức cấp cứu', 'Tiếp nhận và xử lý các tình trạng bệnh lý nguy kịch 24/7.', 'icon_cap_cuu', '<h3>Trực cấp cứu 24/24</h3><p>Hệ thống trang thiết bị hiện đại, đội ngũ bác sĩ phản ứng nhanh, sẵn sàng xử lý mọi tình huống khẩn cấp về tính mạng.</p>', '### Trực cấp cứu 24/24\nHệ thống trang thiết bị hiện đại, đội ngũ bác sĩ phản ứng nhanh, **sẵn sàng xử lý mọi tình huống khẩn cấp** về tính mạng.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `treatments`
--

CREATE TABLE `treatments` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `times` int(11) DEFAULT NULL,
  `instruction` text COLLATE utf8mb4_unicode_ci,
  `repeat_days` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','doctor','patient') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'patient',
  `active` tinyint(4) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `active`, `created_at`, `updated_at`) VALUES
(5, 'phathuy2004h@gmail.com', '$2b$10$ae32rRGbpP3uWa2ZeProte/XoGDkTqgyYiI.u1LPcUbzBMjfs7xJu', 'patient', 1, '2026-02-11 11:32:53', '2026-02-11 11:32:53');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `allcodes`
--
ALTER TABLE `allcodes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_type_key` (`type`,`key`);

--
-- Chỉ mục cho bảng `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Chỉ mục cho bảng `appointment_records`
--
ALTER TABLE `appointment_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`);

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `profile_id` (`profile_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Chỉ mục cho bảng `booking_photos`
--
ALTER TABLE `booking_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `clinics`
--
ALTER TABLE `clinics`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `specialty_id` (`specialty_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Chỉ mục cho bảng `doctor_services`
--
ALTER TABLE `doctor_services`
  ADD PRIMARY KEY (`doctor_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Chỉ mục cho bảng `drugs`
--
ALTER TABLE `drugs`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `patient_profiles`
--
ALTER TABLE `patient_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_patient_id` (`owner_patient_id`);

--
-- Chỉ mục cho bảng `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `drug_id` (`drug_id`);

--
-- Chỉ mục cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_room_clinic` (`clinic_id`);

--
-- Chỉ mục cho bảng `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Chỉ mục cho bảng `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `specialties`
--
ALTER TABLE `specialties`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `allcodes`
--
ALTER TABLE `allcodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `appointment_records`
--
ALTER TABLE `appointment_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `booking_photos`
--
ALTER TABLE `booking_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `clinics`
--
ALTER TABLE `clinics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `drugs`
--
ALTER TABLE `drugs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `patient_profiles`
--
ALTER TABLE `patient_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `specialties`
--
ALTER TABLE `specialties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `treatments`
--
ALTER TABLE `treatments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`);

--
-- Các ràng buộc cho bảng `appointment_records`
--
ALTER TABLE `appointment_records`
  ADD CONSTRAINT `appointment_records_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`profile_id`) REFERENCES `patient_profiles` (`id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Các ràng buộc cho bảng `booking_photos`
--
ALTER TABLE `booking_photos`
  ADD CONSTRAINT `booking_photos_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctors_ibfk_2` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `doctors_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `doctor_services`
--
ALTER TABLE `doctor_services`
  ADD CONSTRAINT `doctor_services_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `patient_profiles`
--
ALTER TABLE `patient_profiles`
  ADD CONSTRAINT `patient_profiles_ibfk_1` FOREIGN KEY (`owner_patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`id`);

--
-- Các ràng buộc cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `fk_room_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `treatments`
--
ALTER TABLE `treatments`
  ADD CONSTRAINT `treatments_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
