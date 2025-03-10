<?php
require_once('restrictions.php');
require_once('dbconnect.php');

// Llistar concerts amb paginació (Infinite Scroll)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['user'])) {

  $user_id = $_GET['user']; // Suponent que ja tens una sessió iniciada

  $sql = "SELECT roles.role_name
          FROM user_roles
          JOIN roles ON user_roles.role_id = roles.role_id
          WHERE user_roles.user_id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bindParam(1, $user_id, PDO::PARAM_INT);
  $stmt->execute();
  $stmt->execute();
  $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $role_names = [];
  foreach ($roles as $row) {
    $role_names[] = $row['role_name'];
  }

  echo json_encode($roles);

}

?>
