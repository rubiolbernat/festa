<?php
// --- Includes Necessaris ---
require_once('dbconnect.php'); // Connexió a la base de dades
require_once('restrictions.php'); // Gestió CORS

// --- Funció de Neteja (Sanitize) ---
function sanitize($data) {
    return $data !== null ? htmlspecialchars(stripslashes(trim($data))) : null;
}

// --- Gestió de Peticions OPTIONS (Preflight CORS) ---
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- Router Principal ---
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? sanitize($_GET['action']) : null;

// --- Gestió de Peticions GET ---
if ($method === 'GET') {
    switch ($action) {
        case 'getUsersWithActiveStories':
            getUsersWithActiveStoriesAction($conn);
            break;
        case 'getStoryDetailsForUser':
            if (!isset($_GET['user_id'])) {
                http_response_code(400);
                echo json_encode(["message" => "Paràmetre 'user_id' requerit."]);
                exit;
            }
            getStoryDetailsForUserAction($conn, sanitize($_GET['user_id']));
            break;
        default:
            http_response_code(404);
            echo json_encode(["message" => "Acció GET invàlida."]);
            exit;
    }
}

// --- Gestió de Peticions POST ---
elseif ($method === 'POST') {
    switch ($action) {
        case 'voteStory':
            if (!isset($_POST['user_id']) || !isset($_POST['story_id'])) {
                http_response_code(400);
                echo json_encode(["message" => "Paràmetres 'user_id' i 'story_id' requerits."]);
                exit;
            }
            voteStoryAction($conn, sanitize($_POST['user_id']), sanitize($_POST['story_id']));
            break;
        default:
            http_response_code(404);
            echo json_encode(["message" => "Acció POST invàlida."]);
            exit;
    }
}

// --- Mètode HTTP No Permès ---
else {
    http_response_code(405);
    echo json_encode(["message" => "Mètode HTTP no suportat."]);
    exit;
}

// --- FUNCIONS D'ACCIÓ ---

function getUsersWithActiveStoriesAction($conn) {
  $sql = "SELECT
              u.user_id AS userId,
              u.name AS userName,
              ds.id AS storyId,
              ds.image_url AS imageUrl,
              ds.uploaded_at AS uploadedAt,
              ds.expires_at AS expiresAt,
              ds.votes,
              ds.is_saved,
              dd.id AS drinkId,
              dd.date AS drinkDate,
              dd.location AS drinkLocation,
              dd.drink AS drinkName,
              dd.quantity AS drinkQuantity,
              dd.price AS drinkPrice,
              dd.num_drinks AS drinkCount
          FROM festa_users u
          JOIN drink_stories ds ON u.user_id = ds.user_id
          JOIN drink_data dd ON ds.drink_id = dd.id
          ORDER BY ds.uploaded_at DESC";

  try {
      $stmt = $conn->prepare($sql);
      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // Agrupar les stories per usuari
      $groupedStories = [];
      foreach ($results as $story) {
          $userId = $story['userId'];

          if (!isset($groupedStories[$userId])) {
              $groupedStories[$userId] = [
                  "userId" => $story['userId'],
                  "userName" => $story['userName'],
                  "stories" => []
              ];
          }

          // Afegim la story dins de l'array de stories de l'usuari
          $groupedStories[$userId]["stories"][] = [
              "storyId" => $story['storyId'],
              "imageUrl" => $story['imageUrl'],
              "uploadedAt" => $story['uploadedAt'],
              "expiresAt" => $story['expiresAt'],
              "votes" => $story['votes'],
              "isSaved" => (bool)$story['is_saved'],
              "hasBeenSeen" => false, // Inicialment com a no vista
              "drink" => [
                  "drinkId" => $story['drinkId'],
                  "date" => $story['drinkDate'],
                  "location" => $story['drinkLocation'],
                  "name" => $story['drinkName'],
                  "quantity" => $story['drinkQuantity'],
                  "price" => $story['drinkPrice'],
                  "count" => $story['drinkCount']
              ]
          ];
      }

      // Convertim l'array associatiu en una llista ordenada
      $response = array_values($groupedStories);

      http_response_code(200);
      echo json_encode($response);
      exit;
  } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(["message" => "Error obtenint usuaris amb stories.", "error" => $e->getMessage()]);
      exit;
  }
}


function getStoryDetailsForUserAction($conn, $userId) {
    if (!filter_var($userId, FILTER_VALIDATE_INT)) {
        http_response_code(400);
        echo json_encode(["message" => "ID d'usuari invàlid."]);
        exit;
    }

    $sql = "SELECT ds.id AS storyId, ds.image_url AS slideUrl, ds.uploaded_at AS uploadedAt
            FROM drink_stories ds
            WHERE ds.user_id = :userId AND ds.expires_at > NOW()
            ORDER BY ds.uploaded_at ASC";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $slides = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($slides);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error obtenint detalls de stories.", "error" => $e->getMessage()]);
        exit;
    }
}

/**
 * Permet votar una història (incrementa el recompte de vots si l'usuari encara no ha votat).
 */
function voteStoryAction($conn, $userId, $storyId) {
  if (!filter_var($userId, FILTER_VALIDATE_INT) || !filter_var($storyId, FILTER_VALIDATE_INT)) {
      http_response_code(400);
      echo json_encode(["message" => "Paràmetres invàlids."]);
      exit;
  }

  try {
      // Comprovar si l'usuari ja ha votat aquesta història
      $checkVoteSQL = "SELECT COUNT(*) FROM drink_story_votes WHERE user_id = :userId AND story_id = :storyId";
      $stmt = $conn->prepare($checkVoteSQL);
      $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
      $stmt->bindParam(':storyId', $storyId, PDO::PARAM_INT);
      $stmt->execute();
      $alreadyVoted = $stmt->fetchColumn();

      // Iniciar transacció
      $conn->beginTransaction();

      if ($alreadyVoted > 0) {
          // Si ja ha votat, eliminar el vot
          $deleteVoteSQL = "DELETE FROM drink_story_votes WHERE user_id = :userId AND story_id = :storyId";
          $stmt = $conn->prepare($deleteVoteSQL);
          $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
          $stmt->bindParam(':storyId', $storyId, PDO::PARAM_INT);
          $stmt->execute();

          // Reduir el recompte de vots amb decrement
          $updateVoteSQL = "UPDATE drink_stories SET votes = votes - 1 WHERE id = :storyId";
          $stmt = $conn->prepare($updateVoteSQL);
          $stmt->bindParam(':storyId', $storyId, PDO::PARAM_INT);
          $stmt->execute();

          $conn->commit();

          http_response_code(200);
          echo json_encode(["message" => "Vot eliminat correctament."]);
          exit;
      } else {
          // Si no ha votat, afegir el vot
          $voteSQL = "INSERT INTO drink_story_votes (user_id, story_id) VALUES (:userId, :storyId)";
          $stmt = $conn->prepare($voteSQL);
          $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
          $stmt->bindParam(':storyId', $storyId, PDO::PARAM_INT);
          $stmt->execute();

          // Incrementar el recompte de vots amb increment
          $updateVoteSQL = "UPDATE drink_stories SET votes = votes + 1 WHERE id = :storyId";
          $stmt = $conn->prepare($updateVoteSQL);
          $stmt->bindParam(':storyId', $storyId, PDO::PARAM_INT);
          $stmt->execute();

          $conn->commit();

          http_response_code(200);
          echo json_encode(["message" => "Vot registrat correctament."]);
          exit;
      }
  } catch (PDOException $e) {
      $conn->rollBack();
      http_response_code(500);
      echo json_encode(["message" => "Error en gestionar el vot.", "error" => $e->getMessage()]);
      exit;
  }
}

?>
