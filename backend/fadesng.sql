-- drop database if exists fadesng;
create database if not exists fadesng;
use fadesng;

-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: fadesng
-- ------------------------------------------------------
-- Server version	8.0.34
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;

/*!50503 SET NAMES utf8 */
;

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;

/*!40103 SET TIME_ZONE='+00:00' */
;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */
;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;

/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;

/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;

--
-- Table structure for table `concerts`
--
DROP TABLE IF EXISTS `concerts`;

/*!40101 SET @saved_cs_client     = @@character_set_client */
;

/*!50503 SET character_set_client = utf8mb4 */
;

CREATE TABLE `concerts` (
  `concert_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `date` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tickets_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`concert_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `concerts`
--
LOCK TABLES `concerts` WRITE;

/*!40000 ALTER TABLE `concerts` DISABLE KEYS */
;

INSERT INTO
  `concerts`
VALUES
  (
    1,
    'Presentació Nou Disc',
    'Presentació del nou disc de la banda',
    '2025-03-27 20:00:00',
    'Barcelona - Sala Apolo',
    '2025-11-28 00:25:59',
    NULL
  ),
  (
    2,
    'Presentació Nou Disc',
    'Presentació del nou disc de la banda',
    '2025-03-28 20:00:00',
    'Barcelona - Sala Apolo',
    '2025-11-28 00:36:54',
    NULL
  ),
  (
    3,
    'Presentació Nou Disc',
    'Presentació del nou disc de la banda',
    '2025-04-28 20:00:00',
    'Barcelona - Sala Apolo',
    '2024-11-28 00:37:11',
    NULL
  ),
  (
    4,
    'Presentació Nou Disc',
    'Presentació del nou disc de la banda',
    '2025-04-28 20:00:00',
    'Barcelona - Sala Apolo',
    '2024-11-28 00:37:21',
    NULL
  ),
  (
    5,
    'Presentació Nou Disc',
    'Presentació del nou disc de la banda',
    '2024-04-28 20:00:00',
    'Barcelona - Sala Apolo',
    '2024-11-28 00:37:39',
    NULL
  ),
  (
    6,
    'Presentació Nou Disc',
    'Presentació del nou disc de la banda',
    '2024-01-28 20:00:00',
    'Barcelona - Sala Apolo',
    '2024-11-28 00:38:47',
    NULL
  ),
  (
    7,
    'Presentació Nou Disc',
    'Presentació del nou disc de la banda',
    '2025-01-28 20:00:00',
    'Barcelona - Sala Apolo',
    '2024-11-28 00:39:49',
    NULL
  ),
  (
    8,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-03 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    9,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-03 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    10,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-03 00:26:53',
    NULL
  ),
(
    11,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-03 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    12,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-01 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    13,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-09 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    14,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-08 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    15,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-07 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    16,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-06 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    17,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-23 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    18,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-13 00:26:53',
    'https://www.salarazzmatazz.com/en/professionals/riders'
  ),
(
    19,
    'Presentació',
    'presentem directe!',
    '2025-02-20 01:25:00',
    'Sala razzmataz',
    '2025-12-00 00:26:53',
    NULL
  );

/*!40000 ALTER TABLE `concerts` ENABLE KEYS */
;

UNLOCK TABLES;
--
-- Table structure for table `product_images`
--
DROP TABLE IF EXISTS `product_images`;

/*!40101 SET @saved_cs_client     = @@character_set_client */
;

/*!50503 SET character_set_client = utf8mb4 */
;

CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  PRIMARY KEY (`image_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 17 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `product_images`
--
LOCK TABLES `product_images` WRITE;

/*!40000 ALTER TABLE `product_images` DISABLE KEYS */
;

INSERT INTO
  `product_images`
VALUES
  (1, 7, 'assets/icon.jpg'),
  (2, 7, 'assets/carroussel1.jpg'),
  (3, 2, 'assets/carroussel2.jpg'),
  (4, 3, 'assets/carroussel3.jpeg'),
  (5, 8, 'assets/icon.jpg'),
  (
    7,
    5,
    'uploads/products/product_6750302e1aead2.30431539.jpg'
  ),
  (
    8,
    5,
    'uploads/products/product_675030c4175bd3.73336133.jpg'
  ),
  (
    9,
    9,
    'uploads/products/upload_6756376c7bfe30.61060407.webp'
  ),
  (
    10,
    10,
    'uploads/products/upload_6756c4ed7a7422.90004657.webp'
  ),
  (
    11,
    11,
    'uploads/products/upload_6756c691a2e9d3.91004427.webp'
  ),
  (
    12,
    11,
    'uploads/products/upload_6756c691a30092.25611588.webp'
  ),
  (
    13,
    12,
    'uploads/products/upload_6756c71d8a0c55.63290719.webp'
  ),
  (
    14,
    9,
    'uploads/products/upload_6756c74d20dee2.95234974.webp'
  ),
  (
    15,
    10,
    'uploads/products/upload_6756c756cd00b6.63358248.webp'
  ),
  (
    16,
    13,
    'uploads/products/upload_6756c7c2cd1646.42450110.webp'
  );

/*!40000 ALTER TABLE `product_images` ENABLE KEYS */
;

UNLOCK TABLES;

--
-- Table structure for table `product_properties`
--
DROP TABLE IF EXISTS `product_properties`;

/*!40101 SET @saved_cs_client     = @@character_set_client */
;

/*!50503 SET character_set_client = utf8mb4 */
;

CREATE TABLE `product_properties` (
  `property_id` int NOT NULL AUTO_INCREMENT,
  `variation_id` int DEFAULT NULL,
  `property_name` varchar(255) NOT NULL,
  `property_value` varchar(255) NOT NULL,
  PRIMARY KEY (`property_id`),
  KEY `variation_id` (`variation_id`),
  CONSTRAINT `product_properties_ibfk_1` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`variation_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 26 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `product_properties`
--
LOCK TABLES `product_properties` WRITE;

/*!40000 ALTER TABLE `product_properties` DISABLE KEYS */
;

INSERT INTO
  `product_properties`
VALUES
  (7, 5, 'Talla', 'S'),
  (8, 6, 'Talla', 'M'),
  (9, 7, 'Talla', 'L'),
  (10, 8, 'Color', 'Blanc'),
  (11, 9, 'Color', 'Negre'),
  (21, 30, 'talla', 'grossa'),
  (22, 31, 'talla', 'petiteta'),
  (23, 32, 'Talla', 'M'),
  (24, 33, 'Talla', 'L'),
  (25, 34, 'Talla', 'XL');

/*!40000 ALTER TABLE `product_properties` ENABLE KEYS */
;

UNLOCK TABLES;

--
-- Table structure for table `product_variations`
--
DROP TABLE IF EXISTS `product_variations`;

/*!40101 SET @saved_cs_client     = @@character_set_client */
;

/*!50503 SET character_set_client = utf8mb4 */
;

CREATE TABLE `product_variations` (
  `variation_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`variation_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 35 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `product_variations`
--
LOCK TABLES `product_variations` WRITE;

/*!40000 ALTER TABLE `product_variations` DISABLE KEYS */
;

INSERT INTO
  `product_variations`
VALUES
  (5, 7, 12),
  (6, 7, 15),
  (7, 7, 8),
  (8, 8, 20),
  (9, 8, 12),
  (30, 3, 23),
  (31, 3, 43),
  (32, 9, 6),
  (33, 9, 3),
  (34, 9, 9);

/*!40000 ALTER TABLE `product_variations` ENABLE KEYS */
;

UNLOCK TABLES;

/*!50003 SET @saved_cs_client      = @@character_set_client */
;

/*!50003 SET @saved_cs_results     = @@character_set_results */
;

/*!50003 SET @saved_col_connection = @@collation_connection */
;

/*!50003 SET character_set_client  = utf8mb4 */
;

/*!50003 SET character_set_results = utf8mb4 */
;

/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */
;

/*!50003 SET @saved_sql_mode       = @@sql_mode */
;

/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */
;

DELIMITER ;


/*!50003 CREATE*/
/*!50017 DEFINER=`root`@`localhost`*/
/*!50003 TRIGGER `update_product_stock_after_variation_change` AFTER INSERT ON `product_variations` FOR EACH ROW BEGIN
 UPDATE products
 SET stock = (
 SELECT SUM(stock)
 FROM product_variations
 WHERE product_id = NEW.product_id
 )
 WHERE product_id = NEW.product_id;
 END */
;

;

DELIMITER ;

/*!50003 SET sql_mode              = @saved_sql_mode */
;

/*!50003 SET character_set_client  = @saved_cs_client */
;

/*!50003 SET character_set_results = @saved_cs_results */
;

/*!50003 SET collation_connection  = @saved_col_connection */
;

/*!50003 SET @saved_cs_client      = @@character_set_client */
;

/*!50003 SET @saved_cs_results     = @@character_set_results */
;

/*!50003 SET @saved_col_connection = @@collation_connection */
;

/*!50003 SET character_set_client  = utf8mb4 */
;

/*!50003 SET character_set_results = utf8mb4 */
;

/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */
;

/*!50003 SET @saved_sql_mode       = @@sql_mode */
;

/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */
;

DELIMITER ;

;

/*!50003 CREATE*/
/*!50017 DEFINER=`root`@`localhost`*/
/*!50003 TRIGGER `update_product_stock_after_variation_update` AFTER UPDATE ON `product_variations` FOR EACH ROW BEGIN
 UPDATE products
 SET stock = (
 SELECT SUM(stock)
 FROM product_variations
 WHERE product_id = NEW.product_id
 )
 WHERE product_id = NEW.product_id;
 END */
;

;

DELIMITER ;

/*!50003 SET sql_mode              = @saved_sql_mode */
;

/*!50003 SET character_set_client  = @saved_cs_client */
;

/*!50003 SET character_set_results = @saved_cs_results */
;

/*!50003 SET collation_connection  = @saved_col_connection */
;

/*!50003 SET @saved_cs_client      = @@character_set_client */
;

/*!50003 SET @saved_cs_results     = @@character_set_results */
;

/*!50003 SET @saved_col_connection = @@collation_connection */
;

/*!50003 SET character_set_client  = utf8mb4 */
;

/*!50003 SET character_set_results = utf8mb4 */
;

/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */
;

/*!50003 SET @saved_sql_mode       = @@sql_mode */
;

/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */
;

DELIMITER ;

;

/*!50003 CREATE*/
/*!50017 DEFINER=`root`@`localhost`*/
/*!50003 TRIGGER `update_product_stock_after_variation_delete` AFTER DELETE ON `product_variations` FOR EACH ROW BEGIN
 UPDATE products
 SET stock = (
 SELECT IFNULL(SUM(stock), 0)
 FROM product_variations
 WHERE product_id = OLD.product_id
 )
 WHERE product_id = OLD.product_id;
 END */
;

;

DELIMITER ;

/*!50003 SET sql_mode              = @saved_sql_mode */
;

/*!50003 SET character_set_client  = @saved_cs_client */
;

/*!50003 SET character_set_results = @saved_cs_results */
;

/*!50003 SET collation_connection  = @saved_col_connection */
;

--
-- Table structure for table `products`
--
DROP TABLE IF EXISTS `products`;

/*!40101 SET @saved_cs_client     = @@character_set_client */
;

/*!50503 SET character_set_client = utf8mb4 */
;

CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `in_shop` tinyint(1) DEFAULT '0',
  `stock` int DEFAULT '0',
  PRIMARY KEY (`product_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `products`
--
LOCK TABLES `products` WRITE;

/*!40000 ALTER TABLE `products` DISABLE KEYS */
;

INSERT INTO
  `products`
VALUES
  (
    2,
    'Hoodie',
    'A warm hoodie for winter.',
    40.00,
    '2024-11-28 00:25:59',
    1,
    10
  ),
  (
    3,
    'Gorra',
    'Sigues la més raxeta',
    15.00,
    '2024-11-28 00:25:59',
    0,
    66
  ),
  (
    5,
    'Mòbil Android',
    'Telèfon intel·ligent de gamma alta',
    499.99,
    '2024-12-03 22:31:14',
    0,
    9
  ),
  (
    7,
    'Samarreta crop',
    'Samarreta tècnica de polièster',
    19.99,
    '2024-12-03 22:34:24',
    1,
    35
  ),
  (
    8,
    'Tassa de ceràmica',
    'Tassa de ceràmica personalitzada',
    12.50,
    '2024-12-03 22:34:24',
    1,
    32
  ),
  (
    9,
    'Samarreta Metallix',
    NULL,
    20.00,
    '2024-12-09 00:18:52',
    1,
    18
  ),
  (
    10,
    'Samarreta No t\'entenc soc catalana',
    NULL,
    20.00,
    '2024-12-09 10:22:37',
    1,
    13
  ),
  (
    11,
    'Collar',
    'Collaret d´acer inoxidable, matrícules de 5 x 1.5 cm treballades amb relleus en 2D i esmalts de la millor qualitat',
    29.95,
    '2024-12-09 10:29:37',
    1,
    30
  ),
  (
    12,
    'Pack Metallix',
    'Pack edició limitada Metallix. Inclou\r\nGorra fadesng\r\nCollar fadesng\r\nTote Bag No T\'entenc Soc Catalana\r\nTattoos fadesng',
    64.95,
    '2024-12-09 10:31:57',
    1,
    32
  ),
  (
    13,
    'Gorra',
    'Marxandatge oficial fadesng\r\nGorra 100% cotó rentat personalitzat a mà',
    24.95,
    '2024-12-09 10:34:42',
    1,
    13
  );

/*!40000 ALTER TABLE `products` ENABLE KEYS */
;

UNLOCK TABLES;

--
-- Table structure for table `settings`
--
DROP TABLE IF EXISTS `settings`;

/*!40101 SET @saved_cs_client     = @@character_set_client */
;

/*!50503 SET character_set_client = utf8mb4 */
;

CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key_name` varchar(255) NOT NULL,
  `value` text,
  `type` enum('image', 'text', 'url', 'other') DEFAULT 'other',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `settings`
--
LOCK TABLES `settings` WRITE;

/*!40000 ALTER TABLE `settings` DISABLE KEYS */
;

INSERT INTO
  `settings`
VALUES
  (
    1,
    'home_page_carroussel',
    'assets/icon.jpg',
    'image',
    'Benvingut a <a class=\"btn btn-primary metallic-button\" href=\"fadesng.cat\" role=\"button\">fadesng</a>',
    '2024-12-05 22:00:54',
    '2024-12-05 23:35:41'
  ),
  (
    2,
    'home_page_carroussel',
    'assets/icon.jpg',
    'image',
    'escolta el nou disc <p class=\"font-weight-bold\">METALLIX</p>',
    '2024-12-05 22:00:54',
    '2024-12-05 23:24:51'
  );

/*!40000 ALTER TABLE `settings` ENABLE KEYS */
;

UNLOCK TABLES;

--
-- Table structure for table `users`
--
DROP TABLE IF EXISTS `users`;

/*!40101 SET @saved_cs_client     = @@character_set_client */
;

/*!50503 SET character_set_client = utf8mb4 */
;

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `refresh_token` varchar(64) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
);

/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `users`
--
LOCK TABLES `users` WRITE;

/*!40000 ALTER TABLE `users` DISABLE KEYS */
;

UNLOCK TABLES;

CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`)
);

CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER assign_default_role
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    -- Declare variables
    DECLARE viewer_role_id INT;

    -- Get the role_id for 'viewer'
    SELECT role_id INTO viewer_role_id
    FROM roles
    WHERE role_name = 'viewer';

    -- If the 'viewer' role exists, assign it to the new user
    IF viewer_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (NEW.user_id, viewer_role_id);
    END IF;
END //

DELIMITER ;

use fadesng;

CREATE TABLE drink_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    day_of_week int NOT NULL,
    location VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    drink VARCHAR(100) NOT NULL,
    quantity DECIMAL(5,2) NOT NULL,
    others TEXT,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Example data insertion
INSERT INTO drink_data (user_id, date, day_of_week, location, latitude, longitude, drink, quantity, others, price)
VALUES (1, '2024-03-09', 'Saturday', 'Barcelona', 41.3851, 2.1734, 'Beer', 0.5, 'Local brand', 3.50);

CREATE TABLE questions_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE
);

INSERT INTO questions_data (question, category, is_approved)
VALUES ('Never have I ever traveled to another country.', 'Travel', TRUE),
       ('Never have I ever lied to get out of trouble.', 'Personal', FALSE),
       ('Never have I ever gone skydiving.', 'Adventure', TRUE);
