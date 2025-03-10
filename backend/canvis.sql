ALTER TABLE `users`
CHANGE COLUMN `reset_token` `refresh_token` VARCHAR(64) NULL DEFAULT NULL;

ALTER TABLE users MODIFY COLUMN refresh_token VARCHAR(255);

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
