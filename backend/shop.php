<?php
require_once('restrictions.php'); // Aquest fitxer sol contenir restriccions d'accés
require_once('dbconnect.php');   // Aquest fitxer ha de contenir la connexió a la base de dades ($conn)

header("Content-Type: application/json; charset=UTF-8"); // Important pel format de resposta

// Llistar productes si es proporciona el paràmetre 'all' a la URL
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['all'])) {
    // Obtenir els productes
    $stmt = $conn->prepare("SELECT p.*, pi.image_url FROM products p LEFT JOIN product_images pi ON p.product_id = pi.product_id WHERE p.in_shop = true AND p.stock > 0");
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC); // Obtenim les dades de la consulta

    $grouped_products = [];

    foreach ($products as $product) {
        $product_id = $product['product_id'];

        // Si el producte no existeix en el grup, el creem
        if (!isset($grouped_products[$product_id])) {
            $grouped_products[$product_id] = [
                'product_id' => $product['product_id'],
                'name' => $product['name'],
                'description' => $product['description'],
                'price' => $product['price'],
                'created_at' => $product['created_at'],
                'in_shop' => $product['in_shop'],
                'stock' => $product['stock'],
                'images' => [], // Array per les imatges
                'variations' => [] // Array per les variacions
            ];
        }

        // Afegim la imatge associada al producte, si existeix
        if (isset($product['image_url'])) {
            $grouped_products[$product_id]['images'][] = $product['image_url'];
        }

        // Obtenim les variacions del producte
        $variations_stmt = $conn->prepare("SELECT pv.*, pp.* FROM product_variations pv LEFT JOIN product_properties pp ON pv.variation_id = pp.variation_id WHERE pv.product_id = :product_id AND pv.stock > 0");
        $variations_stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $variations_stmt->execute();
        $variations = $variations_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Afegim les variacions al producte
        $grouped_products[$product_id]['variations'] = $variations;
    }

    // Codifiquem els productes agrupats a format JSON
    echo json_encode(array_values($grouped_products)); // array_values() per retornar un array en comptes d'un objecte
    exit; // Important per finalitzar l'script després de mostrar la resposta
} else {
    // Si no es proporciona el paràmetre 'all', retornem un error o un missatge informatiu
    http_response_code(400); // Bad Request
    echo json_encode(array("message" => "Paràmetre 'all' necessari."));
    exit;
}
?>
