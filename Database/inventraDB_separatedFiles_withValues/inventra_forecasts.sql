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
-- Table structure for table `forecasts`
--

DROP TABLE IF EXISTS `forecasts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forecasts` (
  `forecast_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `forecasted_demand` decimal(10,2) NOT NULL,
  `forecast_date` date NOT NULL,
  `generated_by` int DEFAULT NULL,
  `model_meta` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`forecast_id`),
  UNIQUE KEY `uq_forecast_product_date` (`product_id`,`forecast_date`),
  KEY `generated_by` (`generated_by`),
  CONSTRAINT `forecasts_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `forecasts_ibfk_2` FOREIGN KEY (`generated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forecasts`
--

LOCK TABLES `forecasts` WRITE;
/*!40000 ALTER TABLE `forecasts` DISABLE KEYS */;
INSERT INTO `forecasts` VALUES (1,1,140.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:00:00'),(2,2,110.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:05:00'),(3,3,85.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:10:00'),(4,4,220.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:15:00'),(5,5,65.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:20:00'),(6,6,70.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:25:00'),(7,7,50.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:30:00'),(8,8,35.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:35:00'),(9,9,30.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:40:00'),(10,10,25.00,'2025-11-01',1,'Model=v1.0;Method=LinearRegression','2025-10-10 11:45:00');
/*!40000 ALTER TABLE `forecasts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-13  9:57:49
