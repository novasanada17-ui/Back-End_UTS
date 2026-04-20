-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2026 at 06:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `keretaapi_db`
--
CREATE DATABASE IF NOT EXISTS `keretaapi_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `keretaapi_db`;

-- --------------------------------------------------------

--
-- Table structure for table `kereta`
--

DROP TABLE IF EXISTS `kereta`;
CREATE TABLE IF NOT EXISTS `kereta` (
  `id_kereta` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kereta` varchar(100) DEFAULT NULL,
  `type` enum('Eksekutif','Ekonomi') DEFAULT NULL,
  `kapasitas` int(11) DEFAULT NULL,
  `asal_kota` varchar(100) DEFAULT NULL,
  `tujuan_kota` varchar(100) DEFAULT NULL,
  `id_stasiun` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_kereta`),
  KEY `id_stasiun` (`id_stasiun`)
) ENGINE=InnoDB AUTO_INCREMENT=508 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kereta`
--

INSERT INTO `kereta` (`id_kereta`, `nama_kereta`, `type`, `kapasitas`, `asal_kota`, `tujuan_kota`, `id_stasiun`) VALUES
(500, 'Argo Bromo Anggrek', 'Eksekutif', 50, 'Jakarta', 'Surabaya', 101),
(501, 'Gajayana', 'Ekonomi', 80, 'Malang', 'Jakarta', 102),
(502, 'Matarmaja', 'Ekonomi', 80, 'Jakarta', 'Malang', 103),
(503, 'Taksaka', 'Eksekutif', 70, 'Jakarta', 'Yogyakarta', 104),
(504, 'Sancaka', 'Ekonomi', 90, 'Yogyakarta', 'Surabaya', 105);

-- --------------------------------------------------------

--
-- Table structure for table `stasiun`
--

DROP TABLE IF EXISTS `stasiun`;
CREATE TABLE IF NOT EXISTS `stasiun` (
  `id_stasiun` int(11) NOT NULL AUTO_INCREMENT,
  `nama_stasiun` varchar(100) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_stasiun`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stasiun`
--

INSERT INTO `stasiun` (`id_stasiun`, `nama_stasiun`, `kota`) VALUES
(101, 'Gambir', 'Jakarta'),
(102, 'Pasar Turi', 'Surabaya'),
(103, 'Tugu', 'Yogyakarta'),
(104, 'Bandung Hall', 'Bandung'),
(105, 'Semarang Tawang', 'Semarang');

-- --------------------------------------------------------

--
-- Table structure for table `tiket`
--

DROP TABLE IF EXISTS `tiket`;
CREATE TABLE IF NOT EXISTS `tiket` (
  `id_tiket` int(11) NOT NULL AUTO_INCREMENT,
  `id_transaksi` int(11) DEFAULT NULL,
  `id_kereta` int(11) DEFAULT NULL,
  `no_kursi` varchar(10) DEFAULT NULL,
  `tanggal_keberangkatan` datetime DEFAULT NULL,
  PRIMARY KEY (`id_tiket`),
  KEY `id_transaksi` (`id_transaksi`),
  KEY `id_kereta` (`id_kereta`)
) ENGINE=InnoDB AUTO_INCREMENT=817 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tiket`
--

INSERT INTO `tiket` (`id_tiket`, `id_transaksi`, `id_kereta`, `no_kursi`, `tanggal_keberangkatan`) VALUES
(801, 901, 501, '7A', '2026-05-01 09:05:00'),
(802, 902, 500, '7B', '2026-05-01 13:45:00'),
(803, 903, 504, '12A', '2026-05-02 10:15:00'),
(804, 904, 501, '12A', '2026-05-02 16:30:00'),
(809, 912, 502, '6B', '2026-05-22 08:30:00'),
(810, 913, 503, '6C', '2026-05-23 09:15:00'),
(811, 914, 504, '6D', '2026-05-24 10:00:00'),
(812, 915, 501, '6E', '2026-05-25 11:45:00'),
(813, 916, 501, '17A', '2026-05-26 13:20:00'),
(814, 917, 502, '7B', '2026-05-27 14:10:00'),
(815, 918, 503, '5B', '2026-05-28 15:00:00'),
(816, 919, 500, '10A', '2026-05-29 16:25:00');

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

DROP TABLE IF EXISTS `transaksi`;
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id_transaksi` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `total_harga` int(11) DEFAULT NULL,
  `status` enum('lunas','pending','dibatalkan') DEFAULT NULL,
  PRIMARY KEY (`id_transaksi`),
  KEY `id_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=920 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `id_user`, `total_harga`, `status`) VALUES
(901, 1, 50000, 'lunas'),
(902, 2, 35000, 'pending'),
(903, 3, 120000, 'lunas'),
(904, 4, 45000, 'lunas'),
(912, 6, 210000, 'lunas'),
(913, 7, 180000, 'lunas'),
(914, 8, 230000, 'lunas'),
(915, 9, 190000, 'lunas'),
(916, 10, 175000, 'lunas'),
(917, 11, 200000, 'lunas'),
(918, 12, 185000, 'pending'),
(919, 13, 240000, 'lunas');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `no_telp` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `nama`, `email`, `no_telp`) VALUES
(1, 'Nova', 'nova1@email.com', '08123456789'),
(2, 'Semina', 'semina10@mail.com', '08129876543'),
(3, 'Jacintha', 'jacc09@mail.com', '08134455667'),
(4, 'Jasmine', 'jasmine67@mail.com', '08567788990'),
(6, 'Eka Putri', 'eka@mail.com', '0811111115'),
(7, 'Fajar Nugroho', 'fajar@mail.com', '0811111116'),
(8, 'Gina Lestari', 'gina@mail.com', '0811111117'),
(9, 'Hendra Wijaya', 'hendra@mail.com', '0811111118'),
(10, 'Intan Permata', 'intan@mail.com', '0811111119'),
(11, 'Joko Susilo', 'joko@mail.com', '0811111120'),
(12, 'Kiki Amelia', 'kiki@mail.com', '0811111121'),
(13, 'Lukman Hakim', 'lukman@mail.com', '0811111122'),
(14, 'Maya Sari', 'maya@mail.com', '0811111123'),
(15, 'Nanda Putra', 'nanda@mail.com', '0811111124'),
(16, 'Oki Prasetyo', 'oki@mail.com', '0811111125'),
(17, 'Putri Ayu', 'putri@mail.com', '0811111126'),
(18, 'Rizky Hidayat', 'rizky@mail.com', '0811111127'),
(19, 'Sari Wulandari', 'sari@mail.com', '0811111128'),
(20, 'Tono Wijaya', 'tono@mail.com', '0811111129'),
(21, 'Vina Melati', 'vina@mail.com', '0811111130');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `kereta`
--
ALTER TABLE `kereta`
  ADD CONSTRAINT `kereta_ibfk_1` FOREIGN KEY (`id_stasiun`) REFERENCES `stasiun` (`id_stasiun`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tiket`
--
ALTER TABLE `tiket`
  ADD CONSTRAINT `tiket_ibfk_1` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE,
  ADD CONSTRAINT `tiket_ibfk_2` FOREIGN KEY (`id_kereta`) REFERENCES `kereta` (`id_kereta`);

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
