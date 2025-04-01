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
    case 'getStoriesByUser':
      getStoriesByUserAction($conn);
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

  switch ($action) {
    case 'addDrinkData':
      addDrinkData($conn);
      break;
    case 'updateDrinkData':
      updateDrinkData($conn, $_POST);
      break;
    case 'deleteDrinkData':
      deleteDrinkData($conn, $_POST);
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
    // Query SQL sense comentaris interns
    $sql = "SELECT
                dd.id, dd.user_id, dd.date, dd.day_of_week, dd.location, dd.latitude, dd.longitude,
                dd.drink, dd.quantity, dd.others, dd.price, dd.num_drinks, dd.timestamp,
                fu.name AS user_name,
                fu.email AS user_email,
                MAX(ds.id) AS story_id,
                MAX(ds.image_url) AS image_url,
                MAX(ds.uploaded_at) AS uploaded_at,
                MAX(ds.expires_at) AS expires_at,
                MAX(ds.votes) AS votes,
                MAX(ds.is_saved) AS is_saved
            FROM
                drink_data dd
            INNER JOIN
                festa_users fu ON dd.user_id = fu.user_id
            LEFT JOIN
                drink_stories ds ON dd.id = ds.drink_id
            GROUP BY
                dd.id,
                dd.user_id, dd.date, dd.day_of_week, dd.location, dd.latitude, dd.longitude,
                dd.drink, dd.quantity, dd.others, dd.price, dd.num_drinks, dd.timestamp,
                fu.name, fu.email
            ORDER BY
                dd.date DESC,
                dd.timestamp DESC
            LIMIT 1";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            header('Content-Type: application/json');
            echo json_encode($row);
        } else {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(array("message" => "No s'ha trobat cap registre de consum."));
        }

    } catch (PDOException $e) {
        http_response_code(500);
        // Log detallat de l'error per al servidor
        error_log("Error PDO en getLastInserted: " . $e->getMessage() . " | SQL: " . $sql);
        header('Content-Type: application/json');
        // Missatge genèric per al client
        echo json_encode(array("message" => "Error intern del servidor al consultar les dades."));
    }
}


function getDrinkDataById($conn)
{
  if (isset($_GET['id'])) {
    $id = sanitize($_GET['id']);
    $sql = "SELECT
                    drink_data.*,
                    drink_stories.image_url
                FROM drink_data
                LEFT JOIN
                    drink_stories ON drink_data.id = drink_stories.drink_id
                WHERE drink_data.id = :id";
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
    $sql = "SELECT
                    drink_data.*,
                    drink_stories.image_url
                FROM drink_data
                LEFT JOIN
                    drink_stories ON drink_data.id = drink_stories.drink_id
                WHERE drink_data.user_id = :userId";
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

function addDrinkData($conn)
{
  // --- Gestió de la Imatge (igual que abans) ---
  $target_dir = "../assets/uploads/"; // Assegura't que aquesta carpeta existeix i té permisos d'escriptura
  $image_name = null; // Inicialitza a null per defecte
  $target_file = null;
  $imageUploadedSuccessfully = false; // Flag per saber si hem mogut l'arxiu

  if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0 && $_FILES["image"]["size"] > 0) {
    // Nom de fitxer original
    $original_filename = basename($_FILES["image"]["name"]);
    // Nom únic per evitar col·lisions
    $image_name = uniqid('img_', true) . "_" . preg_replace("/[^a-zA-Z0-9\.\_\-]/", "_", $original_filename); // Nom més segur
    $target_file = $target_dir . $image_name;
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    // Validació de la imatge (mida, tipus, si és imatge real)
    $check = @getimagesize($_FILES["image"]["tmp_name"]); // Usa @ per suprimir warnings si no és imatge
    if ($check === false) {
      http_response_code(400);
      echo json_encode(array("message" => "El fitxer proporcionat no sembla ser una imatge vàlida."));
      exit;
    }

    if ($_FILES["image"]["size"] > 5000000) { // 5MB Limit
      http_response_code(400);
      echo json_encode(array("message" => "La imatge supera el límit de 5MB."));
      exit;
    }

    $allowed_types = array("jpg", "png", "jpeg", "gif");
    if (!in_array($imageFileType, $allowed_types)) {
      http_response_code(400);
      echo json_encode(array("message" => "Format d'imatge no permès. Només JPG, JPEG, PNG, GIF."));
      exit;
    }

    // Intentem moure el fitxer pujat
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
      $imageUploadedSuccessfully = true; // Marquem que s'ha mogut correctament
      error_log("Imatge pujada amb èxit a: " . $target_file); // Log per debugging
    } else {
      // Si falla el move_uploaded_file, no continuem amb la BD
      error_log("Error crític: No s'ha pogut moure el fitxer pujat a " . $target_file); // Log més detallat
      http_response_code(500);
      // Podria ser un problema de permisos a la carpeta $target_dir
      echo json_encode(array("message" => "Error intern del servidor al processar la imatge."));
      exit;
    }
  } else {
    error_log("No s'ha rebut cap imatge o hi ha hagut un error en la pujada inicial. Codi Error: " . ($_FILES["image"]["error"] ?? 'N/A'));
    // Si no hi ha imatge, $image_name es manté null
  }

  // --- Obtenció i Validació de Dades del Formulari ---
  // (Asegura't que sanitize() existeix i funciona com esperes)
  $user_id = isset($_POST['user_id']) ? sanitize($_POST['user_id']) : null;
  $date = isset($_POST['date']) ? sanitize($_POST['date']) : null;
  $location = isset($_POST['location']) ? sanitize($_POST['location']) : null;
  $drink = isset($_POST['drink']) ? sanitize($_POST['drink']) : null;
  $quantity = isset($_POST['quantity']) ? sanitize($_POST['quantity']) : null;
  $price = isset($_POST['price']) ? sanitize($_POST['price']) : null;
  $num_drinks = isset($_POST['num_drinks']) ? sanitize($_POST['num_drinks']) : 1; // Valor per defecte si no ve
  $others = isset($_POST['others']) ? sanitize($_POST['others']) : '';
  $latitude = isset($_POST['latitude']) && is_numeric($_POST['latitude']) ? sanitize($_POST['latitude']) : null; // Validació numèrica bàsica
  $longitude = isset($_POST['longitude']) && is_numeric($_POST['longitude']) ? sanitize($_POST['longitude']) : null; // Validació numèrica bàsica
  $day_of_week = isset($_POST['day_of_week']) ? sanitize($_POST['day_of_week']) : null;

  // Validació més estricta de dades obligatòries
  if (empty($user_id) || empty($date) || $location === null || empty($drink) || $quantity === null || $price === null || $day_of_week === null || $num_drinks === null) {
    // Si hem mogut una imatge però les dades són invàlides, l'eliminem
    if ($imageUploadedSuccessfully && $target_file && file_exists($target_file)) {
      unlink($target_file);
      error_log("Dades invàlides rebudes. Imatge " . $target_file . " eliminada.");
    }
    http_response_code(400);
    // Sigues més específic sobre quina dada falta si és possible
    echo json_encode(array("message" => "Falten dades obligatòries o alguna dada és invàlida per crear el registre."));
    exit;
  }

  // --- Operacions de Base de Dades amb Transacció ---
  try {
    // Iniciem la transacció
    $conn->beginTransaction();

    // 1. Insert a drink_data (sempre es fa)
    $sql_drink = "INSERT INTO drink_data
                        (user_id, date, day_of_week, location, latitude, longitude, drink, quantity, others, price, num_drinks)
                      VALUES
                        (:user_id, :date, :day_of_week, :location, :latitude, :longitude, :drink, :quantity, :others, :price, :num_drinks)";

    $stmt_drink = $conn->prepare($sql_drink);

    $stmt_drink->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt_drink->bindParam(':date', $date); // PDO::PARAM_STR per defecte
    $stmt_drink->bindParam(':day_of_week', $day_of_week, PDO::PARAM_INT);
    $stmt_drink->bindParam(':location', $location);
    $stmt_drink->bindParam(':latitude', $latitude); // PDO gestionarà NULL si $latitude és null
    $stmt_drink->bindParam(':longitude', $longitude); // PDO gestionarà NULL si $longitude és null
    $stmt_drink->bindParam(':drink', $drink);
    $stmt_drink->bindParam(':quantity', $quantity);
    $stmt_drink->bindParam(':price', $price);
    $stmt_drink->bindParam(':num_drinks', $num_drinks, PDO::PARAM_INT);
    $stmt_drink->bindParam(':others', $others);

    $stmt_drink->execute();

    // Obtenim l'ID de l'últim registre inserit a drink_data
    $drink_id = $conn->lastInsertId();

    // Verifiquem si l'ID és vàlid (hauria de ser major que 0)
    if (!$drink_id) {
      throw new PDOException("No s'ha pogut obtenir l'ID del registre de beguda inserit.");
    }

    // 2. Insert a drink_stories (NOMÉS si s'ha pujat una imatge)
    if ($image_name !== null) {
      $sql_story = "INSERT INTO drink_stories
                            (user_id, drink_id, image_url)
                          VALUES
                            (:user_id, :drink_id, :image_url)";

      $stmt_story = $conn->prepare($sql_story);
      $stmt_story->bindParam(':user_id', $user_id, PDO::PARAM_INT);
      $stmt_story->bindParam(':drink_id', $drink_id, PDO::PARAM_INT);
      $stmt_story->bindParam(':image_url', $image_name); // Guardem només el nom del fitxer

      $stmt_story->execute();
    }

    // Si hem arribat aquí sense errors, confirmem la transacció
    $conn->commit();

    // Enviem resposta d'èxit
    http_response_code(201); // 201 Created és més apropiat per a un POST exitós
    echo json_encode(array(
      "message" => "Registre creat correctament.",
      "drink_id" => $drink_id, // Pot ser útil retornar l'ID creat
      "image_uploaded" => ($image_name !== null) // Indica si es va incloure imatge
    ));

  } catch (PDOException $e) {
    // Si hi ha qualsevol error durant la transacció, desfem els canvis
    $conn->rollBack();

    // Si l'error ha ocorregut DESPRÉS d'haver mogut la imatge, l'eliminem
    if ($imageUploadedSuccessfully && $target_file && file_exists($target_file)) {
      unlink($target_file);
      error_log("Error durant la transacció de BD. Imatge " . $target_file . " eliminada.");
    }

    // Log detallat de l'error de BD
    error_log("Error PDO en addDrinkData: " . $e->getMessage());

    // Enviem resposta d'error genèrica
    http_response_code(500);
    echo json_encode(array("message" => "Error intern del servidor al guardar les dades. Si us plau, intenta-ho més tard."));
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
  // Comprovar si limit i offset estan definits i són números
  $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? intval($_GET['limit']) : 10;
  $offset = isset($_GET['offset']) && is_numeric($_GET['offset']) ? intval($_GET['offset']) : 0;

  // Construir la query
  // Seleccionem explícitament les columnes de drink_data i festa_users
  // Apliquem funcions d'agregació a TOTES les columnes de drink_stories que volem
  $sql = "SELECT
                dd.id, dd.user_id, dd.date, dd.day_of_week, dd.location, dd.latitude, dd.longitude,
                dd.drink, dd.quantity, dd.others, dd.price, dd.num_drinks, dd.timestamp, -- Columnes de drink_data (alias dd)
                fu.name AS user_name,
                fu.email AS user_email, -- Columnes de festa_users (alias fu)
                MAX(ds.id) AS story_id,                 -- ID de la story (prenem el màxim si hi ha duplicats)
                MAX(ds.image_url) AS image_url,         -- URL de la imatge (prenem el màxim)
                MAX(ds.uploaded_at) AS uploaded_at,     -- Data de pujada (prenem la més recent)
                MAX(ds.expires_at) AS expires_at,       -- Data d'expiració (prenem la màxima)
                MAX(ds.votes) AS votes,                 -- Vots (prenem el màxim)
                MAX(ds.is_saved) AS is_saved            -- Estat 'guardat' (prenem el màxim, on 1 > 0)
            FROM
                drink_data dd
            INNER JOIN
                festa_users fu ON dd.user_id = fu.user_id
            LEFT JOIN
                drink_stories ds ON dd.id = ds.drink_id
            GROUP BY
                dd.id, -- Agrupació principal per evitar duplicats de drink_data
                -- Incloure totes les columnes de dd i fu al GROUP BY
                dd.user_id, dd.date, dd.day_of_week, dd.location, dd.latitude, dd.longitude,
                dd.drink, dd.quantity, dd.others, dd.price, dd.num_drinks, dd.timestamp,
                fu.name, fu.email
            ORDER BY
                dd.date DESC,             -- Ordena primer per data
                dd.timestamp DESC         -- Després per marca de temps
            LIMIT :limit OFFSET :offset"; // Aplica paginació

  try {
    $stmt = $conn->prepare($sql);
    // Bind els paràmetres de paginació
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    // Obtenim totes les files resultants
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retornem les dades en format JSON
    header('Content-Type: application/json'); // Bona pràctica: indicar el tipus de contingut
    echo json_encode($data);

  } catch (PDOException $e) {
    // En cas d'error de base de dades
    http_response_code(500); // Error intern del servidor
    error_log("Error PDO en getInsertsPaginated: " . $e->getMessage()); // Log de l'error real
    echo json_encode(array("message" => "Error en obtenir les dades: " . $e->getMessage())); // Missatge per al client
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
    return array("error" => "Error al obtener estadístiques generals.");
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

function getTopDrinkerMonth($conn)
{
  $sql = "SELECT
              drink_data.user_id AS user_id,
              festa_users.name AS user_name,
              SUM(quantity) AS litres_totals
            FROM drink_data
            JOIN festa_users ON drink_data.user_id = festa_users.user_id
            WHERE DATE_FORMAT(drink_data.date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
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
    $topDrinkerMonth = getTopDrinkerMonth($conn);

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
      'topDrinker' => $topDrinker,
      'topDrinkerMonth' => $topDrinkerMonth
    );

    echo json_encode($result);
  } else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el paràmetre user_id."));
  }
}

// Función para obtener las stories agrupadas por usuario
function getStoriesByUserAction($conn)
{
  if (isset($_GET['user_id'])) {
    $userId = sanitize($_GET['user_id']);
    getStoriesByUser($conn, $userId);
  } else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el paràmetre user_id."));
  }
}

function getStoriesByUser($conn, $userId)
{
  $sql = "SELECT
                drink_stories.image_url,
                drink_stories.uploaded_at,
                drink_data.drink AS drink_name,  -- Añadir el nombre de la bebida
                drink_data.location AS location_name   -- Añadir el nombre del lugar
            FROM
                drink_stories
            INNER JOIN
                drink_data ON drink_stories.drink_id = drink_data.id  -- Unir con drink_data
            WHERE
                drink_stories.user_id = :userId
            ORDER BY
                drink_stories.uploaded_at DESC";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al obtener las stories: " . $e->getMessage()));
  }
}

?>
