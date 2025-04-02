<?php
// --- Includes Necessaris ---
require_once('dbconnect.php'); // Connexió a la base de dades
require_once('restrictions.php'); // Gestió CORS
define('STORIES_UPLOAD_DIR', '../assets/uploads/');

// --- Funció de Neteja (Sanitize) ---
function sanitize($data)
{
  return $data !== null ? htmlspecialchars(stripslashes(trim($data))) : null;
}

// --- Gestió de Peticions OPTIONS (Preflight CORS) ---
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

// --- Router Principal ---
$method = $_SERVER['REQUEST_METHOD'];

// Llegir l'acció de $_GET o de $_POST (més flexible per POST)
$action = null;
if ($method === 'GET' && isset($_GET['action'])) {
  $action = sanitize($_GET['action']);
} elseif ($method === 'POST') {
  // Intentem llegir l'acció del body (enviat com a paràmetres de formulari via POST)
  if (isset($_POST['action'])) {
    $action = sanitize($_POST['action']);
  }
  // Alternativa: Si s'envia com JSON en el body, hauries de fer:
  // $input = json_decode(file_get_contents('php://input'), true);
  // $action = isset($input['action']) ? sanitize($input['action']) : null;
}


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
      echo json_encode(["message" => "Acció GET invàlida o no especificada."]);
      exit;
  }
}

// --- Gestió de Peticions POST ---
elseif ($method === 'POST') {
  // Asegurem que tenim una acció definida
  if ($action === null) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'action' requerit per a POST."]);
    exit;
  }

  switch ($action) {
    case 'voteStory':
      // Obtenim user_id i story_id de $_POST ja que Angular els envia així
      if (!isset($_POST['user_id']) || !isset($_POST['story_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Paràmetres 'user_id' i 'story_id' requerits per a voteStory."]);
        exit;
      }
      voteStoryAction($conn, sanitize($_POST['user_id']), sanitize($_POST['story_id']));
      break;

    case 'unvoteStory': // Afegim el case per desvotar
      // Obtenim user_id i story_id de $_POST
      if (!isset($_POST['user_id']) || !isset($_POST['story_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Paràmetres 'user_id' i 'story_id' requerits per a unvoteStory."]);
        exit;
      }
      unvoteStoryAction($conn, sanitize($_POST['user_id']), sanitize($_POST['story_id'])); // Necessitem crear aquesta funció
      break;

    // *** NOVA ACCIÓ PER ELIMINAR STORIES CADUCADES ***
    case 'deleteExpiredStories':
      deleteExpiredStoriesAction($conn);
      break;
    // *** FI NOVA ACCIÓ ***

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

// ... (les teves funcions getUsersWithActiveStoriesAction, getStoryDetailsForUserAction, voteStoryAction romanen igual) ...

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

function getStoryDetailsForUserAction($conn, $userId)
{
  if (!filter_var($userId, FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "ID d'usuari invàlid."]);
    exit;
  }

  // Obtenir stories actives per a l'usuari, amb detalls de la beguda associada
  $sql = "SELECT
                ds.id AS storyId,
                ds.image_url AS slideUrl, -- Canviat de imageUrl a slideUrl per coherència amb el model Angular
                ds.uploaded_at AS uploadedAt,
                ds.expires_at AS expiresAt,
                ds.votes,
                ds.is_saved AS isSaved, -- Convertir a booleà a PHP si cal
                -- Potencialment afegir si l'usuari actual ha votat aquesta story
                -- (requeriria passar l'ID de l'usuari actual i fer un LEFT JOIN a drink_story_votes)
                dd.id AS drinkId,
                dd.date AS drinkDate,
                dd.location AS drinkLocation,
                dd.drink AS drinkName,
                dd.quantity AS drinkQuantity,
                dd.price AS drinkPrice,
                dd.num_drinks AS drinkCount
            FROM drink_stories ds
            JOIN drink_data dd ON ds.drink_id = dd.id
            WHERE ds.user_id = :userId
              AND ds.expires_at > NOW() -- Només stories actives
              -- AND ds.is_saved = FALSE -- Descomenta si no vols mostrar les guardades aquí
            ORDER BY ds.uploaded_at ASC";


  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $slidesData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatar la sortida per coincidir amb StorySlide[] (amb l'objecte 'drink' anidat)
    $responseSlides = [];
    foreach ($slidesData as $data) {
      $responseSlides[] = [
        "storyId" => (int) $data['storyId'],
        "slideUrl" => $data['slideUrl'],
        "uploadedAt" => $data['uploadedAt'],
        "expiresAt" => $data['expiresAt'],
        "votes" => (int) $data['votes'],
        "isSaved" => (bool) $data['isSaved'],
        "hasBeenSeen" => false, // Lògica pendent: marcar com a vista
        "drink" => [
          "drinkId" => (int) $data['drinkId'],
          "date" => $data['drinkDate'],
          "location" => $data['drinkLocation'],
          "name" => $data['drinkName'],
          "quantity" => $data['drinkQuantity'], // Mantenir com a string o convertir a float
          "price" => $data['drinkPrice'], // Mantenir com a string o convertir a float
          "count" => (int) $data['drinkCount']
        ],
        // Hauries d'afegir aquí la informació de si l'usuari actual (viewer) ha votat
        // "currentUserHasVoted" => checkCurrentUserVote($conn, $currentUserId, $data['storyId']) // Exemple
      ];
    }


    http_response_code(200);
    echo json_encode($responseSlides); // Envia l'array de slides formatat
    exit;
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error obtenint detalls de stories per l'usuari.", "error" => $e->getMessage()]);
    exit;
  }
}


/**
 * Permet votar una història. Si ja existeix vot, no fa res o retorna error.
 */
function voteStoryAction($conn, $userId, $storyId)
{
  if (!filter_var($userId, FILTER_VALIDATE_INT) || !filter_var($storyId, FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetres invàlids."]);
    exit;
  }

  try {
    // Comprovar si l'usuari ja ha votat aquesta història
    $checkVoteSQL = "SELECT COUNT(*) FROM drink_story_votes WHERE user_id = :userId AND story_id = :storyId";
    $stmtCheck = $conn->prepare($checkVoteSQL);
    $stmtCheck->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmtCheck->bindParam(':storyId', $storyId, PDO::PARAM_INT);
    $stmtCheck->execute();
    $alreadyVoted = $stmtCheck->fetchColumn();

    if ($alreadyVoted > 0) {
      // Ja ha votat, podríem retornar un error o simplement no fer res
      http_response_code(409); // Conflict - ja existeix
      echo json_encode(["message" => "Ja has votat aquesta story."]);
      exit;
    }

    // Iniciar transacció
    $conn->beginTransaction();

    // Afegir el vot a drink_story_votes
    $voteSQL = "INSERT INTO drink_story_votes (user_id, story_id) VALUES (:userId, :storyId)";
    $stmtVote = $conn->prepare($voteSQL);
    $stmtVote->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmtVote->bindParam(':storyId', $storyId, PDO::PARAM_INT);
    $stmtVote->execute();

    // Incrementar el recompte de vots a drink_stories
    $updateVoteSQL = "UPDATE drink_stories SET votes = votes + 1 WHERE id = :storyId";
    $stmtUpdate = $conn->prepare($updateVoteSQL);
    $stmtUpdate->bindParam(':storyId', $storyId, PDO::PARAM_INT);
    $stmtUpdate->execute();

    // Obtenir el nou recompte de vots (opcional)
    $getVotesSQL = "SELECT votes FROM drink_stories WHERE id = :storyId";
    $stmtVotes = $conn->prepare($getVotesSQL);
    $stmtVotes->bindParam(':storyId', $storyId, PDO::PARAM_INT);
    $stmtVotes->execute();
    $newVoteCount = $stmtVotes->fetchColumn();


    $conn->commit();

    http_response_code(200); // O 201 Created si consideres que has creat un recurs (el vot)
    echo json_encode([
      "message" => "Vot registrat correctament.",
      "newVoteCount" => $newVoteCount !== false ? (int) $newVoteCount : null // Retorna el nou compte
    ]);
    exit;

  } catch (PDOException $e) {
    $conn->rollBack();
    // Comprovar error de clau duplicada (ja havia votat - cursa condition?)
    if ($e->getCode() == '23000') { // Codi SQLSTATE per violació d'integritat (PK duplicada)
      http_response_code(409);
      echo json_encode(["message" => "Ja has votat aquesta story (possible concurrència).", "error" => $e->getMessage()]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error en registrar el vot.", "error" => $e->getMessage()]);
    }
    exit;
  }
}


/**
 * Permet eliminar un vot d'una història.
 */
function unvoteStoryAction($conn, $userId, $storyId)
{
  if (!filter_var($userId, FILTER_VALIDATE_INT) || !filter_var($storyId, FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetres invàlids."]);
    exit;
  }

  try {
    // Comprovar si realment existeix el vot per eliminar
    $checkVoteSQL = "SELECT COUNT(*) FROM drink_story_votes WHERE user_id = :userId AND story_id = :storyId";
    $stmtCheck = $conn->prepare($checkVoteSQL);
    $stmtCheck->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmtCheck->bindParam(':storyId', $storyId, PDO::PARAM_INT);
    $stmtCheck->execute();
    $voteExists = $stmtCheck->fetchColumn();

    if ($voteExists == 0) {
      // No hi havia vot per eliminar
      http_response_code(404); // Not Found
      echo json_encode(["message" => "No s'ha trobat cap vot teu per eliminar en aquesta story."]);
      exit;
    }


    // Iniciar transacció
    $conn->beginTransaction();

    // Eliminar el vot de drink_story_votes
    $deleteVoteSQL = "DELETE FROM drink_story_votes WHERE user_id = :userId AND story_id = :storyId";
    $stmtDelete = $conn->prepare($deleteVoteSQL);
    $stmtDelete->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmtDelete->bindParam(':storyId', $storyId, PDO::PARAM_INT);
    $stmtDelete->execute();

    // Decrementar el recompte de vots a drink_stories (només si s'ha eliminat el vot amb èxit)
    if ($stmtDelete->rowCount() > 0) {
      $updateVoteSQL = "UPDATE drink_stories SET votes = GREATEST(0, votes - 1) WHERE id = :storyId"; // GREATEST(0, ...) evita vots negatius
      $stmtUpdate = $conn->prepare($updateVoteSQL);
      $stmtUpdate->bindParam(':storyId', $storyId, PDO::PARAM_INT);
      $stmtUpdate->execute();
    } else {
      // No s'ha eliminat cap fila, potser ja s'havia eliminat? Rollback per seguretat.
      $conn->rollBack();
      http_response_code(404); // O un altre codi indicant que no s'ha trobat/modificat
      echo json_encode(["message" => "No s'ha pogut eliminar el vot (possiblement ja eliminat)."]);
      exit;
    }

    // Obtenir el nou recompte de vots (opcional)
    $getVotesSQL = "SELECT votes FROM drink_stories WHERE id = :storyId";
    $stmtVotes = $conn->prepare($getVotesSQL);
    $stmtVotes->bindParam(':storyId', $storyId, PDO::PARAM_INT);
    $stmtVotes->execute();
    $newVoteCount = $stmtVotes->fetchColumn();

    $conn->commit();

    http_response_code(200);
    echo json_encode([
      "message" => "Vot eliminat correctament.",
      "newVoteCount" => $newVoteCount !== false ? (int) $newVoteCount : null // Retorna el nou compte
    ]);
    exit;

  } catch (PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Error en eliminar el vot.", "error" => $e->getMessage()]);
    exit;
  }
}


/**
 * *** NOVA FUNCIÓ ***
 * Elimina les stories caducades que no estiguin marcades com 'guardades'.
 * Aquesta acció normalment s'executaria periòdicament (p.ex., amb un cron job),
 * però la implementem aquí per poder-la activar manualment via API si cal.
 */
/**
 * *** FUNCIÓ MODIFICADA ***
 * Elimina les stories amb una antiguitat (basada en uploaded_at) superior
 * a les hores especificades, excepte les marcades com 'guardades'.
 * Rep les hores màximes des del client.
 */
// *** Defineix la ruta BASE on es guarden les imatges de les stories ***
// *** ASSEGURA'T QUE AQUESTA RUTA ÉS CORRECTA ***
// Ha de ser accessible pel script PHP amb permisos de lectura i escriptura/eliminació.
// Exemple: director actual + pujar un nivell + entrar a assets/uploads

/**
 * Elimina les stories (registre BD i fitxer) amb una antiguitat superior
 * a les hores especificades, excepte les marcades com 'guardades'.
 */
function deleteExpiredStoriesAction($conn)
{
    // 1. Obtenir i validar 'max_age_hours'
    if (!isset($_POST['max_age_hours'])) {
        http_response_code(400);
        echo json_encode(["message" => "Paràmetre 'max_age_hours' requerit."]);
        exit;
    }
    $maxAgeHours = filter_var($_POST['max_age_hours'], FILTER_VALIDATE_INT);
    if ($maxAgeHours === false || $maxAgeHours <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "El paràmetre 'max_age_hours' ha de ser un número enter positiu."]);
        exit;
    }

    // Array per guardar els noms dels fitxers a eliminar
    $filesToDelete = [];
    $dbDeletedCount = 0;
    $filesDeletedCount = 0;
    $filesFailedCount = 0;

    try {
        // Iniciar transacció per assegurar la integritat de la BD
        $conn->beginTransaction();

        // --- Pas A: Seleccionar les stories a eliminar (per obtenir els noms de fitxer) ---
        $sql_select = "SELECT id, image_url FROM drink_stories
                       WHERE uploaded_at < (NOW() - INTERVAL :maxAgeHours HOUR)
                         AND is_saved = FALSE";

        $stmt_select = $conn->prepare($sql_select);
        $stmt_select->bindParam(':maxAgeHours', $maxAgeHours, PDO::PARAM_INT);
        $stmt_select->execute();
        $storiesToDelete = $stmt_select->fetchAll(PDO::FETCH_ASSOC);

        // Guardem els noms dels fitxers abans d'eliminar els registres
        foreach ($storiesToDelete as $story) {
            if (!empty($story['image_url'])) {
                // Només afegim si image_url no és buit
                $filesToDelete[] = $story['image_url'];
            }
        }

        // --- Pas B: Eliminar els registres de la base de dades ---
        if (!empty($storiesToDelete)) { // Només si hi ha alguna cosa a eliminar
            // Podem reutilitzar la mateixa clàusula WHERE
             $sql_delete = "DELETE FROM drink_stories
                            WHERE uploaded_at < (NOW() - INTERVAL :maxAgeHoursDelete HOUR)
                              AND is_saved = FALSE"; // Usem un placeholder diferent per claredat si cal, o el mateix

            $stmt_delete = $conn->prepare($sql_delete);
             // Tornem a vincular el paràmetre
            $stmt_delete->bindParam(':maxAgeHoursDelete', $maxAgeHours, PDO::PARAM_INT);
            $stmt_delete->execute();
            $dbDeletedCount = $stmt_delete->rowCount(); // Nombre de registres BD eliminats
        } else {
             $dbDeletedCount = 0; // No hi havia registres per eliminar
        }


        // --- Pas C: Confirmar la transacció de la BD ---
        // Si hem arribat fins aquí sense errors de BD, confirmem.
        $conn->commit();

        // --- Pas D: Eliminar els fitxers físics (DESPRÉS del commit de la BD) ---
        if ($dbDeletedCount > 0 && !empty($filesToDelete)) {
            error_log("[Story Cleanup] Intentant eliminar " . count($filesToDelete) . " fitxers associats a $dbDeletedCount registres BD eliminats.");

            foreach ($filesToDelete as $filename) {
                // Construir la ruta completa al fitxer
                 $filePath = rtrim(STORIES_UPLOAD_DIR, '/') . '/' . $filename; // Assegura una sola barra

                // Comprovar si el fitxer existeix I ÉS UN FITXER (no un directori)
                if (is_file($filePath)) {
                    // Intentar eliminar el fitxer
                    if (unlink($filePath)) {
                        $filesDeletedCount++;
                        // Log opcional d'èxit
                        // error_log("[Story Cleanup] Fitxer eliminat: " . $filePath);
                    } else {
                        $filesFailedCount++;
                        // Log d'error important si no es pot eliminar
                        error_log("[Story Cleanup] ERROR: No s'ha pogut eliminar el fitxer: " . $filePath . " (Pot ser problema de permisos?)");
                    }
                } else {
                     $filesFailedCount++; // Comptem com a fallit si no existia o no era fitxer
                     error_log("[Story Cleanup] AVÍS: El fitxer a eliminar no existeix o no és un fitxer: " . $filePath);
                }
            }
             error_log("[Story Cleanup] Finalitzat: $filesDeletedCount fitxers eliminats, $filesFailedCount errors/avisos.");
        } elseif ($dbDeletedCount > 0 && empty($filesToDelete)) {
             error_log("[Story Cleanup] S'han eliminat $dbDeletedCount registres de BD, però no tenien fitxers associats per eliminar.");
        }


        // --- Pas E: Enviar Resposta ---
        http_response_code(200);
        echo json_encode([
            "message" => "Procés d'eliminació completat. Registres BD eliminats: $dbDeletedCount.",
            "dbDeletedCount" => $dbDeletedCount,
            "filesAttempted" => count($filesToDelete),
            "filesDeletedCount" => $filesDeletedCount,
            "filesFailedCount" => $filesFailedCount // Informació addicional sobre errors de fitxer
        ]);
        exit;

    } catch (PDOException $e) {
        // Si hi ha error durant la transacció de BD, desfem els canvis
        if ($conn->inTransaction()) { // Comprova si la transacció estava activa
             $conn->rollBack();
        }

        error_log("[Story Cleanup] ERROR PDO: " . $e->getMessage()); // Log de l'error de BD

        http_response_code(500);
        echo json_encode([
            "message" => "Error de base de dades durant l'eliminació de stories.",
            "error" => $e->getMessage()
        ]);
        exit;
    } catch (Exception $e) {
         // Captura altres possibles errors (p.ex., problemes amb la ruta de fitxers?)
         // Si l'error passa DESPRÉS del commit però abans de la resposta... la BD ja s'ha modificat.
         error_log("[Story Cleanup] ERROR General: " . $e->getMessage());

         http_response_code(500);
         echo json_encode([
            "message" => "Error general durant el procés d'eliminació.",
            "error" => $e->getMessage()
         ]);
         exit;
    }
}
?>
