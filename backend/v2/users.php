<?php
require_once('dbconnect.php');
require_once('restrictions.php');
// Funció per netejar les dades
function sanitize($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

// Funció per controlar si la petició és OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = null; // Inicialitza

// --- Gestió de Peticions GET ---
if ($method === 'GET') {
  $action = isset($_GET['action']) ? sanitize($_GET['action']) : null; // Sanitize action

  if (!$action) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'action' requerit per a GET."]);
    exit;
  }

  switch ($action) {
    case 'getFollowers':
      getFollowers($conn, $_GET);
      break;
    case 'getSuggestions':
      getSuggestions($conn, $_GET);
      break;
    default:
      http_response_code(404); // Not Found per acció invàlida
      echo json_encode(["message" => "Acció GET invàlida."]);
      break;
  }
  exit; // Exit general per a GET si les funcions no ho fan
}
// --- Gestió de Peticions POST ---
elseif ($method === 'POST') {
  // Per POST, esperem dades al body (probablement form-urlencoded o multipart)
  // I esperem l'acció també al body per consistència
  if (isset($_POST['action'])) {
    $action = sanitize($_POST['action']);
    $data = $_POST; // Passem tot $_POST a les funcions que ho necessitin

    switch ($action) {
      case 'followUser':
        followUser($conn, $data);
        break;
      case 'unfollowUser':
        unfollowUser($conn, $data);
        break;
      default:
        http_response_code(404);
        echo json_encode(["message" => "Acció POST invàlida."]);
        break;
    }
  } else {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'action' requerit al body per a POST."]);
  }
  exit;
}


function followUser($conn, $data)
{
  if (!isset($data['follower_id']) || !isset($data['followed_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Falten paràmetres requerits."]);
    exit;
  }

  $follower_id = intval($data['follower_id']);
  $followed_id = intval($data['followed_id']);

  if ($follower_id === $followed_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No pots seguir-te a tu mateix."]);
    exit;
  }

  $stmt = $conn->prepare("INSERT IGNORE INTO festa_user_followers (follower_id, followed_id) VALUES (?, ?)");
  $stmt->bind_param("ii", $follower_id, $followed_id);

  if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuari seguit correctament."]);
  } else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en seguir l'usuari."]);
  }
  exit;
}

function unfollowUser($conn, $data)
{
  if (!isset($data['follower_id']) || !isset($data['followed_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Falten paràmetres requerits."]);
    return;
  }

  $follower_id = intval($data['follower_id']);
  $followed_id = intval($data['followed_id']);

  $stmt = $conn->prepare("DELETE FROM festa_user_followers WHERE follower_id = ? AND followed_id = ?");
  $stmt->bind_param("ii", $follower_id, $followed_id);

  if ($stmt->execute()) {
    echo json_encode(["message" => "Usuari deixat de seguir."]);
  } else {
    http_response_code(500);
    echo json_encode(["message" => "Error en deixar de seguir l'usuari."]);
  }
}

function getFollowers($conn, $params)
{
  if (!isset($params['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Falta l'identificador de l'usuari."]);
    return;
  }

  $user_id = intval($params['user_id']);

  $stmt = $conn->prepare("
    SELECT u.user_id, u.name, u.email
    FROM festa_user_followers f
    JOIN festa_users u ON f.follower_id = u.user_id
    WHERE f.followed_id = ?
  ");
  $stmt->bind_param("i", $user_id);
  $stmt->execute();
  $result = $stmt->get_result();

  $followers = [];
  while ($row = $result->fetch_assoc()) {
    $followers[] = $row;
  }

  echo json_encode($followers);
}

function getSuggestions($conn, $params)
{
  if (!isset($params['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Falta l'identificador de l'usuari."]);
    return;
  }

  $user_id = intval($params['user_id']);

  // Suggereix usuaris que segueixen als que tu ja segueixes
  $query = "
    SELECT DISTINCT u.user_id, u.name, u.email
    FROM festa_user_followers f1
    JOIN festa_user_followers f2 ON f1.followed_id = f2.follower_id
    JOIN festa_users u ON f2.followed_id = u.user_id
    WHERE f1.follower_id = ?
      AND f2.followed_id != ?
      AND f2.followed_id NOT IN (
        SELECT followed_id FROM festa_user_followers WHERE follower_id = ?
      )
    LIMIT 10
  ";

  $stmt = $conn->prepare($query);
  $stmt->bind_param("iii", $user_id, $user_id, $user_id);
  $stmt->execute();
  $result = $stmt->get_result();

  $suggestions = [];
  while ($row = $result->fetch_assoc()) {
    $suggestions[] = $row;
  }

  echo json_encode($suggestions);
}
?>
