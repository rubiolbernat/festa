<?php
require_once('dbconnect.php');
//require_once('restrictions.php');
//header('Content-Type: application/json');

// Funció per netejar les dades
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Funció per obtenir les ubicacions anteriors
function getLastLocations($conn, $userId) {
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
function getLastDrinks($conn, $userId) {
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
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    error_log("Petició GET rebuda. User ID: " . $userId . ". Params: " . json_encode($_GET));

    if ($userId === null) {
        http_response_code(400);
        echo json_encode(array("message" => "El paràmetre 'user_id' és necessari."));
        error_log("Error: El paràmetre 'user_id' és necessari.");
        exit;
    }

    $action = isset($_GET['action']) ? $_GET['action'] : null;

    switch ($action) {
        case 'getLastLocations':
            $locations = getLastLocations($conn, $userId);
            echo json_encode($locations);
            break;
        case 'getLastDrinks':
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

// Peticions POST
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

    // Valida les dades
    if ($user_id === null || $date === null || $day_of_week === null || $location === null || $drink === null || $quantity === null || $price === null) {
        http_response_code(400);
        echo json_encode(array("message" => "Tots els camps obligatoris han d'estar presents."));
        error_log("Error: Tots els camps obligatoris han d'estar presents.");
        exit;
    }

    try {
        // Prepara la consulta
        $stmt = $conn->prepare("INSERT INTO drink_data (user_id, date, day_of_week, location, latitude, longitude, drink, quantity, others, price) VALUES (:user_id, :date, :day_of_week, :location, :latitude, :longitude, :drink, :quantity, others, :price)");

        // Lliga els paràmetres
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':date', $date, PDO::PARAM_STR);
        $stmt->bindParam(':day_of_week', $day_of_week, PDO::PARAM_INT);
        $stmt->bindParam(':location', $location, PDO::PARAM_STR);
        $stmt->bindParam(':latitude', $latitude, PDO::PARAM_STR); // Permet valors NULL
        $stmt->bindParam(':longitude', $longitude, PDO::PARAM_STR); // Permet valors NULL
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
            error_log("Error al afegir les dades.");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error al afegir les dades: " . $e->getMessage()));
        error_log("Error al afegir les dades: " . $e->getMessage());
    }
    exit;
}

// Si no es proporciona cap paràmetre vàlid
http_response_code(400);
echo json_encode(array("message" => "Petició invàlida."));
error_log("Petició invàlida.");
exit;

?>
