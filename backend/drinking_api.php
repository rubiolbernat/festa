<?php
require_once('dbconnect.php');
require_once('restrictions.php');

// OPTIONS request handler (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Funció per netejar les dades
function sanitize($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

if (isset($_GET['action']) && $_GET['action'] == 'getLastInserted') {
  $sql = "SELECT
              drink_data.*,
              users.name AS user_name,
              users.email AS user_email
          FROM
              drink_data
          INNER JOIN
              users ON drink_data.user_id = users.user_id
          ORDER BY
              drink_data.date DESC
          LIMIT 1";

  $result = $conn->query($sql);

  if ($result->rowCount() > 0) {
    $row = $result->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row);
    exit;
  } else {
    echo json_encode(array("message" => "No records found"));
    exit;
  }
}

// Funció per obtenir les ubicacions anteriors
function getLastLocations($conn, $userId)
{
  error_log("getLastLocations cridada amb user_id: " . $userId);
  if ($userId === null || $userId === 'undefined') {
    http_response_code(400);
    echo json_encode(array("message" => "L'ID d'usuari no és vàlid."));
    error_log("Error: ID d'usuari no vàlid.");
    exit;
  }
  try {
    $stmt = $conn->prepare("
            SELECT location FROM (
                SELECT location, MAX(timestamp) AS max_timestamp
                FROM drink_data
                WHERE user_id = :user_id
                GROUP BY location
                ORDER BY max_timestamp DESC
                LIMIT 10
            ) AS subquery
            ORDER BY subquery.max_timestamp DESC
        ");
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $locations = $stmt->fetchAll(PDO::FETCH_COLUMN);
    error_log("Ubicacions obtingudes: " . json_encode($locations));
    return $locations;
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al obtenir les ubicacions anteriors: " . $e->getMessage()));
    error_log("Error al obtenir les ubicacions anteriors: " . $e->getMessage());
    exit;
  }
}

// Funció per obtenir les begudes anteriors
function getLastDrinks($conn, $userId)
{
  error_log("getLastDrinks cridada amb user_id: " . $userId);
  if ($userId === null || $userId === 'undefined') {
    http_response_code(400);
    echo json_encode(array("message" => "L'ID d'usuari no és vàlid."));
    error_log("Error: ID d'usuari no vàlid.");
    exit;
  }
  try {
    $stmt = $conn->prepare("
            SELECT drink FROM (
                SELECT drink, MAX(timestamp) AS max_timestamp
                FROM drink_data
                WHERE user_id = :user_id
                GROUP BY drink
                ORDER BY max_timestamp DESC
                LIMIT 10
            ) AS subquery
            ORDER BY subquery.max_timestamp DESC
        ");
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $drinks = $stmt->fetchAll(PDO::FETCH_COLUMN);
    error_log("Begudes obtingudes: " . json_encode($drinks));
    return $drinks;
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al obtenir les begudes anteriors: " . $e->getMessage()));
    error_log("Error al obtenir les begudes anteriors: " . $e->getMessage());
    exit;
  }
}

// Peticions GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $action = isset($_GET['action']) ? $_GET['action'] : null;

  switch ($action) {
    case 'getLastLocations':
      $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
      if ($userId === null) {
        http_response_code(400);
        echo json_encode(array("message" => "El paràmetre 'user_id' és necessari per a getLastLocations."));
        error_log("Error: El paràmetre 'user_id' és necessari per a getLastLocations.");
        exit;
      }
      $locations = getLastLocations($conn, $userId);
      echo json_encode($locations);
      break;
    case 'getLastDrinks':
      $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
      if ($userId === null) {
        http_response_code(400);
        echo json_encode(array("message" => "El paràmetre 'user_id' és necessari per a getLastDrinks."));
        error_log("Error: El paràmetre 'user_id' és necessari per a getLastDrinks.");
        exit;
      }
      $drinks = getLastDrinks($conn, $userId);
      echo json_encode($drinks);
      break;
    default:
      http_response_code(400);
      echo json_encode(array("message" => "Acció invàlida."));
      error_log("Error: Acció invàlida.");
      break;
  }
  exit;
}

// Peticions POST (Sense canvis, assumeixo que funcionen correctament)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  error_log("Petició POST rebuda.");
  // Obté les dades del cos de la petició
  $json = file_get_contents('php://input');
  $data = json_decode($json);

  if ($data === null) {
    http_response_code(400);
    echo json_encode(array("message" => "Dades JSON invàlides."));
    error_log("Error: Dades JSON invàlides.");
    exit;
  }

  // Neteja les dades
  $user_id = isset($data->user_id) ? sanitize($data->user_id) : null;
  $date = isset($data->date) ? sanitize($data->date) : null;
  $day_of_week = isset($data->day_of_week) ? sanitize($data->day_of_week) : null;
  $location = isset($data->location) ? sanitize($data->location) : null;
  $latitude = isset($data->latitude) ? sanitize($data->latitude) : null;
  $longitude = isset($data->longitude) ? sanitize($data->longitude) : null;
  $drink = isset($data->drink) ? sanitize($data->drink) : null;
  $quantity = isset($data->quantity) ? sanitize($data->quantity) : null;
  $others = isset($data->others) ? sanitize($data->others) : null;
  $price = isset($data->price) ? sanitize($data->price) : null;

  // Valida les dades i els tipus
  if (!is_numeric($user_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "user_id ha de ser un número."));
    error_log("Error: user_id ha de ser un número.");
    exit;
  }

  if (!is_string($date)) {
    http_response_code(400);
    echo json_encode(array("message" => "date ha de ser una cadena."));
    error_log("Error: date ha de ser una cadena.");
    exit;
  }

  if (!is_numeric($day_of_week)) {
    http_response_code(400);
    echo json_encode(array("message" => "day_of_week ha de ser un número."));
    error_log("Error: day_of_week ha de ser un número.");
    exit;
  }

  if (!is_string($location)) {
    http_response_code(400);
    echo json_encode(array("message" => "location ha de ser una cadena."));
    error_log("Error: location ha de ser una cadena.");
    exit;
  }

  if ($latitude !== null && !is_numeric($latitude)) {
    http_response_code(400);
    echo json_encode(array("message" => "latitude ha de ser un número o null."));
    error_log("Error: latitude ha de ser un número o null.");
    exit;
  }

  if ($longitude !== null && !is_numeric($longitude)) {
    http_response_code(400);
    echo json_encode(array("message" => "longitude ha de ser un número o null."));
    error_log("Error: longitude ha de ser un número o null.");
    exit;
  }

  if (!is_string($drink)) {
    http_response_code(400);
    echo json_encode(array("message" => "drink ha de ser una cadena."));
    error_log("Error: drink ha de ser una cadena.");
    exit;
  }

  if (!is_numeric($quantity)) {
    http_response_code(400);
    echo json_encode(array("message" => "quantity ha de ser un número."));
    error_log("Error: quantity ha de ser un número.");
    exit;
  }

  if (!is_string($others)) {
    http_response_code(400);
    echo json_encode(array("message" => "others ha de ser una cadena."));
    error_log("Error: others ha de ser una cadena.");
    exit;
  }

  if (!is_numeric($price)) {
    http_response_code(400);
    echo json_encode(array("message" => "price ha de ser un número."));
    error_log("Error: price ha de ser un número.");
    exit;
  }


  // Valida que els camps obligatoris estiguin presents
  if ($user_id === null || $date === null || $day_of_week === null || $location === null || $drink === null || $quantity === null || $price === null) {
    http_response_code(400);
    echo json_encode(array("message" => "Tots els camps obligatoris han d'estar presents."));
    error_log("Error: Tots els camps obligatoris han d'estar presents.");
    exit;
  }

  try {
    // Prepara la consulta
    $stmt = $conn->prepare("INSERT INTO drink_data (user_id, date, day_of_week, location, latitude, longitude, drink, quantity, others, price) VALUES (:user_id, :date, :day_of_week, :location, :latitude, :longitude, :drink, :quantity, :others, :price)");

    // Lliga els paràmetres
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':date', $date, PDO::PARAM_STR);
    $stmt->bindParam(':day_of_week', $day_of_week, PDO::PARAM_INT);
    $stmt->bindParam(':location', $location, PDO::PARAM_STR);
    $stmt->bindParam(':latitude', $latitude, $latitude === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindParam(':longitude', $longitude, $longitude === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindParam(':drink', $drink, PDO::PARAM_STR);
    $stmt->bindParam(':quantity', $quantity, PDO::PARAM_STR);
    $stmt->bindParam(':others', $others, PDO::PARAM_STR);
    $stmt->bindParam(':price', $price, PDO::PARAM_STR);

    // Executa la consulta
    if ($stmt->execute()) {
      http_response_code(201); // Created
      echo json_encode(array("message" => "Dades afegides correctament."));
      error_log("Dades afegides correctament.");
    } else {
      http_response_code(500);
      echo json_encode(array("message" => "Error al afegir les dades."));
      error_log("Error al afegir les dades: " . print_r($stmt->errorInfo(), true)); // Registra l'error de la declaració
    }
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al afegir les dades: " . $e->getMessage()));
    error_log("Error al afegir les dades: " . $e->getMessage());
  }
  exit;
}

// Si no es proporciona cap paràmetre vàlid
/*
http_response_code(400);
echo json_encode(array("message" => "Petició invàlida."));
error_log("Petició invàlida.");
exit;*/
?>
