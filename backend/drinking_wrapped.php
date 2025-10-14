<?php
require_once('dbconnect.php');
require_once('restrictions.php');
define('STORIES_UPLOAD_DIR', '../assets/uploads/');

// Funció per netejar les dades
function sanitize($data)
{
  $data = trim($data);
  //$data = stripslashes($data);
  //$data = htmlspecialchars($data);
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
  $userId = isset($_GET['user_id']) ? sanitize($_GET['user_id']) : null;
  $startDate = isset($_GET['start_date']) ? sanitize($_GET['start_date']) : null;
  $endDate = isset($_GET['end_date']) ? sanitize($_GET['end_date']) : null;

  if (!$action) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'action' requerit per a GET."]);
    exit;
  }

  // Validació de user_id per a accions que el requereixen
  // Ara només getStatsDataAction requereix userId si volem les seves estadístiques personals
  if ($action === 'getStatsData' && !$userId) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'user_id' requerit per a getStatsData."]);
    exit;
  }
  // Les accions de grup (getTopDrinker, getTopDrinkerMonth) no requereixen user_id

  switch ($action) {
    case 'getStatsData':
      getStatsDataAction($conn, $userId, $startDate, $endDate);
      break;
    case 'getTopDrinker': // Mantinc aquesta per si es vol cridar individualment
      getTopDrinkerAction($conn, $startDate, $endDate);
      break;
    case 'getTopDrinkerMonth': // Mantinc aquesta per si es vol cridar individualment
      getTopDrinkerMonthAction($conn, $startDate, $endDate);
      break;
    default:
      http_response_code(404); // Not Found per acció invàlida
      echo json_encode(["message" => "Acció GET invàlida."]);
      break;
  }
  exit; // Exit general per a GET si les funcions no ho fan
}

// Funció auxiliar per afegir condicions de data a la SQL
function addDateRangeToSql(&$sql, $startDate, $endDate, $isFirstCondition = true)
{
  $whereClause = '';
  if ($startDate && $endDate) {
    $whereClause = ($isFirstCondition ? 'WHERE' : 'AND') . " date BETWEEN :startDate AND :endDate";
  } elseif ($startDate) {
    $whereClause = ($isFirstCondition ? 'WHERE' : 'AND') . " date >= :startDate";
  } elseif ($endDate) {
    $whereClause = ($isFirstCondition ? 'WHERE' : 'AND') . " date <= :endDate";
  }
  $sql .= " " . $whereClause;
  return !empty($whereClause); // Retorna si s'ha afegit una condició WHERE o AND
}

// Funció per bindar els paràmetres de data
function bindDateParams($stmt, $startDate, $endDate)
{
  if ($startDate) {
    $stmt->bindParam(':startDate', $startDate);
  }
  if ($endDate) {
    $stmt->bindParam(':endDate', $endDate);
  }
}


// Función para obtener estadísticas generales
function getGeneralStats($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                SUM(quantity) AS total_litres,
                SUM(price) AS total_preu,
                COUNT(DISTINCT date) AS dies_beguts,
                SUM(num_drinks) AS begudes_totals
            FROM drink_data
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false); // false perquè ja tenim user_id
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getGeneralStats: " . $e->getMessage());
    return array("error" => "Error al obtener estadístiques generals.");
  }
}


// Función para obtener el día que más has bebido
function getTopDay($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                date,
                SUM(quantity) AS quantitat_litres,
                SUM(price) AS preu_total
            FROM drink_data
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY date
            ORDER BY quantitat_litres DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDay: " . $e->getMessage());
    return array("error" => "Error al obtener el día que más has bebido.");
  }
}

// Función para obtener el día que más has gastado
function getTopSpendingDay($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                date,
                SUM(price) AS sum_preu,
                SUM(quantity) AS sum_quantitat
            FROM drink_data
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY date
            ORDER BY sum_preu DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopSpendingDay: " . $e->getMessage());
    return array("error" => "Error al obtener el día que más has gastado.");
  }
}

// Función para obtener el lugar donde más has bebido
function getTopLocationByQuantity($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                location,
                SUM(quantity) AS sum_quantitat,
                SUM(price) AS sum_preu
            FROM drink_data
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY location
            ORDER BY sum_quantitat DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopLocationByQuantity: " . $e->getMessage());
    return array("error" => "Error al obtener el lugar donde más has bebido.");
  }
}

// Función para obtener el lugar donde más has gastado
function getTopLocationBySpending($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                location,
                SUM(price) AS sum_preu,
                SUM(quantity) AS sum_quantitat
            FROM drink_data
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY location
            ORDER BY sum_preu DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopLocationBySpending: " . $e->getMessage());
    return array("error" => "Error al obtener el lugar donde más has gastado.");
  }
}

// Funció per obtenir la beguda que més has consumit en litres
function getTopDrinkByQuantity($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                drink,
                SUM(price) AS sum_preu,
                SUM(quantity) AS sum_quantitat
            FROM drink_data
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY drink
            ORDER BY sum_quantitat DESC
            LIMIT 1";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinkByQuantity: " . $e->getMessage());
    return array("error" => "Error al obtener la beguda que més has consumit en litres.");
  }
}

// Funció per obtenir la beguda més cara en mitjana per litre
function getTopDrinkByAveragePrice($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                drink,
                SUM(price) / SUM(quantity) AS average_price
            FROM
                drink_data
            WHERE
                user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY
                drink
            ORDER BY
                average_price DESC
            LIMIT 1";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinkByAveragePrice: " . $e->getMessage());
    return array("error" => "Error al obtener la beguda més cara en mitjana per litre.");
  }
}

// Funció per obtenir les estadístiques per dia de la setmana
function getWeeklyStats($conn, $userId, $startDate, $endDate)
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
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY day_of_week
            ORDER BY day_of_week";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getWeeklyStats: " . $e->getMessage());
    return array("error" => "Error al obtener estadísticas per dia de la setmana.");
  }
}

// Funció per obtenir el resum mensual: Quantitat i preu
function getMonthlySummary($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                DATE_FORMAT(date, '%Y-%m') AS mes,
                SUM(quantity) AS litres,
                SUM(price) AS preu
            FROM
                drink_data
            WHERE
                user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY
                mes
            ORDER BY
                mes";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getMonthlySummary: " . $e->getMessage());
    return array("error" => "Error al obtener el resum mensual: Quantitat i preu.");
  }
}

//Funció per obtenir el top bevedor del grup (ara amb rang de dates)
function getTopDrinker($conn, $startDate, $endDate)
{
  $sql = "SELECT
                drink_data.user_id AS user_id,
                festa_users.name AS user_name,
                SUM(quantity) AS litres_totals
            FROM drink_data
            JOIN festa_users ON drink_data.user_id = festa_users.user_id";
  $isFirstCondition = addDateRangeToSql($sql, $startDate, $endDate, true); // true perquè pot ser la primera condició
  $sql .= " GROUP BY drink_data.user_id, festa_users.name
            ORDER BY litres_totals DESC
            LIMIT 10";

  try {
    $stmt = $conn->prepare($sql);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinker: " . $e->getMessage());
    return array("error" => "Error al obtener el top bevedor del grup.");
  }
}

// Funció per obtenir el top bevedor del grup del mes actual (ara amb rang de dates si s'especifica)
function getTopDrinkerMonth($conn, $startDate, $endDate)
{
  $sql = "SELECT
              drink_data.user_id AS user_id,
              festa_users.name AS user_name,
              SUM(quantity) AS litres_totals
            FROM drink_data
            JOIN festa_users ON drink_data.user_id = festa_users.user_id";

  $conditions = [];
  $isFirstCondition = true;

  if ($startDate && $endDate) {
    $conditions[] = "DATE_FORMAT(drink_data.date, '%Y-%m-%d') BETWEEN :startDate AND :endDate";
  } elseif ($startDate) {
    $conditions[] = "DATE_FORMAT(drink_data.date, '%Y-%m-%d') >= :startDate";
  } elseif ($endDate) {
    $conditions[] = "DATE_FORMAT(drink_data.date, '%Y-%m-%d') <= :endDate";
  } else {
    // Si no hi ha dates, agafem el mes actual per defecte
    $conditions[] = "DATE_FORMAT(drink_data.date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')";
  }

  if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
  }

  $sql .= " GROUP BY drink_data.user_id, festa_users.name
            ORDER BY litres_totals DESC
            LIMIT 10";

  try {
    $stmt = $conn->prepare($sql);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinkerMonth: " . $e->getMessage());
    return array("error" => "Error al obtener el top bevedor del grup del mes.");
  }
}


// Nova Funció (per a ús intern de getStatsDataAction): Retorna latitud, longitud, litres i location per a un usuari i rang de dates
function getUserLocationData($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                location,
                latitude,
                longitude,
                SUM(quantity) AS total_litres
            FROM drink_data
            WHERE user_id = :userId AND latitude IS NOT NULL AND latitude != 0.000000 AND longitude IS NOT NULL AND longitude != 0.000000";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY location, latitude, longitude
              ORDER BY total_litres DESC";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getUserLocationData: " . $e->getMessage());
    return ["error" => "Error al obtenir dades de localització."];
  }
}

// Nova Funció (per a ús intern de getStatsDataAction): Retorna les begudes més preses, quantitat en litres i preu
function getMostConsumedDrinks($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT
                drink,
                SUM(quantity) AS total_litres,
                SUM(price) AS total_preu,
                COUNT(drink) AS num_vegades_pres
            FROM drink_data
            WHERE user_id = :userId";
  addDateRangeToSql($sql, $startDate, $endDate, false);
  $sql .= " GROUP BY drink
              ORDER BY total_litres DESC";
  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getMostConsumedDrinks: " . $e->getMessage());
    return ["error" => "Error al obtenir les begudes més consumides."];
  }
}

// Nova Funció (per a ús intern de getStatsDataAction): Per a fer un "wrapped" (resum personalitzat) de l'usuari
function getUserWrappedStats($conn, $userId, $startDate, $endDate)
{
  $response = [];

  // 1. Estadístiques generals
  $response['general'] = getGeneralStats($conn, $userId, $startDate, $endDate);

  // 2. Beguda més consumida
  $response['top_drink_quantity'] = getTopDrinkByQuantity($conn, $userId, $startDate, $endDate);

  // 3. Dia amb més consum
  $response['top_day_quantity'] = getTopDay($conn, $userId, $startDate, $endDate);

  // 4. Dia amb més despesa
  $response['top_day_spending'] = getTopSpendingDay($conn, $userId, $startDate, $endDate);

  // 5. Ubicació més freqüent (per quantitat)
  $response['top_location_quantity'] = getTopLocationByQuantity($conn, $userId, $startDate, $endDate);

  // 6. Beguda amb preu mitjà per litre més alt
  $response['top_drink_avg_price'] = getTopDrinkByAveragePrice($conn, $userId, $startDate, $endDate);

  // 7. Resum de begudes més consumides (top 5)
  $response['most_consumed_drinks_detailed'] = getMostConsumedDrinks($conn, $userId, $startDate, $endDate);

  // 8. Distribució per dies de la setmana
  $response['weekly_breakdown'] = getWeeklyStats($conn, $userId, $startDate, $endDate);

  // 9. Evolució mensual (total litres i preu)
  $response['monthly_trend'] = getMonthlySummary($conn, $userId, $startDate, $endDate);

  return $response;
}

// Nova funció: Obtenir esdeveniments en els quals ha participat un usuari
function getUserEvents($conn, $userId, $startDate, $endDate)
{
  $sql = "SELECT DISTINCT
                de.event_id,
                de.nom,
                de.data_creacio,
                de.data_inici,
                de.data_fi,
                de.opcions
            FROM drink_event de
            JOIN drink_data dd ON dd.event_id = de.event_id
            WHERE dd.user_id = :userId";

  // Afegir rang de dates per a la data de l'esdeveniment
  if ($startDate && $endDate) {
    $sql .= " AND de.data_inici <= :endDate AND de.data_fi >= :startDate";
  } elseif ($startDate) {
    $sql .= " AND de.data_fi >= :startDate";
  } elseif ($endDate) {
    $sql .= " AND de.data_inici <= :endDate";
  }

  $sql .= " ORDER BY de.data_inici DESC";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    bindDateParams($stmt, $startDate, $endDate);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Per a cada esdeveniment, obtenir les dades de consum de l'usuari
    foreach ($results as &$event) {
      $event_id = $event['event_id'];
      $event_sql = "SELECT
                                SUM(quantity) AS litres_consumits_event,
                                SUM(price) AS preu_gastat_event,
                                COUNT(*) AS begudes_registrades_event
                            FROM drink_data
                            WHERE user_id = :userId AND event_id = :event_id";
      $event_stmt = $conn->prepare($event_sql);
      $event_stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
      $event_stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
      $event_stmt->execute();
      $event_data = $event_stmt->fetch(PDO::FETCH_ASSOC);
      $event['user_stats'] = $event_data;
    }

    return $results;
  } catch (PDOException $e) {
    error_log("Error en getUserEvents: " . $e->getMessage());
    return ["error" => "Error al obtenir els esdeveniments de l'usuari."];
  }
}


/**
 * Funció que retorna la posició d'un usuari dins del rànquing de bevedors
 * i el total d'usuaris en el rànquing.
 *
 * @param PDO $conn La connexió a la base de dades.
 * @param int $userId L'ID de l'usuari a buscar.
 * @param string|null $startDate Data d'inici per al filtre (YYYY-MM-DD).
 * @param string|null $endDate Data de fi per al filtre (YYYY-MM-DD).
 * @return array Un array associatiu amb 'rank' i 'total_users' o un missatge d'error.
 */
function getUserDrinkerRank($conn, $userId, $startDate = null, $endDate = null)
{
  try {
    // 1. Obtindre tots els usuaris amb el seu total de litres consumits
    $sqlRank = "SELECT
                        user_id,
                        SUM(quantity) AS litres_totals
                    FROM drink_data";

    // Afegir condicions de data
    $isFirstCondition = true;
    if ($startDate || $endDate) {
      addDateRangeToSql($sqlRank, $startDate, $endDate, $isFirstCondition);
    }

    $sqlRank .= " GROUP BY user_id
                      ORDER BY litres_totals DESC";

    $stmtRank = $conn->prepare($sqlRank);
    bindDateParams($stmtRank, $startDate, $endDate);
    $stmtRank->execute();
    $rankings = $stmtRank->fetchAll(PDO::FETCH_ASSOC);

    $userRank = null;
    $totalUsers = count($rankings);

    // 2. Trobar la posició de l'usuari en el rànquing
    foreach ($rankings as $index => $row) {
      if ((int) $row['user_id'] === (int) $userId) {
        $userRank = $index + 1; // La posició comença des d'1
        break;
      }
    }

    return [
      'rank' => $userRank,
      'total_users' => $totalUsers
    ];

  } catch (PDOException $e) {
    error_log("Error en getUserDrinkerRank: " . $e->getMessage());
    return ["error" => "Error al obtenir el rànquing de l'usuari."];
  }
}


//Funció que gestiona a getStatsData
function getStatsDataAction($conn, $userId, $startDate, $endDate)
{
  // Obtener datos generales
  $generalStats = getGeneralStats($conn, $userId, $startDate, $endDate);
  // Obtener top day
  $topDay = getTopDay($conn, $userId, $startDate, $endDate);
  // Obtener top spending day
  $topSpendingDay = getTopSpendingDay($conn, $userId, $startDate, $endDate);
  // Obtener top location by quantity
  $topLocationByQuantity = getTopLocationByQuantity($conn, $userId, $startDate, $endDate);
  // Obtener top location by spending
  $topLocationBySpending = getTopLocationBySpending($conn, $userId, $startDate, $endDate);
  // Obtener top drink by quantity
  $topDrinkByQuantity = getTopDrinkByQuantity($conn, $userId, $startDate, $endDate);
  // Obtener top drink by average price
  $topDrinkByAveragePrice = getTopDrinkByAveragePrice($conn, $userId, $startDate, $endDate);
  // Obtener estadísticas semanales
  $weeklyStats = getWeeklyStats($conn, $userId, $startDate, $endDate);
  // Obtener resumen mensual
  $monthlySummary = getMonthlySummary($conn, $userId, $startDate, $endDate);

  // ********* Noves estadístiques integrades (per a l'usuari actual) *********
  $userLocationData = getUserLocationData($conn, $userId, $startDate, $endDate);
  $mostConsumedDrinks = getMostConsumedDrinks($conn, $userId, $startDate, $endDate);
  $userWrappedStats = getUserWrappedStats($conn, $userId, $startDate, $endDate); // Totes les estadístiques "wrapped"

  // ********* Dades d'esdeveniments *********
  $userEvents = getUserEvents($conn, $userId, $startDate, $endDate);

  // ********* Nova estadística: Rànquing de l'usuari *********
  $userDrinkerRank = getUserDrinkerRank($conn, $userId, $startDate, $endDate);


  // ********* Estadístiques de grup (per a tothom, sense user_id específic) *********
  //$topDrinker = getTopDrinker($conn, $startDate, $endDate);
  // $topDrinkerMonth = getTopDrinkerMonth($conn, $startDate, $endDate);


  // Combinar resultados
  $result = array(
    'user_id' => $userId,
    'date_range' => [
      'start_date' => $startDate,
      'end_date' => $endDate
    ],
    'generalStats' => $generalStats,
    'topDay' => $topDay,
    'topSpendingDay' => $topSpendingDay,
    'topLocationByQuantity' => $topLocationByQuantity,
    'topLocationBySpending' => $topLocationBySpending,
    'topDrinkByQuantity' => $topDrinkByQuantity,
    'topDrinkByAveragePrice' => $topDrinkByAveragePrice,
    'weeklyStats' => $weeklyStats,
    'monthlySummary' => $monthlySummary,
    // Noves dades integrades
    'userLocationData' => $userLocationData,
    'mostConsumedDrinks' => $mostConsumedDrinks,
    'userWrappedStats' => $userWrappedStats, // Totes les dades "wrapped" en un sol objecte
    'userEvents' => $userEvents, // Dades d'esdeveniments
    'userDrinkerRank' => $userDrinkerRank, // Nou: Posició de l'usuari en el rànquing
    // Estadístiques de grup
    //'groupStats' => [
    //    'topDrinkerOverall' => $topDrinker,
    //    'topDrinkerThisMonth' => $topDrinkerMonth
    //]
  );

  echo json_encode($result);
}

// Accions per a les funcions de grup, per si es volen cridar individualment.
// Si no es volen cridar individualment, es poden eliminar aquestes funcions d'acció.
function getTopDrinkerAction($conn, $startDate, $endDate)
{
  $data = getTopDrinker($conn, $startDate, $endDate);
  echo json_encode($data);
}

function getTopDrinkerMonthAction($conn, $startDate, $endDate)
{
  $data = getTopDrinkerMonth($conn, $startDate, $endDate);
  echo json_encode($data);
}
?>