<?php
require_once('dbconnect.php');
require_once('restrictions.php');
define('STORIES_UPLOAD_DIR',  '../assets/uploads/');
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
        case 'getLastLocations':
            getLastLocationsAction($conn); // Aquesta funció hauria de fer l'echo/exit
            break; // break és bona pràctica tot i l'exit intern
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
            case 'addDrinkData':
                addDrinkData($conn); // Aquesta funció ja llegeix $_POST i $_FILES internament
                break;
            // Pots afegir altres accions POST aquí (vote, unvote, deleteExpired, etc.)
            // assegurant-te que llegeixen de $data si cal
            /*
            case 'voteStory':
                 if (isset($data['user_id'], $data['story_id'])) { ... } else { error 400 }
                 break;
            */
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

// --- Gestió de Peticions PUT ---
elseif ($method === 'PUT') {
     // Per PUT, normalment s'espera un body JSON
     $inputJSON = file_get_contents('php://input');
     $inputData = json_decode($inputJSON, true); // true per array associatiu

     // Comprova si la decodificació ha funcionat i si hi ha 'action'
     if ($inputData && isset($inputData['action'])) {
         $action = sanitize($inputData['action']);
         $data = $inputData; // Passem les dades decodificades

         switch ($action) {
             case 'updateDrinkData':
                 // Passa les dades llegides del JSON
                 updateDrinkData($conn, $data);
                 break;
             // Altres accions PUT si n'hi ha
             default:
                 http_response_code(404);
                 echo json_encode(["message" => "Acció PUT invàlida."]);
                 break;
         }
     } else {
          http_response_code(400);
          error_log("PUT Error: Body JSON invàlid o falta 'action'. Body: " . $inputJSON);
          echo json_encode(["message" => "Body JSON invàlid o falta 'action' per a PUT."]);
     }
     exit;
}

// --- Gestió de Peticions DELETE ---
elseif ($method === 'DELETE') {
    // Per DELETE (segons envia el teu Angular):
    // 1. Llegeix l'acció del paràmetre URL ($_GET)
    $action = isset($_GET['action']) ? sanitize($_GET['action']) : null;

    if ($action === 'deleteDrinkData') {
        // 2. Llegeix el body JSON per obtenir l'ID
        $inputJSON = file_get_contents('php://input');
        $inputData = json_decode($inputJSON, true);

        // 3. Comprova si s'ha pogut decodificar i si conté 'id'
        if ($inputData && isset($inputData['id'])) {
            $idToDelete = $inputData['id']; // L'ID ve del body JSON
            // 4. Crida a la funció passant només l'ID
            deleteDrinkData($conn, $idToDelete); // Usa la funció que espera ID
        } else {
            // Error si el body no és JSON vàlid o no conté 'id'
            http_response_code(400);
            error_log("[Router DELETE] Body invàlid o falta 'id'. Body rebut: " . $inputJSON);
            echo json_encode(["message" => "Body de la petició DELETE invàlid o falta l'ID."]);
        }
    } else {
         http_response_code(400); // O 404 si l'acció no existeix
         echo json_encode(["message" => "Acció DELETE invàlida o no especificada a la URL."]);
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

  // Comprovem si la carpeta existeix, si no, intentem crear-la
  if (!is_dir($target_dir) && !mkdir($target_dir, 0777, true)) {
    http_response_code(500);
    echo json_encode(array("message" => "No s'ha pogut crear la carpeta de destinació per a les imatges."));
    exit;
  }

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
      echo json_encode(array("message" => "Error intern del servidor al processar la imatge."));
      exit;
    }
  }

  // --- Obtenció i Validació de Dades del Formulari ---
  $user_id = isset($_POST['user_id']) ? sanitize($_POST['user_id']) : null;
  $date = isset($_POST['date']) ? sanitize($_POST['date']) : null;
  $location = isset($_POST['location']) ? sanitize($_POST['location']) : null;
  $drink = isset($_POST['drink']) ? sanitize($_POST['drink']) : null;
  $quantity = isset($_POST['quantity']) ? sanitize($_POST['quantity']) : null;
  $price = isset($_POST['price']) ? sanitize($_POST['price']) : null;
  $num_drinks = isset($_POST['num_drinks']) ? sanitize($_POST['num_drinks']) : 1;
  $others = isset($_POST['others']) ? sanitize($_POST['others']) : '';
  $latitude = isset($_POST['latitude']) && is_numeric($_POST['latitude']) ? sanitize($_POST['latitude']) : null;
  $longitude = isset($_POST['longitude']) && is_numeric($_POST['longitude']) ? sanitize($_POST['longitude']) : null;
  $day_of_week = isset($_POST['day_of_week']) ? sanitize($_POST['day_of_week']) : null;

  if (empty($user_id) || empty($date) || $location === null || empty($drink) || $quantity === null || $price === null || $day_of_week === null || $num_drinks === null) {
    if ($imageUploadedSuccessfully && $target_file && file_exists($target_file)) {
      unlink($target_file);
      error_log("Dades invàlides rebudes. Imatge " . $target_file . " eliminada.");
    }
    http_response_code(400);
    echo json_encode(array("message" => "Falten dades obligatòries o alguna dada és invàlida per crear el registre."));
    exit;
  }

  try {
    $conn->beginTransaction();
    $sql_drink = "INSERT INTO drink_data (user_id, date, day_of_week, location, latitude, longitude, drink, quantity, others, price, num_drinks) VALUES (:user_id, :date, :day_of_week, :location, :latitude, :longitude, :drink, :quantity, :others, :price, :num_drinks)";
    $stmt_drink = $conn->prepare($sql_drink);

    $stmt_drink->execute([":user_id" => $user_id, ":date" => $date, ":day_of_week" => $day_of_week, ":location" => $location, ":latitude" => $latitude, ":longitude" => $longitude, ":drink" => $drink, ":quantity" => $quantity, ":price" => $price, ":num_drinks" => $num_drinks, ":others" => $others]);
    $drink_id = $conn->lastInsertId();

    if (!$drink_id) {
      throw new PDOException("No s'ha pogut obtenir l'ID del registre de beguda inserit.");
    }

    if ($image_name !== null) {
      $sql_story = "INSERT INTO drink_stories (user_id, drink_id, image_url) VALUES (:user_id, :drink_id, :image_url)";
      $stmt_story = $conn->prepare($sql_story);
      $stmt_story->execute([":user_id" => $user_id, ":drink_id" => $drink_id, ":image_url" => $image_name]);
    }

    $conn->commit();
    http_response_code(201);
    echo json_encode(["message" => "Registre creat correctament.", "drink_id" => $drink_id, "image_uploaded" => ($image_name !== null)]);

  } catch (PDOException $e) {
    $conn->rollBack();
    if ($imageUploadedSuccessfully && $target_file && file_exists($target_file)) {
      unlink($target_file);
    }
    error_log("Error PDO en addDrinkData: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error intern del servidor al guardar les dades."]);
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

function deleteDrinkData($conn, $id) // <-- Ara rep $id directament
{
    error_log("[deleteDrinkData] Inici amb ID: " . $id);

    // 1. Validar l'ID (ja no cal isset($data['id']))
    // Usem filter_var directament sobre el paràmetre $id
    if (!filter_var($id, FILTER_VALIDATE_INT)) {
         http_response_code(400);
         // No cal sanitize aquí si ja s'ha validat com a INT
         echo json_encode(array("message" => "L'ID proporcionat ($id) no és un número enter vàlid."));
         exit;
    }
    // No cal sanitize si ja hem validat com a INT, PDO s'encarregarà

    $imageUrlToDelete = null;
    $dbDeleted = false;
    $fileDeleted = false;
    $fileDeleteAttempted = false;
    $fileError = null;

    try {
        // --- Pas 1: Obtenir el nom del fitxer ---
        $sql_select_image = "SELECT image_url FROM drink_stories WHERE drink_id = :id";
        $stmt_select = $conn->prepare($sql_select_image);
        $stmt_select->bindParam(':id', $id, PDO::PARAM_INT); // Usa l'ID rebut
        $stmt_select->execute();
        $storyData = $stmt_select->fetch(PDO::FETCH_ASSOC);

        if ($storyData && !empty($storyData['image_url'])) {
            $imageUrlToDelete = $storyData['image_url'];
            error_log("[deleteDrinkData] Story trobada per a drink_id $id. Fitxer a eliminar: " . $imageUrlToDelete);
        } else {
            error_log("[deleteDrinkData] No s'ha trobat story o image_url per a drink_id $id.");
        }

        // --- Pas 2: Eliminar de la BD ---
        $conn->beginTransaction();
        $sql_delete_drink = "DELETE FROM drink_data WHERE id = :id";
        $stmt_delete = $conn->prepare($sql_delete_drink);
        $stmt_delete->bindParam(':id', $id, PDO::PARAM_INT); // Usa l'ID rebut
        $stmt_delete->execute();
        $deletedRowCount = $stmt_delete->rowCount();
        error_log("[deleteDrinkData] Files eliminades de drink_data: " . $deletedRowCount);

        if ($deletedRowCount > 0) {
            $dbDeleted = true;
            $conn->commit();
            error_log("[deleteDrinkData] Commit de la BD realitzat.");
        } else {
            $conn->rollBack();
            error_log("[deleteDrinkData] L'ID $id no existia a drink_data. Rollback realitzat.");
            http_response_code(404);
            echo json_encode(array("message" => "No s'ha trobat cap registre amb l'ID proporcionat."));
            exit;
        }

        // --- Pas 3: Eliminar el fitxer físic ---
        if ($dbDeleted && $imageUrlToDelete) {
            // ... (la lògica per eliminar el fitxer roman igual) ...
            $fileDeleteAttempted = true;
            $filePath = rtrim(STORIES_UPLOAD_DIR, '/') . '/' . $imageUrlToDelete;
            error_log("[deleteDrinkData] Intentant eliminar el fitxer: " . $filePath);
            if (is_file($filePath)) {
                if (unlink($filePath)) {
                    $fileDeleted = true;
                    error_log("[deleteDrinkData] Fitxer eliminat amb èxit: " . $filePath);
                } else {
                    $fileError = "No s'ha pogut eliminar el fitxer (verificar permisos a " . STORIES_UPLOAD_DIR . ")";
                    error_log("[deleteDrinkData] ERROR: " . $fileError . " Fitxer: " . $filePath);
                }
            } else {
                $fileError = "El fitxer no existeix o no és un fitxer.";
                error_log("[deleteDrinkData] AVÍS: " . $fileError . " Fitxer: " . $filePath);
            }
        }

        // --- Pas 4: Enviar Resposta d'Èxit ---
         // ... (la lògica per construir el missatge de resposta roman igual) ...
         http_response_code(200);
         $responseMessage = "Registre eliminat correctament de la base de dades.";
         if($fileDeleteAttempted){ /* ... */ }
         echo json_encode(array(
             "message" => $responseMessage,
             "dbDeleted" => $dbDeleted,
             "fileDeleted" => $fileDeleted,
             "fileError" => $fileError
         ));
         exit;

    } catch (PDOException $e) {
         // ... (la gestió d'errors PDO roman igual) ...
         if ($conn->inTransaction()) { $conn->rollBack(); }
         error_log("[deleteDrinkData] Error PDO: " . $e->getMessage());
         http_response_code(500);
         echo json_encode(array("message" => "Error de base de dades en eliminar el registre: " . $e->getMessage()));
         exit;
    } catch (Exception $e) {
         // ... (la gestió d'errors generals roman igual) ...
         error_log("[deleteDrinkData] ERROR General: " . $e->getMessage());
         http_response_code(500);
         echo json_encode(array("message" => "Error general inesperat durant l'eliminació: " . $e->getMessage()));
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
