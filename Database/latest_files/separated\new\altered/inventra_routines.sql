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
-- Temporary view structure for view `training_dataset`
--

DROP TABLE IF EXISTS `training_dataset`;
/*!50001 DROP VIEW IF EXISTS `training_dataset`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `training_dataset` AS SELECT 
 1 AS `date`,
 1 AS `product_id`,
 1 AS `product_name`,
 1 AS `quantity_available`,
 1 AS `search_interest`,
 1 AS `sales_amount`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `training_dataset`
--

/*!50001 DROP VIEW IF EXISTS `training_dataset`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `training_dataset` AS select `f`.`forecast_date` AS `date`,`p`.`product_id` AS `product_id`,`p`.`product_name` AS `product_name`,`i`.`quantity_available` AS `quantity_available`,`t`.`search_interest` AS `search_interest`,sum(`si`.`line_total`) AS `sales_amount` from ((((`forecasts` `f` join `products` `p` on((`f`.`product_id` = `p`.`product_id`))) left join `inventory` `i` on((`i`.`product_id` = `p`.`product_id`))) left join `staging_trends` `t` on(((`t`.`product_name` = `p`.`product_name`) and (`t`.`trend_date` = `f`.`forecast_date`)))) left join `sales_items` `si` on((`si`.`product_id` = `p`.`product_id`))) group by `f`.`forecast_date`,`p`.`product_id`,`p`.`product_name`,`i`.`quantity_available`,`t`.`search_interest` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-17  1:32:49
