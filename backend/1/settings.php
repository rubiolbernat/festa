<?php
require_once('restrictions.php');
require_once('dbconnect.php');

// Llistar concerts amb paginació (Infinite Scroll)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['home_page_carroussel'])) {

  $stmt = $conn->prepare("SELECT * FROM settings WHERE key_name = 'home_page_carroussel'");
  $stmt->execute();

  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
  exit;
}

?>
