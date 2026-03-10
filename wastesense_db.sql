-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2026 at 11:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wastesense_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`feedback_id`, `user_id`, `message`, `created_at`) VALUES
(1, 6, 'Test feedback message after migration', '2026-03-03 00:55:45'),
(2, 7, 'hi! this is a feedback test', '2026-03-06 15:04:09'),
(6, 19, 'Great app!', '2026-03-06 15:44:29'),
(7, 31, 'Sanity check test feedback', '2026-03-07 00:29:35'),
(8, 10002, 'Great app!', '2026-03-07 06:45:09'),
(9, 10025, 'pppppppppppppp', '2026-03-07 08:33:06');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `location_id` int(11) NOT NULL,
  `barangay_name` varchar(100) NOT NULL,
  `municipality` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `zone_or_street` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`location_id`, `barangay_name`, `municipality`, `province`, `zone_or_street`, `created_at`, `is_active`) VALUES
(1, 'Barangay Poblacion', 'Sample Municipality', 'Sample Province', 'Zone 1', '2026-02-24 12:00:30', 1),
(2, 'Barangay San Jose', 'Sample Municipality', 'Sample Province', 'Zone 2', '2026-02-24 12:00:30', 1),
(3, 'Barangay Santa Maria', 'Sample Municipality', 'Sample Province', 'Zone 3', '2026-02-24 12:00:30', 1),
(4, 'Sanity Barangay 1772843376125', 'Test Municipality', 'Test Province', NULL, '2026-03-07 00:29:36', 1),
(5, 'Inactive Test', '', '', NULL, '2026-03-07 04:31:11', 0),
(6, 'Uncovered Area', 'Test Mun', '', NULL, '2026-03-07 06:12:28', 1),
(7, 'Bagumbayan', 'Taguig City', 'Metro Manila', NULL, '2026-03-07 07:12:51', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `notification_type` enum('reminder','schedule_change','system') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `schedule_id`, `notification_type`, `message`, `is_read`, `sent_at`) VALUES
(1, 7, 3, 'reminder', 'Reminder: Recyclable collection is scheduled today for Barangay Poblacion, Sample Municipality.', 0, '2026-03-06 15:02:30'),
(2, 1, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 1, '2026-03-06 15:45:01'),
(3, 1, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 1, '2026-03-06 15:52:58'),
(4, 1, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 1, '2026-03-06 15:53:46'),
(6, 31, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 00:29:35'),
(10, 1, NULL, 'system', 'Collector reported a problem with submission #1: Wrong or incomplete address', 0, '2026-03-07 03:57:26'),
(11, 7, NULL, 'system', 'Your waste collection request has been marked as collected. Thank you for participating!', 0, '2026-03-07 03:57:26'),
(12, 7, NULL, 'system', 'Your waste collection request has been marked as collected. Thank you for participating!', 0, '2026-03-07 04:02:54'),
(13, 2, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 06:48:20'),
(14, 2, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 06:48:33'),
(15, 2, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 06:49:06'),
(16, 2, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 06:49:42'),
(17, 1, NULL, 'system', 'Collector reported a problem with submission #34: Resident Not Home', 0, '2026-03-07 06:49:42'),
(18, 2, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 06:49:42'),
(19, 2, NULL, 'system', 'Your waste collection request has been marked as collected. Thank you for participating!', 0, '2026-03-07 06:49:42'),
(20, 10025, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 08:22:37'),
(21, 10025, NULL, 'system', 'Your waste collection request has been marked as collected. Thank you for participating!', 0, '2026-03-07 08:30:47'),
(22, 7, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-07 10:07:28'),
(23, 1, NULL, 'system', 'Collector reported a problem with submission #11: Wrong or incomplete address', 0, '2026-03-07 10:10:04'),
(24, 10032, NULL, 'schedule_change', 'Your waste collection request has been accepted and scheduled.', 0, '2026-03-10 10:19:20');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_requests`
--

CREATE TABLE `password_reset_requests` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `request_type` enum('forgot_password','become_collector','request_admin_access','reactivate_account','update_email','report_issue') NOT NULL,
  `description` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `status` enum('pending','accepted','denied','completed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_requests`
--

INSERT INTO `password_reset_requests` (`request_id`, `user_id`, `email`, `request_type`, `description`, `metadata`, `status`, `created_at`, `updated_at`, `resolved_at`) VALUES
(1, 2, 'robertdan@gmail.com', '', 'as', NULL, 'denied', '2026-02-24 14:27:30', '2026-03-07 01:39:49', '2026-03-07 01:39:49'),
(2, 2, 'robertdan@gmail.com', '', 'as', NULL, 'accepted', '2026-02-24 14:27:32', '2026-03-07 01:39:54', '2026-03-07 01:39:54'),
(3, 2, 'robertdan@gmail.com', '', 'as', NULL, 'accepted', '2026-02-24 14:27:33', '2026-03-07 01:52:35', '2026-03-07 01:52:35'),
(4, 3, 'daniel@gmail.com', '', '', NULL, 'accepted', '2026-02-24 14:29:57', '2026-03-07 07:15:16', '2026-03-07 07:15:16'),
(5, 3, 'daniel@gmail.com', '', '', NULL, 'accepted', '2026-02-24 14:31:53', '2026-03-07 07:15:19', '2026-03-07 07:15:19'),
(6, 3, 'daniel@gmail.com', '', 'i forgot my password', NULL, 'accepted', '2026-02-24 14:43:43', '2026-03-06 15:20:48', '2026-03-06 15:20:48'),
(12, 7, 'ericksson@wastesense.ph', '', 'i forgot my password :(', NULL, 'accepted', '2026-03-06 15:25:00', '2026-03-07 07:15:21', '2026-03-07 07:15:21'),
(13, 34, 'collector@wastesense.com', '', 'balbla', NULL, 'completed', '2026-03-07 01:34:13', '2026-03-07 01:52:40', '2026-03-07 01:52:40'),
(14, 7, 'ericksson@wastesense.ph', '', 'aaaaaaaaa', NULL, 'accepted', '2026-03-07 01:53:07', '2026-03-07 01:53:54', '2026-03-07 01:53:54'),
(15, 10026, 'bagumbayan@collector.net', '', 'i want', NULL, 'denied', '2026-03-07 07:52:10', '2026-03-07 08:01:25', '2026-03-07 08:01:25'),
(16, 10026, 'bagumbayan@collector.net', '', 'pppppp', NULL, 'denied', '2026-03-07 07:52:38', '2026-03-07 08:01:27', '2026-03-07 08:01:27'),
(17, 10027, 'collectorattempt2@gmail.com', '', 'pplpl', NULL, 'denied', '2026-03-07 08:01:43', '2026-03-07 08:20:49', '2026-03-07 08:20:49'),
(18, 10029, 'e2e_collector@test.com', '', 'System generated: New collector registration pending verification.', NULL, 'denied', '2026-03-07 08:08:19', '2026-03-07 08:20:51', '2026-03-07 08:20:51'),
(19, 10030, 'post_enum@test.com', 'become_collector', 'System generated: New collector registration pending verification.', NULL, 'denied', '2026-03-07 08:09:16', '2026-03-07 08:21:01', '2026-03-07 08:21:01'),
(20, 10031, 'collector3@wastesense.ph', 'become_collector', 'System generated: New collector registration pending verification.', NULL, 'completed', '2026-03-07 08:20:26', '2026-03-07 08:21:03', '2026-03-07 08:21:03');

-- --------------------------------------------------------

--
-- Table structure for table `performance_tracking`
--

CREATE TABLE `performance_tracking` (
  `tracking_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `collector_id` int(11) DEFAULT NULL,
  `planned_date` date NOT NULL,
  `actual_date` date DEFAULT NULL,
  `status` enum('completed','missed','delayed') NOT NULL DEFAULT 'missed',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `collection_day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `collection_time` time NOT NULL,
  `waste_category_id` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `location_id`, `collection_day`, `collection_time`, `waste_category_id`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Monday', '08:00:00', 1, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(2, 1, 'Wednesday', '08:00:00', 2, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(3, 1, 'Friday', '08:00:00', 3, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(4, 2, 'Tuesday', '09:00:00', 1, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(5, 2, 'Thursday', '09:00:00', 2, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(6, 3, 'Monday', '10:00:00', 4, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(7, 3, 'Thursday', '10:00:00', 4, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(8, 1, 'Tuesday', '11:37:00', 1, 1, 1, '2026-02-24 15:43:39', '2026-02-24 15:43:39'),
(9, 2, 'Tuesday', '11:45:00', 6, 1, 1, '2026-02-24 15:45:28', '2026-02-24 15:45:28'),
(10, 2, 'Monday', '11:45:00', 6, 1, 1, '2026-02-24 15:45:28', '2026-02-24 15:45:28'),
(11, 2, 'Monday', '04:50:00', 3, 1, 1, '2026-02-24 15:46:41', '2026-02-24 15:46:41'),
(12, 2, 'Thursday', '04:50:00', 3, 1, 1, '2026-02-24 15:46:41', '2026-02-24 15:46:41'),
(13, 2, 'Friday', '04:50:00', 3, 1, 1, '2026-02-24 15:46:41', '2026-02-24 15:46:41'),
(14, 4, 'Monday', '08:00:00', 1, 1, 1, '2026-03-07 00:29:36', '2026-03-07 00:29:36'),
(15, 7, 'Tuesday', '08:00:00', 1, 1, 1, '2026-03-07 07:14:31', '2026-03-07 07:14:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `force_password_change` tinyint(1) NOT NULL DEFAULT 0,
  `full_name` varchar(255) NOT NULL,
  `role` enum('resident','collector','admin') NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `force_password_change`, `full_name`, `role`, `phone_number`, `address`, `barangay_id`, `profile_picture`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@wastesense.ph', '$2b$10$m2k8aWaR94BSv.PQjGulyeJcS/p858QOzOJDe6yS7jtWQ7KTrRxWm', 0, 'System Administrator', 'admin', '09123456789', 'Admin Office', NULL, NULL, 1, '2026-02-24 12:00:30', '2026-03-07 06:51:08'),
(2, 'robertdan@gmail.com', '$2b$10$Ck4m6I1xsiNBCiSqVVh6p.l2ZfhpJJgKvbrXjEVx6lSU.p8ZQBIh2', 1, 'Robert Dan', 'resident', NULL, NULL, 3, NULL, 1, '2026-02-24 13:31:56', '2026-03-07 01:52:35'),
(3, 'daniel@gmail.com', '$2b$10$pbhSf8yB1lCJm2N4TbYBPe.bt4rlLt3sz8Th86yH4vS/hm8XhsyCK', 1, 'daniel', 'resident', NULL, NULL, 1, NULL, 1, '2026-02-24 14:29:44', '2026-03-07 07:15:19'),
(4, 'pat@gmail.com', '$2b$10$EIY9PlrEXXDTGG6dqFe0FeRvKyExeBDDI/TxgDCDpEj40vColQ/sy', 0, 'Patrick', 'resident', NULL, NULL, 3, NULL, 1, '2026-02-24 14:35:27', '2026-02-24 14:35:27'),
(5, 'collector1@wastesense.ph', '$2b$10$bKu63jMzGPkjqMBy03r5Ae0JB7L8OmLSgV6NuR2BTBuT197pRFlq2', 0, 'collector1', 'collector', NULL, NULL, 1, NULL, 1, '2026-02-24 15:04:28', '2026-03-07 05:55:01'),
(6, 'resident1@wastesense.ph', '$2b$10$nbOOw7Z1Reo53PVATdLSQ.LZleR62z8g5KJ4DxMJgejfLWxj84BW.', 0, 'Resident One', 'resident', NULL, NULL, NULL, NULL, 1, '2026-03-03 00:53:04', '2026-03-03 00:53:04'),
(7, 'ericksson@wastesense.ph', '$2b$10$ynZK9x06YF7f.6jV1Iq6guEigRpMkSVtfSU4REcE4jkJRRA/kgOH6', 1, 'Ericksson', 'resident', '', NULL, 1, NULL, 1, '2026-03-06 15:02:24', '2026-03-07 07:15:21'),
(12, 'test_insert@test.com', 'test', 0, 'Test', 'resident', NULL, NULL, NULL, NULL, 1, '2026-03-06 15:37:26', '2026-03-06 15:37:26'),
(13, 'sanity.tester@test.com', '$2b$10$/B09mN.f.VsmhsyFViM2zuhJl.Zu4iC1wu1W.GD92modGjR1g3Vm.', 0, 'Sanity Tester', 'resident', NULL, NULL, NULL, NULL, 1, '2026-03-06 15:38:02', '2026-03-06 15:38:03'),
(19, 'resident.sanity@test.com', '$2b$10$y/Xy5X6jyvKrFVS03W/eNuXLxVFr3l8qEmPEHPg/CeR8Dsfhbn8m6', 0, 'Resident Sanity', 'resident', NULL, NULL, NULL, NULL, 1, '2026-03-06 15:44:29', '2026-03-06 15:44:29'),
(24, 'admin.sanity@test.com', '$2b$10$DzKznxWHgk5ksktqGg6NkORavDfh2DOTu9TKr1R17uDnx3glGOTYO', 0, 'Admin Sanity', 'admin', NULL, NULL, NULL, NULL, 1, '2026-03-06 15:57:24', '2026-03-06 15:57:24'),
(29, 'sec.res@test.com', '$2b$10$3hy1j3zQJjrKP55JJ5A0NebipLCY.fzRtX.mzSx7vFiezSDhrrdz6', 0, 'Sec Res', 'resident', NULL, NULL, NULL, NULL, 1, '2026-03-06 16:00:12', '2026-03-06 16:00:12'),
(30, 'sec.col@test.com', '$2b$10$3c2HZDHvJZ5Pp39NV0T.tuNnYxbzQR/kej6qkQnFgbJrCUnSeOn/W', 0, 'Sec Col', 'collector', NULL, NULL, 3, NULL, 1, '2026-03-06 16:00:12', '2026-03-07 07:15:06'),
(31, 'sanity_1772843375282@test.com', '$2b$10$SG.124.l.XqAtn6n7Wx5M.E5fcWPHkVp5BYNyou0bmedvCpJNo3ia', 0, 'Sanity Test User', 'resident', NULL, NULL, 1, NULL, 1, '2026-03-07 00:29:35', '2026-03-07 00:29:35'),
(33, 'admin_created_1772843375907@test.com', '$2b$10$z/qCUd5CtUVCIhfWfYhHVu8wt6SrPkYo5inGo9w4D9xjuZPrvW0ny', 0, 'Updated Name', 'resident', NULL, NULL, NULL, NULL, 0, '2026-03-07 00:29:35', '2026-03-07 00:29:36'),
(34, 'collector@wastesense.com', '$2b$10$BqSlZqxfzJo6ecNoxRJCZugfhLqCQtvRpJ.YyMiMF48.dJ9bgFqIa', 0, 'collector test', 'collector', NULL, NULL, 1, NULL, 1, '2026-03-07 01:33:50', '2026-03-07 01:52:40'),
(35, 'resident@test.com', '$2b$10$qsgUb91t/Rm8x3e1HG7KuuAwTfh3MYE/7tt7.XP3tzyNTGZ7bSnpC', 0, 'Test User', 'resident', NULL, NULL, 1, NULL, 1, '2026-03-07 02:29:41', '2026-03-07 02:29:41'),
(36, 'newuser@test.com', '$2b$10$e8pW3Is.L.uBgB8aIcMRQOZ0wv4ZdUAN7R7hm7lMrYfNDwFuIl792', 0, 'Test User', 'resident', NULL, NULL, 1, NULL, 1, '2026-03-07 02:31:04', '2026-03-07 02:31:04'),
(37, 'admin_test@test.com', 'hash', 0, 'Test Admin', 'admin', NULL, NULL, 1, NULL, 1, '2026-03-07 04:20:03', '2026-03-07 04:20:03'),
(38, 'res_test@test.com', 'hash', 0, 'Test Resident', 'resident', NULL, NULL, 1, NULL, 1, '2026-03-07 04:20:03', '2026-03-07 04:20:03'),
(998, 'front@test.com', '$2b$10$bqP87uXocCxtaMZB.CSv3uHED/yMIyetc.E28To/n0oMSXvoyNObq', 0, 'Front Test', 'resident', NULL, NULL, 1, NULL, 1, '2026-03-07 05:59:26', '2026-03-07 05:59:26'),
(10002, 'testres@test.com', '$2b$10$/zFzKy8ntWRjEelEarE9iue9EFI071bDQXJT4AZsceCFVrtgGdJUi', 0, 'Test Resident', 'resident', NULL, NULL, 1, NULL, 1, '2026-03-07 06:41:48', '2026-03-07 06:41:49'),
(10021, 'c1@test.com', '$2b$10$0yk9WhTsQCqJSYI2o78K2es4rP65fB0Q5kfNn4fjJ9kFXx9yjpzJO', 0, 'Collector1', 'collector', NULL, NULL, 1, NULL, 1, '2026-03-07 06:49:42', '2026-03-07 06:49:42'),
(10022, 'c2@test.com', '$2b$10$0yk9WhTsQCqJSYI2o78K2es4rP65fB0Q5kfNn4fjJ9kFXx9yjpzJO', 0, 'Collector2', 'collector', NULL, NULL, 2, NULL, 1, '2026-03-07 06:49:42', '2026-03-07 06:49:42'),
(10023, 'unassigned@test.com', '$2b$10$0yk9WhTsQCqJSYI2o78K2es4rP65fB0Q5kfNn4fjJ9kFXx9yjpzJO', 0, 'UnassignedCollector', 'collector', NULL, NULL, 1, NULL, 1, '2026-03-07 06:49:42', '2026-03-07 06:52:22'),
(10025, 'erickssonbrutas@gmail.com', '$2b$10$23TTdxCgeKJuRDaLUaLt5.JE7Dnzd1DG7jgIxp3DD1AZRY.SILYYm', 0, 'Ericksson Brutas', 'resident', NULL, NULL, 7, NULL, 1, '2026-03-07 07:40:45', '2026-03-07 07:40:45'),
(10026, 'bagumbayan@collector.net', '$2b$10$7dLWu/svh5RQS97ZRMIQjek4naNVcY74poNOsuYe6tyBXy7dNdLYS', 0, 'bagumbayan collector', 'resident', NULL, NULL, 7, NULL, 1, '2026-03-07 07:51:25', '2026-03-07 07:51:25'),
(10027, 'collectorattempt2@gmail.com', '$2b$10$QmrmF/SY.XBxRt9azMm2dOhqtMWvF84jJMiD/wBppKFHej2yrtkJG', 0, 'bagumbayan collector2', 'resident', NULL, NULL, 7, NULL, 1, '2026-03-07 08:00:57', '2026-03-07 08:00:57'),
(10028, 'forcepw@test.com', '$2b$10$RFz2phAS8m1ARLbvQSWSuu6VSTvMIYqSCBu3I8OeK2phk/SER1TrK', 1, 'ForcePW', 'resident', NULL, NULL, NULL, NULL, 1, '2026-03-07 08:07:50', '2026-03-07 08:07:50'),
(10029, 'e2e_collector@test.com', '$2b$10$5l4thSnmwNUK8Wfc4L02B.7Cyh92dvjHv5x./ZfGmm5sUBkS8bYF.', 0, 'End to End Collector Test', 'collector', NULL, NULL, 1, NULL, 0, '2026-03-07 08:08:19', '2026-03-07 08:08:19'),
(10030, 'post_enum@test.com', '$2b$10$0aI2iGUfH68dyXZDWM3jcuF/fwJZHOA/CkxBhK92.Tb0W3IK100fO', 0, 'Post Enum Test', 'collector', NULL, NULL, 1, NULL, 0, '2026-03-07 08:09:16', '2026-03-07 10:06:12'),
(10031, 'collector3@wastesense.ph', '$2b$10$idICQbFFMBmvWPp5g4sB3.84Enb6KcWQmyDKqD6Cb.YtGtlMBurpK', 0, 'bagumbayan collector3', 'collector', NULL, NULL, 7, NULL, 1, '2026-03-07 08:20:26', '2026-03-07 08:21:03'),
(10032, 'eval.resident.1773166529@wastesense.test', '$2b$10$7zFs8NkG33oGl1irKDotfeFbNHMwzECglkPoaEm8ugmd1MIHtbP02', 0, 'Eval Resident', 'resident', '09171234567', NULL, 1, NULL, 1, '2026-03-10 10:15:29', '2026-03-10 10:15:29'),
(10033, 'eval.collector@wastesense.test', '$2b$10$RdtHtAZnf3wLJF4zDPNrReKs72pQz5w7nbqSauI1fWclgW5g1aAG6', 0, 'Eval Collector', 'collector', '09170000000', 'Test Address', 1, NULL, 1, '2026-03-10 10:18:39', '2026-03-10 10:18:39');

-- --------------------------------------------------------

--
-- Table structure for table `waste_categories`
--

CREATE TABLE `waste_categories` (
  `category_id` int(11) NOT NULL,
  `category_key` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste_categories`
--

INSERT INTO `waste_categories` (`category_id`, `category_key`, `display_name`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'biodegradable', 'Biodegradable', 'natural waste', 1, 1, '2026-02-24 15:36:34', '2026-02-24 15:36:34'),
(2, 'non-biodegradable', 'Non-Biodegradable', 'Residual waste that is not compostable', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(3, 'recyclable', 'Recyclable', 'Recyclable materials like plastic, glass, paper, metal', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(4, 'mixed', 'Mixed', 'Mixed or unknown waste type', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(5, 'special', 'Special Waste', 'Special handling (e-waste, medical, etc.)', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(6, 'hazardous', 'Hazardous', 'Hazardous/toxic materials', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(7, 'sanity-cat-1772843376111', 'Test Category', 'Test category', 0, 1, '2026-03-07 00:29:36', '2026-03-07 07:13:05');

-- --------------------------------------------------------

--
-- Table structure for table `waste_submissions`
--

CREATE TABLE `waste_submissions` (
  `submission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `collector_id` int(11) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `predicted_category` varchar(50) DEFAULT NULL,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `confirmed_category` varchar(100) DEFAULT NULL,
  `waste_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`waste_types`)),
  `waste_adjective` varchar(50) DEFAULT NULL,
  `waste_adjectives` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`waste_adjectives`)),
  `waste_description` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `address_description` text DEFAULT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `collection_status` enum('pending','scheduled','collected') NOT NULL DEFAULT 'pending',
  `scheduled_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `collected_at` timestamp NULL DEFAULT NULL,
  `collector_notes` text DEFAULT NULL,
  `problem_type` varchar(100) DEFAULT NULL,
  `problem_description` text DEFAULT NULL,
  `has_problem` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste_submissions`
--

INSERT INTO `waste_submissions` (`submission_id`, `user_id`, `collector_id`, `image_path`, `predicted_category`, `confidence_score`, `confirmed_category`, `waste_types`, `waste_adjective`, `waste_adjectives`, `waste_description`, `latitude`, `longitude`, `address_description`, `barangay_id`, `collection_status`, `scheduled_date`, `created_at`, `collected_at`, `collector_notes`, `problem_type`, `problem_description`, `has_problem`) VALUES
(1, 6, 5, NULL, NULL, NULL, 'biodegradable', '[\"biodegradable\"]', NULL, NULL, 'Test submission', 14.60000000, 120.98000000, 'Test Address', 1, 'scheduled', NULL, '2026-03-03 00:53:05', NULL, NULL, NULL, NULL, 0),
(2, 7, 5, '/uploads/recyclable Waste-1772809423119-403976590.jpg', 'recyclable', 59.00, NULL, '[\"recyclable\"]', NULL, '[\"dry\"]', 'Detected as recyclable waste with 59% confidence', 14.32617000, 121.08103700, NULL, 1, 'collected', NULL, '2026-03-06 15:03:43', '2026-03-07 04:02:54', 'Picked up as scheduled', NULL, NULL, 0),
(10, 31, NULL, NULL, NULL, NULL, 'biodegradable', '[\"biodegradable\"]', NULL, NULL, 'Test submission for sanity check', 14.58950000, 120.98160000, 'Test Address, Manila', 1, 'collected', NULL, '2026-03-07 00:29:35', '2026-03-07 00:29:35', NULL, NULL, NULL, 0),
(11, 7, 34, '/uploads/paperwaste-1772847185457-105111447.png', 'mixed', 30.00, NULL, '[\"mixed\"]', NULL, '[\"mixed\"]', NULL, 14.32616960, 121.08103680, NULL, 1, 'scheduled', NULL, '2026-03-07 01:33:05', NULL, NULL, 'Wrong or incomplete address', NULL, 1),
(12, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 04:31:12', NULL, NULL, NULL, NULL, 0),
(13, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 04:31:12', NULL, NULL, NULL, NULL, 0),
(14, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:52:37', NULL, NULL, NULL, NULL, 0),
(15, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:52:37', NULL, NULL, NULL, NULL, 0),
(16, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:52:46', NULL, NULL, NULL, NULL, 0),
(17, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:52:46', NULL, NULL, NULL, NULL, 0),
(18, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:53:33', NULL, NULL, NULL, NULL, 0),
(19, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:53:33', NULL, NULL, NULL, NULL, 0),
(20, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:55:01', NULL, NULL, NULL, NULL, 0),
(21, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 05:55:01', NULL, NULL, NULL, NULL, 0),
(22, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 06:12:28', NULL, NULL, NULL, NULL, 0),
(24, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 06:22:49', NULL, NULL, NULL, NULL, 0),
(25, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 06:23:17', NULL, NULL, NULL, NULL, 0),
(26, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 06:23:45', NULL, NULL, NULL, NULL, 0),
(27, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', NULL, '2026-03-07 06:24:40', NULL, NULL, NULL, NULL, 0),
(28, 10002, NULL, '/uploads/mascot1-1772865886133-623371379.png', 'hazardous', 97.00, NULL, '[\"hazardous\"]', NULL, '[\"dry\"]', NULL, NULL, NULL, 'Waste item', 1, 'pending', NULL, '2026-03-07 06:44:46', NULL, NULL, NULL, NULL, 0),
(29, 2, NULL, NULL, 'Organic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'pending', NULL, '2026-03-07 06:46:34', NULL, NULL, NULL, NULL, 0),
(30, 2, NULL, NULL, 'Organic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'pending', NULL, '2026-03-07 06:47:39', NULL, NULL, NULL, NULL, 0),
(31, 2, NULL, NULL, 'Organic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'scheduled', NULL, '2026-03-07 06:48:19', NULL, NULL, NULL, NULL, 0),
(32, 2, NULL, NULL, 'Organic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'scheduled', NULL, '2026-03-07 06:48:33', NULL, NULL, NULL, NULL, 0),
(33, 2, NULL, NULL, 'Organic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'scheduled', NULL, '2026-03-07 06:49:06', NULL, NULL, NULL, NULL, 0),
(34, 2, 10021, NULL, 'Organic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'scheduled', NULL, '2026-03-07 06:49:42', NULL, NULL, 'Resident Not Home', 'Knocked 3 times', 1),
(35, 2, 10021, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'collected', NULL, '2026-03-07 06:49:42', '2026-03-07 06:49:42', 'Left a green bin', NULL, NULL, 0),
(36, 10025, 10031, '/uploads/biodegradable-1772869781912-699108736.png', 'non-biodegradable', 77.00, NULL, '[\"non-biodegradable\"]', NULL, '[\"dry\"]', NULL, 14.47103031, 121.05813289, 'Manuel L. Quezon Avenue, Taguig District 1', 7, 'collected', NULL, '2026-03-07 07:49:41', '2026-03-07 08:30:47', NULL, NULL, NULL, 0),
(37, 10032, 10033, '/uploads/mascot1-1773137792369-600846589.png', 'mixed', 0.75, NULL, '[\"[\\\\\"]', NULL, '[\"[\\\\\"]', 'Eval submission from script', 14.59950000, 120.98420000, 'Eval Street 123, Barangay Poblacion', 1, 'scheduled', NULL, '2026-03-10 10:16:32', NULL, NULL, NULL, NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `idx_feedback_user` (`user_id`),
  ADD KEY `idx_feedback_created` (`created_at`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`location_id`),
  ADD KEY `idx_barangay` (`barangay_name`),
  ADD KEY `idx_municipality` (`municipality`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`),
  ADD KEY `idx_type` (`notification_type`),
  ADD KEY `fk_notification_schedule` (`schedule_id`);

--
-- Indexes for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_email_status` (`email`,`status`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `fk_prr_user` (`user_id`);

--
-- Indexes for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  ADD PRIMARY KEY (`tracking_id`),
  ADD KEY `idx_schedule` (`schedule_id`),
  ADD KEY `idx_collector` (`collector_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_planned_date` (`planned_date`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `idx_location` (`location_id`),
  ADD KEY `idx_day` (`collection_day`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `fk_schedule_creator` (`created_by`),
  ADD KEY `idx_waste_category` (`waste_category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_barangay` (`barangay_id`);

--
-- Indexes for table `waste_categories`
--
ALTER TABLE `waste_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `uq_category_key` (`category_key`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `fk_category_creator` (`created_by`);

--
-- Indexes for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_collector` (`collector_id`),
  ADD KEY `idx_status` (`collection_status`),
  ADD KEY `idx_scheduled_date` (`scheduled_date`),
  ADD KEY `idx_barangay` (`barangay_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  MODIFY `tracking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10034;

--
-- AUTO_INCREMENT for table `waste_categories`
--
ALTER TABLE `waste_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD CONSTRAINT `fk_prr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  ADD CONSTRAINT `fk_tracking_collector` FOREIGN KEY (`collector_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tracking_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `fk_schedule_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_schedule_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_schedule_waste_category` FOREIGN KEY (`waste_category_id`) REFERENCES `waste_categories` (`category_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL;

--
-- Constraints for table `waste_categories`
--
ALTER TABLE `waste_categories`
  ADD CONSTRAINT `fk_category_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  ADD CONSTRAINT `fk_submission_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_submission_collector` FOREIGN KEY (`collector_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_submission_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_submissions_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
