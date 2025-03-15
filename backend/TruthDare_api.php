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

// Peticions GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $action = $_GET['action'] ?? null;

  switch ($action) {
    case 'getCategories':
      getCategoriesAction($conn);
      break;
    case 'getTruth':
      getTruthAction($conn);
      break;
    case 'getDare':
      getDareAction($conn);
      break;
    default:
      http_response_code(400);
      echo json_encode(["message" => "Acció GET invàlida."]);
      break;
  }
  exit;
}

// Peticions POST, PUT i DELETE
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
  $action = $_GET['action'] ?? null;
  $data = json_decode(file_get_contents("php://input"), true);

  if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["message" => "Dades JSON invàlides: " . json_last_error_msg()]);
    exit;
  }

  switch ($action) {
    case 'addQuestion':
      addQuestion($conn, $data);
      break;
    default:
      http_response_code(400);
      echo json_encode(["message" => "Acció POST/PUT/DELETE invàlida."]);
      break;
  }
  exit;
}

// Funció per afegir una nova pregunta (Truth/Dare)
function addQuestion($conn, $data)
{
  // Validació de dades
  $text = sanitize($data['text'] ?? '');
  $category = sanitize($data['category'] ?? '');
  $tipus = isset($data['tipus']) ? (int) $data['tipus'] : null; // 0 = Dare, 1 = Truth
  $dificultat = isset($data['dificultat']) ? (int) $data['dificultat'] : null;

  if (empty($text) || empty($category) || !in_array($tipus, [0, 1]) || $dificultat === null) {
    http_response_code(400);
    echo json_encode(["message" => "Falten dades obligatòries."]);
    exit;
  }

  try {
    $stmt = $conn->prepare("INSERT INTO truthDare (text, category, tipus, dificultat) VALUES (?, ?, ?, ?)");
    $stmt->execute([$text, $category, $tipus, $dificultat]);

    http_response_code(201); // Created
    echo json_encode(["message" => "Pregunta afegida correctament."]);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error en afegir la pregunta: " . $e->getMessage()]);
  }
}

// Funció per obtenir les categories
function getCategoriesAction($conn)
{
  try {
    $stmt = $conn->prepare("SELECT DISTINCT category FROM truthDare");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($categories);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error al obtenir les categories: " . $e->getMessage()]);
  }
  exit;
}

// Funció per obtenir preguntes de tipus Dare
function getDareAction($conn)
{
  getQuestions($conn, 0);
}

// Funció per obtenir preguntes de tipus Truth
function getTruthAction($conn)
{
  getQuestions($conn, 1);
}

// Funció per obtenir preguntes segons el tipus
function getQuestions($conn, $tipus)
{
  $categories = $_GET['categories'] ?? null;
  $dificultat = $_GET['dificultat'] ?? null;

  if (!$categories || !$dificultat) {
    http_response_code(400);
    echo json_encode(["message" => "Els paràmetres 'categories' i 'dificultat' són necessaris."]);
    exit;
  }

  $categoriesArray = explode(',', $categories);
  try {
    $placeholders = implode(',', array_fill(0, count($categoriesArray), '?'));
    $sql = "SELECT id, text, category, dificultat FROM truthDare WHERE category IN ($placeholders) AND tipus = ? AND dificultat = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([...$categoriesArray, $tipus, $dificultat]);
    $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($preguntas) {
      shuffle($preguntas);
      echo json_encode($preguntas);
    } else {
      http_response_code(404);
      echo json_encode(["message" => "No s'han trobat preguntes pel tipus i dificultat seleccionats."]);
    }
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error al obtenir les preguntes: " . $e->getMessage()]);
  }
  exit;
}

// Si no es proporciona cap paràmetre vàlid
http_response_code(400);
echo json_encode(["message" => "Petició invàlida."]);
exit;
?>
