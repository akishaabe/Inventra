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
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `backup_id` int NOT NULL AUTO_INCREMENT,
  `backup_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `backup_file` varchar(500) NOT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`backup_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
INSERT INTO `backups` VALUES (1,'2025-10-01 19:00:00','/backups/inventra_backup_2025-10-01.sql',1),(2,'2025-10-02 19:00:00','/backups/inventra_backup_2025-10-02.sql',1),(3,'2025-10-03 19:00:00','/backups/inventra_backup_2025-10-03.sql',1),(4,'2025-10-04 19:00:00','/backups/inventra_backup_2025-10-04.sql',1),(5,'2025-10-05 19:00:00','/backups/inventra_backup_2025-10-05.sql',1),(6,'2025-10-06 19:00:00','/backups/inventra_backup_2025-10-06.sql',1),(7,'2025-10-07 19:00:00','/backups/inventra_backup_2025-10-07.sql',1),(8,'2025-10-08 19:00:00','/backups/inventra_backup_2025-10-08.sql',1),(9,'2025-10-09 19:00:00','/backups/inventra_backup_2025-10-09.sql',1),(10,'2025-10-10 19:00:00','/backups/inventra_backup_2025-10-10.sql',1);
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `quantity_available` decimal(10,2) NOT NULL DEFAULT '0.00',
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `product_id` (`product_id`),
  KEY `idx_inventory_qty` (`quantity_available`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,120.00,'2025-10-10 10:00:00'),(2,2,90.00,'2025-10-10 10:05:00'),(3,3,75.00,'2025-10-10 10:10:00'),(4,4,200.00,'2025-10-10 10:15:00'),(5,5,50.00,'2025-10-10 10:20:00'),(6,6,60.00,'2025-10-10 10:25:00'),(7,7,40.00,'2025-10-10 10:30:00'),(8,8,30.00,'2025-10-10 10:35:00'),(9,9,25.00,'2025-10-10 10:40:00'),(10,10,15.00,'2025-10-10 10:45:00');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `report_type` enum('INVENTORY','SALES','FORECAST') NOT NULL,
  `generated_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `generated_by` int DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `generated_by` (`generated_by`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,'SALES','2025-10-01 18:00:00',1,'/reports/sales_2025-10-01.pdf'),(2,'SALES','2025-10-02 18:00:00',1,'/reports/sales_2025-10-02.pdf'),(3,'SALES','2025-10-03 18:00:00',1,'/reports/sales_2025-10-03.pdf'),(4,'INVENTORY','2025-10-04 18:00:00',1,'/reports/inventory_2025-10-04.pdf'),(5,'INVENTORY','2025-10-05 18:00:00',1,'/reports/inventory_2025-10-05.pdf'),(6,'FORECAST','2025-10-06 18:00:00',1,'/reports/forecast_2025-10-06.pdf'),(7,'FORECAST','2025-10-07 18:00:00',1,'/reports/forecast_2025-10-07.pdf'),(8,'SALES','2025-10-08 18:00:00',1,'/reports/sales_2025-10-08.pdf'),(9,'INVENTORY','2025-10-09 18:00:00',1,'/reports/inventory_2025-10-09.pdf'),(10,'FORECAST','2025-10-10 18:00:00',1,'/reports/forecast_2025-10-10.pdf');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `sale_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `processed_by` int DEFAULT NULL,
  `payment_type` enum('CASH','CARD','OTHER') DEFAULT 'CASH',
  PRIMARY KEY (`sale_id`),
  KEY `processed_by` (`processed_by`),
  KEY `idx_sales_date` (`sale_date`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,'2025-10-01 08:30:00',1800.00,3,'CASH'),(2,'2025-10-02 09:00:00',2500.00,4,'CARD'),(3,'2025-10-03 10:00:00',1300.00,6,'CASH'),(4,'2025-10-04 11:00:00',2900.00,7,'CARD'),(5,'2025-10-05 12:00:00',2100.00,8,'CASH'),(6,'2025-10-06 13:00:00',3100.00,9,'CASH'),(7,'2025-10-07 14:00:00',2700.00,5,'CARD'),(8,'2025-10-08 15:00:00',1500.00,6,'CASH'),(9,'2025-10-09 16:00:00',3300.00,4,'CARD'),(10,'2025-10-10 17:00:00',2900.00,3,'CASH');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_items`
--

DROP TABLE IF EXISTS `sales_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_items` (
  `sale_item_id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`sale_item_id`),
  KEY `idx_sales_items_product` (`product_id`),
  KEY `idx_sales_items_sale` (`sale_id`),
  CONSTRAINT `sales_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`sale_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sales_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_items`
--

LOCK TABLES `sales_items` WRITE;
/*!40000 ALTER TABLE `sales_items` DISABLE KEYS */;
INSERT INTO `sales_items` VALUES (1,1,1,2.00,450.00,900.00),(2,1,2,2.00,450.00,900.00),(3,2,3,4.00,300.00,1200.00),(4,2,5,5.00,85.00,425.00),(5,3,6,2.00,210.00,420.00),(6,4,7,5.00,250.00,1250.00),(7,5,9,4.00,260.00,1040.00),(8,6,8,6.00,180.00,1080.00),(9,7,10,5.00,190.00,950.00),(10,8,4,8.00,120.00,960.00);
/*!40000 ALTER TABLE `sales_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(200) NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`supplier_id`),
  KEY `idx_suppliers_name` (`supplier_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Café Beans Supply Co.','Lucia Navarro','+63 917 100 1111','lucia@cafebeans.com'),(2,'RoastMasters Inc.','Leo Tan','+63 917 100 2222','leo@roastmasters.com'),(3,'PureBrew Trading','Karla Uy','+63 917 100 3333','karla@purebrew.com'),(4,'Bean Republic','Jose Enriquez','+63 917 100 4444','jose@beanrepublic.com'),(5,'Grind House Distribution','Erika Gomez','+63 917 100 5555','erika@grindhouse.com'),(6,'Brew & Co.','Daryl Chua','+63 917 100 6666','daryl@brewandco.com'),(7,'Golden Aroma Traders','Patrick Yu','+63 917 100 7777','patrick@goldenaroma.com'),(8,'CoffeeCraft Supply','Lara Bautista','+63 917 100 8888','lara@coffeecraft.com'),(9,'KapePH Importers','Marco Rivera','+63 917 100 9999','marco@kapeph.com'),(10,'DailyDrip Merchants','Tina Ramos','+63 917 101 0000','tina@dailydrip.com');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

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

-- Dump completed on 2025-10-13  9:56:41
