/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80028
 Source Host           : localhost:3306
 Source Schema         : appointment

 Target Server Type    : MySQL
 Target Server Version : 80028
 File Encoding         : 65001

 Date: 17/10/2023 22:03:14
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for registration
-- ----------------------------
DROP TABLE IF EXISTS `registration`;
CREATE TABLE `registration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reservation_id` int DEFAULT NULL,
  `time` time DEFAULT NULL,
  `userId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `registration_user` (`userId`),
  KEY `registration_resevation` (`reservation_id`),
  CONSTRAINT `registration_resevation` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`id`),
  CONSTRAINT `registration_user` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of registration
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for registration_date
-- ----------------------------
DROP TABLE IF EXISTS `registration_date`;
CREATE TABLE `registration_date` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int DEFAULT NULL,
  `selected_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `registration_date` (`registration_id`),
  CONSTRAINT `registration_date` FOREIGN KEY (`registration_id`) REFERENCES `registration` (`id`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of registration_date
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for reservation
-- ----------------------------
DROP TABLE IF EXISTS `reservation`;
CREATE TABLE `reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `startTimeLimit` time NOT NULL,
  `endTimeLimit` time NOT NULL,
  `useId` varchar(255) NOT NULL,
  `detail` blob,
  PRIMARY KEY (`id`),
  KEY `register_user` (`useId`),
  CONSTRAINT `register_user` FOREIGN KEY (`useId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of reservation
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for reservation_date
-- ----------------------------
DROP TABLE IF EXISTS `reservation_date`;
CREATE TABLE `reservation_date` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reservation_id` int NOT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_date` (`reservation_id`),
  CONSTRAINT `reservation_date` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of reservation_date
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `userId` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `auth` int DEFAULT NULL COMMENT '0：''user''，1：''administor',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
BEGIN;
INSERT INTO `user` (`userId`, `password`, `name`, `auth`) VALUES ('123', '123', '123', 1);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
