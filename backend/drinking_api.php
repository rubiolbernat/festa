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
  $action = isset($_GET['action']) ? $_GET['action'] : null;

  switch ($action) {
    case 'getLastLocations':
      getLastLocationsAction($conn);
      break;
    case 'getLastDrinks':
      getLastDrinksAction($conn);
      break;
    case 'getDataByUserId':
      getDataByUserId($conn);
      break;
    case 'getDrinkDataById':
      getDrinkDataById($conn);
      break;
    case 'getLastInserted':
      getLastInserted($conn);
      break;
    case 'getInsertsPaginated':
      getInsertsPaginated($conn);
      break;
    case 'getStatsData':
      getStatsDataAction($conn);
      break;
    default:
      http_response_code(400);
      echo json_encode(array("message" => "Acció GET invàlida."));
      break;
  }
  exit;
}

// Peticions POST, PUT i DELETE
elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $action = isset($_GET['action']) ? $_GET['action'] : null;
  $data = json_decode(file_get_contents("php://input"), true);

  //Si el json es incorrecto, envia un error
  if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(array("message" => "Dades JSON invàlides: " . json_last_error_msg()));
    exit;
  }

  switch ($action) {
    case 'addDrinkData':
      addDrinkData($conn, $data);
      break;
    case 'updateDrinkData':
      updateDrinkData($conn, $data);
      break;
    case 'deleteDrinkData':
      deleteDrinkData($conn, $data);
      break;
    default:
      http_response_code(400);
      echo json_encode(array("message" => "Acció POST/PUT/DELETE invàlida."));
      break;
  }
  exit;
}

//Funcions
function getLastInserted($conn)
{
  $sql = "SELECT
                drink_data.*,
                festa_users.name AS user_name,
                festa_users.email AS user_email
            FROM
                drink_data
            INNER JOIN
                festa_users ON drink_data.user_id = festa_users.user_id
            ORDER BY
                drink_data.date DESC,
                drink_data.timestamp DESC
            LIMIT 1";

  $result = $conn->query($sql);

  if ($result->rowCount() > 0) {
    $row = $result->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row);
  } else {
    echo json_encode(array("message" => "No hi ha registres"));
  }
}

function getDrinkDataById($conn)
{
  if (isset($_GET['id'])) {
    $id = sanitize($_GET['id']);
    $sql = "SELECT * FROM drink_data WHERE id = :id";
    try {
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);
      $stmt->execute();
      $data = $stmt->fetch(PDO::FETCH_ASSOC);
      echo json_encode($data);
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(array("message" => "Error en la consulta: " . $e->getMessage()));
    }
  } else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el paràmetre id."));
  }
}

function getDataByUserId($conn)
{
  if (isset($_GET['user_id'])) {
    $userId = sanitize($_GET['user_id']);
    $sql = "SELECT * FROM drink_data WHERE user_id = :userId";
    try {
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
      $stmt->execute();
      $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
      echo json_encode($data);
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(array("message" => "Error en la consulta: " . $e->getMessage()));
    }
  } else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el paràmetre user_id."));
  }
}

function getLastLocationsAction($conn)
{
  $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
  if ($userId === null) {
    http_response_code(400);
    echo json_encode(array("message" => "El paràmetre 'user_id' és necessari per a getLastLocations."));
    error_log("Error: El paràmetre 'user_id' és necessari per a getLastLocations.");
    exit;
  }
  $locations = getLastLocations($conn, $userId);
  echo json_encode($locations);
}

function getLastDrinksAction($conn)
{
  $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
  if ($userId === null) {
    http_response_code(400);
    echo json_encode(array("message" => "El paràmetre 'user_id' és necessari per a getLastDrinks."));
    error_log("Error: El paràmetre 'user_id' és necessari per a getLastDrinks.");
    exit;
  }
  $drinks = getLastDrinks($conn, $userId);
  echo json_encode($drinks);
}

function addDrinkData($conn, $data)
{
  // Validació bàsica (millorar segons necessitats)
  if (!isset($data['user_id']) || !isset($data['date']) || !isset($data['location']) || !isset($data['drink']) || !isset($data['quantity']) || !isset($data['price'])) {
    http_response_code(400);
    echo json_encode(array("message" => "Falten dades per crear el registre."));
    exit;
  }

  $user_id = sanitize($data['user_id']);
  $date = sanitize($data['date']);
  $location = sanitize($data['location']);
  $drink = sanitize($data['drink']);
  $quantity = sanitize($data['quantity']);
  $price = sanitize($data['price']);
  $num_drinks = sanitize($data['num_drinks']);
  $others = isset($data['others']) ? sanitize($data['others']) : '';
  $latitude = isset($data['latitude']) ? sanitize($data['latitude']) : null;
  $longitude = isset($data['longitude']) ? sanitize($data['longitude']) : null;
  $day_of_week = isset($data['day_of_week']) ? sanitize($data['day_of_week']) : null;


  $sql = "INSERT INTO drink_data (user_id, date, day_of_week, location, latitude, longitude, drink, quantity, others, price, num_drinks) VALUES (:user_id, :date, :day_of_week, :location, :latitude, :longitude, :drink, :quantity, :others, :price, :num_drinks)";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':date', $date);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':drink', $drink);
    $stmt->bindParam(':quantity', $quantity);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':num_drinks', $num_drinks);
    $stmt->bindParam(':others', $others);
    $stmt->bindParam(':latitude', $latitude);
    $stmt->bindParam(':longitude', $longitude);
    $stmt->bindParam(':day_of_week', $day_of_week);
    $stmt->execute();
    echo json_encode(array("message" => "Registro creado correctamente."));
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al crear el registro: " . $e->getMessage()));
  }
}
function updateDrinkData($conn, $data)
{
  error_log("updateDrinkData cridada amb les dades: " . json_encode($data));

  // Validació bàsica (millorar segons necessitats)
  if (!isset($data['id']) || !isset($data['date']) || !isset($data['location']) || !isset($data['drink']) || !isset($data['quantity']) || !isset($data['price'])) {
    http_response_code(400);
    echo json_encode(array("message" => "Falten dades per actualitzar el registre."));
    exit;
  }
  //La comprobación de más arriba, solo verifica que existe, no que contiene datos

  $id = sanitize($data['id']);
  $num_drinks = sanitize($data['num_drinks']);
  $date = sanitize($data['date']);
  $location = sanitize($data['location']);
  $drink = sanitize($data['drink']);
  $quantity = sanitize($data['quantity']);
  $price = sanitize($data['price']);
  $others = isset($data['others']) ? sanitize($data['others']) : '';
  $day_of_week = isset($data['day_of_week']) ? sanitize($data['day_of_week']) : null;
  $latitude = isset($data['latitude']) ? sanitize($data['latitude']) : null;
  $longitude = isset($data['longitude']) ? sanitize($data['longitude']) : null;


  $sql = "UPDATE drink_data SET date = :date, location = :location, drink = :drink, quantity = :quantity, price = :price, others = :others, latitude = :latitude, longitude = :longitude,day_of_week = :day_of_week, num_drinks = :num_drinks WHERE id = :id";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':date', $date);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':drink', $drink);
    $stmt->bindParam(':quantity', $quantity);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':others', $others);
    $stmt->bindParam(':latitude', $latitude);
    $stmt->bindParam(':longitude', $longitude);
    $stmt->bindParam(':day_of_week', $day_of_week);
    $stmt->bindParam(':num_drinks', $num_drinks);
    $stmt->execute();
    error_log("SQL executat: " . $sql); // Registrar la consulta SQL
    echo json_encode(array("message" => "Registro actualizado correctamente."));
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al actualizar el registro: " . $e->getMessage()));
    error_log("Error al actualizar el registro: " . $e->getMessage());
  }
}

function deleteDrinkData($conn, $data)
{
  error_log("deleteDrinkData cridada amb les dades: " . json_encode($data));

  if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(array("message" => "Falta l'ID per eliminar el registre."));
    exit;
  }

  $id = sanitize($data['id']);

  $sql = "DELETE FROM drink_data WHERE id = :id";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    error_log("SQL executat: " . $sql); // Registrar la consulta SQL
    echo json_encode(array("message" => "Registro eliminado correctamente."));
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al eliminar el registro: " . $e->getMessage()));
    error_log("Error al eliminar el registro: " . $e->getMessage());
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

//Funció per obtenir dades paginades.
function getInsertsPaginated($conn)
{
  //Comprovar si limit i offset estan definits i són números
  $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? intval($_GET['limit']) : 10;
  $offset = isset($_GET['offset']) && is_numeric($_GET['offset']) ? intval($_GET['offset']) : 0;

  //Construir la query
  $sql = "SELECT
  drink_data.*,
  festa_users.name AS user_name,
  festa_users.email AS user_email
FROM
  drink_data
INNER JOIN
  festa_users ON drink_data.user_id = festa_users.user_id
ORDER BY
  drink_data.date DESC,
  drink_data.timestamp DESC
LIMIT :limit OFFSET :offset";

  try {
    $stmt = $conn->prepare($sql);
    //Bind els parametres
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    //Retorna les dades
    echo json_encode($data);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error en la consulta: " . $e->getMessage()));
  }
}

// Función para obtener estadísticas generales
function getGeneralStats($conn, $userId)
{
  $sql = "SELECT
                SUM(quantity) AS total_litres,
                SUM(price) AS total_preu,
                COUNT(DISTINCT date) AS dies_beguts,
                SUM(num_drinks) AS begudes_totals
            FROM drink_data
            WHERE user_id = :userId";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getGeneralStats: " . $e->getMessage());
    return array("error" => "Error al obtenir estadístiques generals.");
  }
}


// Función para obtener el día que más has bebido
function getTopDay($conn, $userId)
{
  $sql = "SELECT
                date,
                SUM(quantity) AS quantitat_litres,
                SUM(price) AS preu_total
            FROM drink_data
            WHERE user_id = :userId
            GROUP BY date
            ORDER BY quantitat_litres DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDay: " . $e->getMessage());
    return array("error" => "Error al obtener el día que más has bebido.");
  }
}

// Función para obtener el día que más has gastado
function getTopSpendingDay($conn, $userId)
{
  $sql = "SELECT
                date,
                SUM(price) AS sum_preu,
                SUM(quantity) AS sum_quantitat
            FROM drink_data
            WHERE user_id = :userId
            GROUP BY date
            ORDER BY sum_preu DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopSpendingDay: " . $e->getMessage());
    return array("error" => "Error al obtener el día que más has gastado.");
  }
}

// Función para obtener el lugar donde más has bebido
function getTopLocationByQuantity($conn, $userId)
{
  $sql = "SELECT
                location,
                SUM(quantity) AS sum_quantitat,
                SUM(price) AS sum_preu
            FROM drink_data
            WHERE user_id = :userId
            GROUP BY location
            ORDER BY sum_quantitat DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopLocationByQuantity: " . $e->getMessage());
    return array("error" => "Error al obtener el lugar donde más has bebido.");
  }
}

// Función para obtener el lugar donde más has gastado
function getTopLocationBySpending($conn, $userId)
{
  $sql = "SELECT
                location,
                SUM(price) AS sum_preu,
                SUM(quantity) AS sum_quantitat
            FROM drink_data
            WHERE user_id = :userId
            GROUP BY location
            ORDER BY sum_preu DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopLocationBySpending: " . $e->getMessage());
    return array("error" => "Error al obtener el lugar donde más has gastado.");
  }
}

// Funció per obtenir la beguda que més has consumit en litres
function getTopDrinkByQuantity($conn, $userId)
{
  $sql = "SELECT
                drink,
                SUM(price) AS sum_preu,
                SUM(quantity) AS sum_quantitat
            FROM drink_data
            WHERE user_id = :userId
            GROUP BY drink
            ORDER BY sum_quantitat DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinkByQuantity: " . $e->getMessage());
    return array("error" => "Error al obtener la beguda que més has consumit en litres.");
  }
}

// Funció per obtenir la beguda més cara en mitjana per litre
function getTopDrinkByAveragePrice($conn, $userId)
{
  $sql = "SELECT
    drink,
    SUM(price) / SUM(quantity) AS average_price
FROM
    drink_data
WHERE
    user_id = :userId
GROUP BY
    drink
ORDER BY
    average_price DESC
LIMIT 1";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinkByAveragePrice: " . $e->getMessage());
    return array("error" => "Error al obtener la beguda més cara en mitjana per litre.");
  }
}

// Funció per obtenir les estadístiques per dia de la setmana
function getWeeklyStats($conn, $userId)
{
  $sql = "SELECT
                day_of_week,
                COUNT(DISTINCT  date) AS dies_sortits,
                SUM(num_drinks) AS begudes_preses,
                SUM(quantity) AS total_quantitat,
                AVG(quantity) AS mitjana_quantitat,
                AVG(price) AS mitjana_preu,
                SUM(price) AS total_preu
            FROM drink_data
            WHERE user_id = :userId
            GROUP BY day_of_week
            ORDER BY day_of_week";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getWeeklyStats: " . $e->getMessage());
    return array("error" => "Error al obtener estadísticas per dia de la setmana.");
  }
}

// Funció per obtenir el resum mensual: Quantitat i preu
function getMonthlySummary($conn, $userId)
{
  $sql = "SELECT
    DATE_FORMAT(date, '%Y-%m') AS mes,
    SUM(quantity) AS litres,
    SUM(price) AS preu
FROM
    drink_data
WHERE
    user_id = :userId
GROUP BY
    mes
ORDER BY
    mes";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getMonthlySummary: " . $e->getMessage());
    return array("error" => "Error al obtener el resum mensual: Quantitat i preu.");
  }
}

//Funció per obtenir el mes bevedeor del grup
function getTopDrinker($conn)
{
  $sql = "SELECT
                drink_data.user_id AS user_id,
                festa_users.name AS user_name,
                SUM(quantity) AS litres_totals
            FROM drink_data
            JOIN festa_users ON drink_data.user_id = festa_users.user_id
            GROUP BY drink_data.user_id, festa_users.name
            ORDER BY litres_totals DESC
            LIMIT 10";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinker: " . $e->getMessage());
    return array("error" => "Error al obtener el mes bevedeor del grup.");
  }
}

//Funció que gestiona a getStatsData
function getStatsDataAction($conn)
{
  if (isset($_GET['user_id'])) {
    $userId = sanitize($_GET['user_id']);
    // Obtener datos generales
    $generalStats = getGeneralStats($conn, $userId);
    // Obtener top day
    $topDay = getTopDay($conn, $userId);
    // Obtener top spending day
    $topSpendingDay = getTopSpendingDay($conn, $userId);
    // Obtener top location by quantity
    $topLocationByQuantity = getTopLocationByQuantity($conn, $userId);
    // Obtener top location by spending
    $topLocationBySpending = getTopLocationBySpending($conn, $userId);
    // Obtener top drink by quantity
    $topDrinkByQuantity = getTopDrinkByQuantity($conn, $userId);
    // Obtener top drink by average price
    $topDrinkByAveragePrice = getTopDrinkByAveragePrice($conn, $userId);
    // Obtener estadísticas semanales
    $weeklyStats = getWeeklyStats($conn, $userId);
    // Obtener resumen mensual
    $monthlySummary = getMonthlySummary($conn, $userId);
    // Obtener el mes bevedeor del grup
    $topDrinker = getTopDrinker($conn);

    // Combinar resultados
    $result = array(
      'generalStats' => $generalStats,
      'topDay' => $topDay,
      'topSpendingDay' => $topSpendingDay,
      'topLocationByQuantity' => $topLocationByQuantity,
      'topLocationBySpending' => $topLocationBySpending,
      'topDrinkByQuantity' => $topDrinkByQuantity,
      'topDrinkByAveragePrice' => $topDrinkByAveragePrice,
      'weeklyStats' => $weeklyStats,
      'monthlySummary' => $monthlySummary,
      'topDrinker' => $topDrinker
    );

    echo json_encode($result);
  } else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el paràmetre user_id."));
  }
}
?>
