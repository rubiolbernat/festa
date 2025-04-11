<?php
require_once('credentials.php'); // Assegura't que aquest fitxer defineix DB_USER, DB_PASSWORD, DB_NAME, DB_HOST

$dbuser = defined('DB_USER') ? DB_USER : '';
$dbpassword = defined('DB_PASSWORD') ? DB_PASSWORD : '';
$dbname = defined('DB_NAME') ? DB_NAME : '';
$dbhost = defined('DB_HOST') ? DB_HOST : 'localhost'; // Assegura't que hi ha un valor per defecte

try {
  $conn = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpassword);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  // echo "Connexió exitosa!"; // Elimina això en producció
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(array("message" => "Error de connexió a la base de dades: " . $e->getMessage()));
  exit();
}
?>
