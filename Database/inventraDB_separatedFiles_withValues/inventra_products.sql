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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `reorder_level` int NOT NULL DEFAULT '0',
  `supplier_id` int DEFAULT NULL,
  `cost_per_unit` decimal(10,2) DEFAULT NULL,
  `has_expiry` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `supplier_id` (`supplier_id`),
  KEY `idx_products_category` (`category`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'P1001','Arabica Beans 1kg','Coffee Beans','kg',20,1,450.00,0,'2025-09-01 09:00:00'),(2,'P1002','Robusta Beans 1kg','Coffee Beans','kg',15,2,380.00,0,'2025-09-02 09:00:00'),(3,'P1003','Espresso Blend 500g','Coffee Beans','pack',10,3,300.00,0,'2025-09-03 09:00:00'),(4,'P1004','Paper Cups (100pcs)','Supplies','box',25,4,120.00,0,'2025-09-04 09:00:00'),(5,'P1005','Milk 1L','Dairy','bottle',10,5,85.00,1,'2025-09-05 09:00:00'),(6,'P1006','Sugar 5kg','Condiments','bag',8,6,210.00,0,'2025-09-06 09:00:00'),(7,'P1007','Chocolate Syrup 1L','Flavorings','bottle',5,7,250.00,1,'2025-09-07 09:00:00'),(8,'P1008','Whipped Cream 500ml','Dairy','bottle',6,8,180.00,1,'2025-09-08 09:00:00'),(9,'P1009','Caramel Syrup 1L','Flavorings','bottle',5,9,260.00,1,'2025-09-09 09:00:00'),(10,'P1010','Vanilla Extract 250ml','Flavorings','bottle',3,10,190.00,1,'2025-09-10 09:00:00');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
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
