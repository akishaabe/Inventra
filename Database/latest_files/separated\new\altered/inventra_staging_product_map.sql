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
-- Table structure for table `staging_product_map`
--

DROP TABLE IF EXISTS `staging_product_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staging_product_map` (
  `term` varchar(100) DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(100) DEFAULT NULL,
  `match_method` varchar(50) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staging_product_map`
--

LOCK TABLES `staging_product_map` WRITE;
/*!40000 ALTER TABLE `staging_product_map` DISABLE KEYS */;
INSERT INTO `staging_product_map` VALUES ('latte',1,'Latte','exact','Direct match from product_name\r'),('hot chocolate',2,'Hot Chocolate','exact','Direct match from product_name\r'),('americano',3,'Americano','exact','Direct match from product_name\r'),('cocoa',4,'Cocoa','exact','Direct match from product_name\r'),('espresso',5,'Espresso','exact','Direct match from product_name\r'),('cappuccino',6,'Cappuccino','exact','Direct match from product_name\r'),('americano with milk',7,'Americano with milk','exact','Direct match from product_name\r'),('cortado',8,'Cortado','exact','Direct match from product_name\r'),('cold brew',3,'Americano','approximate','Closest equivalent to brewed black coffee\r'),('mocha',1,'Latte','approximate','Usually based on latte with chocolate\r'),('macchiato',5,'Espresso','approximate','Espresso-based drink\r'),('flat white',6,'Cappuccino','approximate','Similar milk-foam ratio\r'),('matcha',4,'Cocoa','approximate','Closest non-coffee beverage in menu\r');
/*!40000 ALTER TABLE `staging_product_map` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-17  1:32:48
