<?php
require_once('restrictions.php');
require_once('dbconnect.php');

// Llistar concerts amb paginació (Infinite Scroll)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['limit']) && isset($_GET['offset'])) {
  $limit = intval($_GET['limit']);
  $offset = intval($_GET['offset']);

  $stmt = $conn->prepare("SELECT * FROM concerts WHERE date >= NOW() ORDER BY date ASC LIMIT :limit OFFSET :offset");
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
  exit;
}


// Llistar tots els concerts (sense paginació, només si no s'han passat limit i offset)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['all'])) {
  $stmt = $conn->query("SELECT * FROM concerts WHERE date >= NOW() ORDER BY date ASC");
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
  exit;
}

// Obtenir el concert més proper
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['next'])) {
  $stmt = $conn->prepare("SELECT * FROM concerts WHERE date >= NOW() ORDER BY date ASC LIMIT 1");
  $stmt->execute();
  $concert = $stmt->fetch(PDO::FETCH_ASSOC);

  // Si no hi ha concerts, retorna un objecte buit
  if (!$concert) {
    echo json_encode(["message" => "No hi ha concerts disponibles"]);
  } else {
    echo json_encode($concert);
  }

  exit;
}

// Afegir concert
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  $stmt = $conn->prepare("INSERT INTO concerts (title, description, date, location, tickets_url) VALUES (?, ?, ?, ?, ?)");
  $stmt->execute([$data['title'], $data['description'], $data['date'], $data['location'], $data['tickets_url']]);
  echo json_encode(["message" => "Concert creat"]);
}

// Editar concert
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  $data = json_decode(file_get_contents("php://input"), true);
  $stmt = $conn->prepare("UPDATE concerts SET title=?, description=?, date=?, location=?, tickets_url=? WHERE concert_id=?");
  $stmt->execute([$data['title'], $data['description'], $data['date'], $data['location'], $data['tickets_url'], $data['concert_id']]);
  echo json_encode(["message" => "Concert actualitzat"]);
}

// Esborrar concert
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $data = json_decode(file_get_contents("php://input"), true);
  $stmt = $conn->prepare("DELETE FROM concerts WHERE concert_id=?");
  $stmt->execute([$data['concert_id']]);
  echo json_encode(["message" => "Concert esborrat"]);
}
?>
