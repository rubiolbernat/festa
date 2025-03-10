<?php
require_once('restrictions.php'); // Inclou les restriccions (si en tens)
require_once('dbconnect.php');   // Inclou la connexió a la base de dades

header("Content-Type: application/json; charset=UTF-8"); // Important: format de resposta

// Endpoint per obtenir les categories
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['categories'])) {
    try {
        $stmt = $conn->prepare("SELECT DISTINCT category FROM questions_data");
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_COLUMN); // Retorna només la columna de categories

        echo json_encode($categories);
    } catch(PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("message" => "Error al obtenir les categories: " . $e->getMessage()));
    }
    exit;
}

// Endpoint per obtenir totes les preguntes per a les categories seleccionades
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['preguntas'])) {
    $categories = isset($_GET['categorias']) ? $_GET['categorias'] : null;

    if ($categories === null) {
        http_response_code(400); // Bad Request
        echo json_encode(array("message" => "El paràmetre 'categorias' és necessari."));
        exit;
    }

    // Convertir la cadena de categorías en un array
    $categoriesArray = explode(',', $categories);

    try {
        // Construir la consulta SQL dinámicamente
        $placeholders = str_repeat('?,', count($categoriesArray) - 1) . '?';  // Genera placeholders: ?,?,?
        $sql = "SELECT id, question, category FROM questions_data WHERE category IN ($placeholders) AND is_approved = TRUE";

        $stmt = $conn->prepare($sql);
        $stmt->execute($categoriesArray);  // Pasar el array de categorías

        $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($preguntas) {
            // Mezclar el array de preguntas para que estén en orden aleatorio
            shuffle($preguntas);
            echo json_encode($preguntas);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(array("message" => "No s'han trobat preguntes per a les categories seleccionades."));
        }
    } catch(PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("message" => "Error al obtenir les preguntes: " . $e->getMessage()));
    }
    exit;
}

// Si no es proporciona cap paràmetre vàlid
http_response_code(400); // Bad Request
echo json_encode(array("message" => "Petició invàlida."));
exit;
?>
