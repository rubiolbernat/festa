tinc aquestes taules:
CREATE TABLE `festa_users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `refresh_token` varchar(255) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `drink_data` (
  `id` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `location` varchar(100) NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `drink` varchar(100) NOT NULL,
  `quantity` decimal(5,2) NOT NULL,
  `others` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `num_drinks` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

he fet una app a angular per acomparir amb amics el nostre consum d'alchol, ara vull poder penjar fotos com si fossin stories i vincular-los a algun isert de data beure i mostrar-los com a histories que s'eliminen en 1 setmana pero que els usuaris puguin votar la que no s'elimina aquell mes, en el backend no vull que les eliminis, per a poder fer un wrapped a final d'any




CREATE TABLE `festa_users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `refresh_token` varchar(255) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `drink_data` (
  `id` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `location` varchar(100) NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `drink` varchar(100) NOT NULL,
  `quantity` decimal(5,2) NOT NULL,
  `others` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `num_drinks` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `drink_stories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `drink_id` INT(11) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP DEFAULT NULL,
  `votes` INT(11) DEFAULT 0,
  `is_saved` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `festa_users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`drink_id`) REFERENCES `drink_data`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `drink_story_votes` (
  `user_id` INT(11) NOT NULL,
  `story_id` INT(11) NOT NULL,
  PRIMARY KEY (`user_id`, `story_id`),
  FOREIGN KEY (`user_id`) REFERENCES `festa_users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`story_id`) REFERENCES `drink_stories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SELECT * FROM drink_stories WHERE expires_at > NOW() OR is_saved = 1;

