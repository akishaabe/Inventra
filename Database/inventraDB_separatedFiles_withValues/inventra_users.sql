-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: inventra
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('SUPERADMIN','ADMIN','STAFF') NOT NULL DEFAULT 'STAFF',
  `is_2fa_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `date_registered` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_password_change` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Jericho Leanard','Mendoza','jericho.mendoza@inventra.com','hashed_pw_1','SUPERADMIN',1,'2025-09-01 09:00:00','2025-09-05 09:00:00'),(2,'Maria','Santos','maria.santos@inventra.com','hashed_pw_2','ADMIN',1,'2025-09-03 10:30:00','2025-09-08 11:00:00'),(3,'Carlos','Dizon','carlos.dizon@inventra.com','hashed_pw_3','STAFF',0,'2025-09-05 08:15:00','2025-09-07 09:45:00'),(4,'Anne','Rivera','anne.rivera@inventra.com','hashed_pw_4','STAFF',0,'2025-09-06 13:40:00',NULL),(5,'John','Cruz','john.cruz@inventra.com','hashed_pw_5','ADMIN',1,'2025-09-07 15:10:00','2025-09-09 17:00:00'),(6,'Paula','Reyes','paula.reyes@inventra.com','hashed_pw_6','STAFF',0,'2025-09-09 08:00:00',NULL),(7,'Miguel','Ramos','miguel.ramos@inventra.com','hashed_pw_7','STAFF',0,'2025-09-10 10:00:00',NULL),(8,'Sofia','Lim','sofia.lim@inventra.com','hashed_pw_8','ADMIN',1,'2025-09-12 14:30:00','2025-09-14 10:00:00'),(9,'Nathaniel','Bautista','nathan.bautista@inventra.com','hashed_pw_9','STAFF',0,'2025-09-15 16:45:00',NULL),(10,'Ella','De Leon','ella.deleon@inventra.com','hashed_pw_10','STAFF',0,'2025-09-17 09:20:00',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-13  9:57:48
