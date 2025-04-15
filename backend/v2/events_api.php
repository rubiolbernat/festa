<?php
require_once('dbconnect.php');
require_once('restrictions.php');
function sanitize($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

// --- Gestió de Peticions OPTIONS (Preflight) ---
// Això és necessari abans del router principal per respondre a preflights
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

// --- Variables del Router ---
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? sanitize($_GET['action']) : null;

// --- Enrutador Principal ---
if ($method == 'GET') {
  if ($action) {
    // Si hi ha acció explícita
    switch ($action) {
      case 'getAllEvents':
        getAllEventsAction($conn);
        break;
      case 'getNextEvent':
        getNextEventAction($conn);
        break;
      case 'getFutureEvents':
        getFutureEventsAction($conn);
        break;
      case 'getPastEvents':
        getPastEventsAction($conn);
        break;
      case 'getEventsByDate':
        getEventsByDateAction($conn); // La funció llegirà el paràmetre 'date'
        break;
      case 'getEventDetails':
        getEventDetailsAction($conn);
        break;
      case 'getEventStats':
        getEventStats($conn);
        break;
      case 'getMySubscriptions': // Nom d'acció suggerit
        if (!isset($_GET['user_id'])) {
          http_response_code(400);
          echo json_encode(["message" => "Paràmetre 'user_id' requerit."]);
          exit;
        }
        getMySubscribedEventsAction($conn);
        break;
      case 'getMyActiveSubscriptions': // Nom d'acció suggerit
        getMyActiveSubscribedEventsAction($conn);
        break;
      case 'getEventsPaginated':
        getEventsPaginated($conn);
        break;
      default:
        http_response_code(404);
        echo json_encode(["message" => "Acció GET desconeguda: " . sanitize($action)]); // Sanitize action abans de mostrar-la
        exit;
    }
  } else {
    // Acció GET per defecte sense ID ni acció: obtenir tots
    getAllEventsAction($conn);
  }
} elseif ($method == 'POST') {
  if ($action) {
    switch ($action) {
      case 'signUp':
        signUpToEventAction($conn);
        break;
      case 'unsign':
        unsignFromEventAction($conn);
        break;
      case 'addEvent': // Acció explícita per crear
        createEventAction($conn);
        break;
      default:
        http_response_code(400);
        echo json_encode(["message" => "Acció POST desconeguda: " . $action]);
        exit;
    }
  } elseif ($resourceId === null) {
    // Si no hi ha acció i no hi ha ID a la URL, és un POST per crear
    createEventAction($conn);
  } else {
    // POST a una URL amb ID però sense acció vàlida? Error.
    http_response_code(400);
    echo json_encode(["message" => "Acció POST requerida per a aquesta URL o acció invàlida."]);
    exit;
  }
} elseif ($method == 'PUT') {
  if ($action) {
    switch ($action) {
      case 'updateEvent':
        updateEventAction($conn);
        break;
      default:
        http_response_code(400);
        echo json_encode(["message" => "Acció PUT desconeguda: " . $action]);
        exit;
    }
  }
} elseif ($method == 'DELETE') {
  if ($action) {
    switch ($action) {
      case 'deleteEvent':
        deleteEventAction($conn);
        break;
      default:
        http_response_code(400);
        echo json_encode(["message" => "Acció DELETE desconeguda: " . $action]);
        exit;
    }
  }
} else {
  http_response_code(405); // Method Not Allowed
  header('Allow: GET, POST, PUT, DELETE, OPTIONS');
  echo json_encode(['message' => "Mètode HTTP no suportat: " . sanitize($method)]);
  exit;
}

// --- Funcions d'Acció Refactoritzades ---
// Assegura't que $conn és realment l'objecte PDO que ve de db_config.php o similar
function getAllEventsAction(PDO $conn): void // És bona pràctica type-hint $conn com a PDO
{
  try {
    // 1. Preparar la consulta (igual que abans)
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event ORDER BY data_inici DESC");

    // 2. Comprovar si la preparació ha fallat
    //    Normalment, si tens PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION configurat,
    //    prepare() llençarà una excepció si falla, però comprovar per 'false' és una
    //    doble seguretat si les excepcions estiguessin desactivades.
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo(); // Obté informació de l'error PDO
      throw new Exception("Error preparant la consulta PDO: " . ($errorInfo[2] ?? 'Error desconegut'));
    }

    // 3. Executar la consulta preparada
    $stmt->execute();

    // 4. Obtenir TOTS els resultats directament des del PDOStatement
    //    Utilitzem PDO::FETCH_ASSOC per obtenir arrays associatius, equivalent a MYSQLI_ASSOC
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. No és estrictament necessari cridar a $stmt->close() en PDO.
    //    El statement es tanca quan l'objecte $stmt es destrueix (p.ex., al final de la funció).

    // 6. Enviar la resposta JSON
    http_response_code(200);
    echo json_encode($events);
    exit;

  } catch (PDOException $e) { // És millor capturar PDOException específicament
    error_log("Error PDO a getAllEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor (PDO) al recuperar els esdeveniments."]);
    exit;
  } catch (Exception $e) { // Captura altres excepcions generals
    error_log("Error General a getAllEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor al recuperar els esdeveniments."]);
    exit;
  }
}

/**
 * Obté el pròxim esdeveniment que comença a partir d'ara.
 */
function getNextEventAction(PDO $conn): void
{
  try {
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE data_inici >= :now ORDER BY data_inici ASC LIMIT 1");
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant consulta PDO (getNextEvent): " . ($errorInfo[2] ?? 'Error desconegut'));
    }
    // Passem els paràmetres a execute()
    $stmt->execute([':now' => $now]);
    // fetch() retorna una fila o false si no n'hi ha
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    // json_encode(false) retorna "false", json_encode(null) retorna "null".
    // Si $event és false (no trobat), el convertim a null per a un JSON més estàndard.
    echo json_encode($event === false ? null : $event);
    exit;
  } catch (PDOException $e) {
    error_log("Error PDO a getNextEventAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error del servidor (PDO) al recuperar el pròxim esdeveniment."]);
    exit;
  } catch (Exception $e) {
    error_log("Error General a getNextEventAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error general del servidor al recuperar el pròxim esdeveniment."]);
    exit;
  }
}

/**
 * Obté esdeveniments futurs (data fi >= ara).
 */
function getFutureEventsAction(PDO $conn): void
{
  try {
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE data_fi >= :now ORDER BY data_inici ASC");
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant consulta PDO (getFutureEvents): " . ($errorInfo[2] ?? 'Error desconegut'));
    }
    $stmt->execute([':now' => $now]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($events);
    exit;
  } catch (PDOException $e) {
    error_log("Error PDO a getFutureEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error del servidor (PDO) al recuperar esdeveniments futurs."]);
    exit;
  } catch (Exception $e) {
    error_log("Error General a getFutureEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error general del servidor al recuperar esdeveniments futurs."]);
    exit;
  }
}

/**
 * Obté esdeveniments passats (data fi < ara).
 */
function getPastEventsAction(PDO $conn): void
{
  try {
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE data_fi < :now ORDER BY data_inici DESC");
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant consulta PDO (getPastEvents): " . ($errorInfo[2] ?? 'Error desconegut'));
    }
    $stmt->execute([':now' => $now]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($events);
    exit;
  } catch (PDOException $e) {
    error_log("Error PDO a getPastEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error del servidor (PDO) al recuperar esdeveniments passats."]);
    exit;
  } catch (Exception $e) {
    error_log("Error General a getPastEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error general del servidor al recuperar esdeveniments passats."]);
    exit;
  }
}

function getEventsPaginated($conn)
{
  $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? intval($_GET['limit']) : 10;
  $offset = isset($_GET['offset']) && is_numeric($_GET['offset']) ? intval($_GET['offset']) : 0;

  $sql = "
        SELECT
          de.event_id, de.nom, de.data_creacio, de.data_inici, de.data_fi,
          de.opcions, de.created_by, fu.name AS created_by_name
        FROM drink_event de
        LEFT JOIN festa_users fu ON de.created_by = fu.user_id
        ORDER BY de.data_inici DESC
        LIMIT :limit OFFSET :offset
    ";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($events)) {
      // 1. Recollir tots els event_ids d'aquesta pàgina
      $event_ids = array_column($events, 'event_id');

      // 2. Fer UNA SOLA consulta per a TOTS els participants d'aquests events
      $placeholders = implode(',', array_fill(0, count($event_ids), '?')); // ?,?,?
      $sql_participants = "
                SELECT eu.event_id, eu.user_id, eu.data_inscripcio,
                       fu.user_id AS participant_user_id, fu.name, fu.email
                       /* Altres camps de fu si cal */
                FROM event_users eu
                INNER JOIN festa_users fu ON fu.user_id = eu.user_id
                WHERE eu.event_id IN ($placeholders)
            ";
      $stmt_participants = $conn->prepare($sql_participants);
      // Bind cada event_id (PDO s'encarrega del tipus correcte si són enters)
      foreach ($event_ids as $k => $id) {
        $stmt_participants->bindValue(($k + 1), $id, PDO::PARAM_INT);
      }
      $stmt_participants->execute();
      $all_participants_results = $stmt_participants->fetchAll(PDO::FETCH_ASSOC);

      // 3. Organitzar els participants per event_id per accedir-hi fàcilment
      $participants_by_event = [];
      foreach ($all_participants_results as $row) {
        // Aplica aquí l'estructura que hagis decidit (plana o niuada)
        // Exemple amb estructura niuada (Solució 1A)
        $participant_data = [
          'user_id' => (int) $row['user_id'],
          'data_inscripcio' => $row['data_inscripcio'],
          'user' => [
            'user_id' => (int) $row['participant_user_id'],
            'name' => $row['name'],
            'email' => $row['email'],
            // ... altres camps de user ...
          ]
        ];
        // Exemple amb estructura plana (Solució 1B)
        /*
        $participant_data = [
            'user_id' => (int)$row['user_id'],
            'data_inscripcio' => $row['data_inscripcio'],
            'name' => $row['name'],
            'email' => $row['email'],
            // ... altres camps plans ...
        ];
        */
        $participants_by_event[$row['event_id']][] = $participant_data;
      }

      // 4. Assignar els participants a cada event
      foreach ($events as &$event) { // Important el '&' per modificar l'array original
        $event_id = $event['event_id'];
        // Assigna l'array de participants (o un array buit si no n'hi ha)
        $event['participants'] = isset($participants_by_event[$event_id]) ? $participants_by_event[$event_id] : [];
        // Assegura't que els tipus de dades siguin correctes (ex: enters)
        $event['event_id'] = (int) $event['event_id'];
        $event['created_by'] = isset($event['created_by']) ? (int) $event['created_by'] : null;
      }
      // Desfer la referència per seguretat després del bucle
      unset($event);
    }

    header('Content-Type: application/json');
    echo json_encode($events);

  } catch (PDOException $e) {
    http_response_code(500);
    error_log("Error PDO en getEventsPaginated: " . $e->getMessage());
    echo json_encode(["message" => "Error en obtenir les dades: " . $e->getMessage()]);
  }
}

// La funció getParticipants ja no és cridada dins del bucle de getEventsPaginated
// però la pots mantenir si la necessites en altres llocs.


/**
 * Obté esdeveniments actius en una data específica.
 */
function getEventsByDateAction(PDO $conn): void
{
  // Validació de la data (igual que abans)
  $date_str = isset($_GET['date']) ? trim($_GET['date']) : null;
  if ($date_str === null || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_str)) {
    http_response_code(400);
    $message = ($date_str === null) ? "Paràmetre 'date' requerit." : "Paràmetre 'date' invàlid (YYYY-MM-DD).";
    echo json_encode(["message" => $message]);
    exit;
  }
  $date = $date_str;

  try {
    // Usem paràmetres amb nom per claredat
    $query = "SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions
                  FROM drink_event
                  WHERE DATE(data_inici) <= :date_filter AND DATE(data_fi) >= :date_filter
                  ORDER BY data_inici ASC";
    $stmt = $conn->prepare($query);
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant consulta PDO (getEventsByDate): " . ($errorInfo[2] ?? 'Error desconegut'));
    }
    // Passem el mateix valor per als dos paràmetres
    $stmt->execute([':date_filter' => $date]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($events);
    exit;

  } catch (PDOException $e) {
    error_log("Error PDO a getEventsByDateAction (Date: $date): " . $e->getMessage());
    http_response_code(500);
    // Correcció del typo aquí també
    echo json_encode(["message" => "Error del servidor (PDO) al recuperar els esdeveniments per data."]);
    exit;
  } catch (Exception $e) {
    error_log("Error General a getEventsByDateAction (Date: $date): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor al recuperar els esdeveniments per data."]);
    exit;
  }
  // No cal 'finally' per tancar $stmt en PDO bàsic
}

/**
 * Obté els detalls d'un event i els seus participants.
 */
function getEventDetailsAction(PDO $conn): void
{
  // Validació de l'ID (igual que abans)
  $event_id_input = $_GET['event_id'] ?? null;
  $event_id = filter_var($event_id_input, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
  if ($event_id === false || $event_id === null) {
    http_response_code(400);
    $message = ($event_id_input === null) ? "Paràmetre 'event_id' requerit." : "Paràmetre 'event_id' invàlid.";
    echo json_encode(["message" => $message]);
    exit;
  }

  try {
    // Obtenir detalls de l'esdeveniment
    $queryEvent = "SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE event_id = :event_id";
    $stmtEvent = $conn->prepare($queryEvent);
    if ($stmtEvent === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant consulta event (getEventDetails): " . ($errorInfo[2] ?? 'Error'));
    }
    $stmtEvent->execute([':event_id' => $event_id]);
    $event = $stmtEvent->fetch(PDO::FETCH_ASSOC);

    if ($event === false) { // L'event no existeix
      http_response_code(404);
      echo json_encode(["message" => "Esdeveniment no trobat amb l'ID proporcionat."]);
    } else {
      // Obtenir participants
      $queryUsers = "SELECT user_id, data_inscripcio FROM event_users WHERE event_id = :event_id";
      $stmtUsers = $conn->prepare($queryUsers);
      if ($stmtUsers === false) {
        $errorInfo = $conn->errorInfo();
        throw new Exception("Error preparant consulta usuaris (getEventDetails): " . ($errorInfo[2] ?? 'Error'));
      }
      $stmtUsers->execute([':event_id' => $event_id]);
      $participants = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

      // Afegir participants a l'event
      $event['participants'] = $participants;

      http_response_code(200);
      echo json_encode($event);
    }
    exit;

  } catch (PDOException $e) {
    error_log("Error PDO a getEventDetailsAction (ID: $event_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error del servidor (PDO) al recuperar detalls."]);
    exit;
  } catch (Exception $e) {
    error_log("Error General a getEventDetailsAction (ID: $event_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message' => 'Error general del servidor al recuperar detalls."]);
    exit;
  }
}

/**
 * Obté tots els esdeveniments als quals està subscrit l'usuari actual.
 * Requereix autenticació (user_id a la sessió).
 */
function getMySubscribedEventsAction(PDO $conn): void
{
  // Obtenir i validar user_id de la sessió
  $user_id = $_GET['user_id'] ?? null;

  if ($user_id === null) {
    http_response_code(401); // Unauthorized
    error_log("getMyActiveSubscribedEventsAction fail: Unauthenticated user.");
    echo json_encode(["message" => "Autenticació requerida per veure les teves subscripcions actives."]);
    exit;
  }

  try {
    // Consulta per obtenir els events als que l'usuari està subscrit
    // Fem un JOIN entre drink_event i event_users
    $query = "SELECT
                de.event_id,  de.nom,  de.data_creacio,  de.data_inici,  de.data_fi,
                de.opcions,  fu.name AS created_by_name,
                (SELECT COUNT(*)
                FROM event_users eu2
                WHERE eu2.event_id = de.event_id) AS total_participants
              FROM drink_event de
              JOIN event_users eu ON de.event_id = eu.event_id
              JOIN festa_users fu ON de.created_by = fu.user_id
              WHERE eu.user_id = :user_id
              ORDER BY de.data_inici ASC"; // O l'ordre que prefereixis

    $stmt = $conn->prepare($query);
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant consulta PDO (getMySubscribedEvents): " . ($errorInfo[2] ?? 'Error desconegut'));
    }

    $stmt->execute([':user_id' => $user_id]);
    $subscribedEvents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($subscribedEvents);
    exit;

  } catch (PDOException $e) {
    error_log("Error PDO a getMySubscribedEventsAction (User: $user_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor (PDO) al recuperar les teves subscripcions."]);
    exit;
  } catch (Exception $e) {
    error_log("Error General a getMySubscribedEventsAction (User: $user_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor al recuperar les teves subscripcions."]);
    exit;
  }
}
/**
 * Obté els esdeveniments ACTIUS als quals està subscrit l'usuari actual.
 * Un event es considera actiu si la seva data de fi encara no ha passat.
 * Requereix autenticació (user_id a la sessió).
 */
function getMyActiveSubscribedEventsAction(PDO $conn): void
{
  // Assegura't que la sessió estigui iniciada
  if (session_status() == PHP_SESSION_NONE) {
    session_start();
  }

  // Obtenir i validar user_id de la sessió
  $user_id = $_GET['user_id'] ?? null;

  if ($user_id === null) {
    http_response_code(401); // Unauthorized
    error_log("getMyActiveSubscribedEventsAction fail: Unauthenticated user.");
    echo json_encode(["message" => "Autenticació requerida per veure les teves subscripcions actives."]);
    exit;
  }

  try {
    $now = date('Y-m-d H:i:s'); // Data i hora actual

    // Consulta similar a l'anterior, però afegint la condició de data_fi
    $query = "SELECT de.event_id, de.nom, de.data_creacio, de.data_inici, de.data_fi, de.opcions
                  FROM drink_event de
                  JOIN event_users eu ON de.event_id = eu.event_id
                  WHERE eu.user_id = :user_id
                    AND de.data_fi >= :now  -- Condició per events actius (o futurs)
                  ORDER BY de.data_inici ASC"; // Potser vols veure primer els més propers

    $stmt = $conn->prepare($query);
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant consulta PDO (getMyActiveSubscribedEvents): " . ($errorInfo[2] ?? 'Error desconegut'));
    }

    // Passem els dos paràmetres
    $stmt->execute([':user_id' => $user_id, ':now' => $now]);
    $activeSubscribedEvents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($activeSubscribedEvents);
    exit;

  } catch (PDOException $e) {
    error_log("Error PDO a getMyActiveSubscribedEventsAction (User: $user_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor (PDO) al recuperar les teves subscripcions actives."]);
    exit;
  } catch (Exception $e) {
    error_log("Error General a getMyActiveSubscribedEventsAction (User: $user_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor al recuperar les teves subscripcions actives."]);
    exit;
  }
}
/**
 * Crea un nou esdeveniment.
 */
function createEventAction(PDO $conn): void
{
  // Llegir i validar JSON del body (IMPORTANT!)
  $json_data = file_get_contents('php://input');
  $data = json_decode($json_data, true);
  if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    error_log("Error decodificant JSON a createEventAction: " . json_last_error_msg());
    echo json_encode(['message' => 'Cos de la petició invàlid: S\'esperava JSON.']);
    exit;
  }
  if ($data === null) {
    http_response_code(400);
    echo json_encode(['message' => 'Cos de la petició JSON buit o invàlid.']);
    exit;
  }

  // Validació de dades (igual que abans, però llegint de $data)
  $nom = $data['nom'] ?? null;
  $data_inici_str = $data['data_inici'] ?? null;
  $data_fi_str = $data['data_fi'] ?? null;
  $opcions_input = $data['opcions'] ?? null;
  if (empty($nom) || empty($data_inici_str) || empty($data_fi_str)) {
    http_response_code(400);
    echo json_encode(["message" => "Falten camps obligatoris: nom, data_inici, data_fi."]);
    exit;
  }
  $ts_inici = strtotime($data_inici_str);
  $ts_fi = strtotime($data_fi_str);
  if ($ts_inici === false || $ts_fi === false) {
    http_response_code(400);
    echo json_encode(["message" => "Format de data invàlid."]);
    exit;
  }
  if ($ts_fi < $ts_inici) {
    http_response_code(400);
    echo json_encode(["message" => "La data de fi no pot ser anterior a la d'inici."]);
    exit;
  }
  $formatted_inici = date('Y-m-d H:i:s', $ts_inici);
  $formatted_fi = date('Y-m-d H:i:s', $ts_fi);
  $opcions_json = null; // Gestió d'opcions (igual que abans)
  if ($opcions_input !== null) { /* ... (codi per gestionar opcions igual) ... */
    if (is_string($opcions_input)) {
      json_decode($opcions_input);
      if (json_last_error() === JSON_ERROR_NONE) {
        $opcions_json = $opcions_input;
      }
    } elseif (is_array($opcions_input) || is_object($opcions_input)) {
      $opcions_json = json_encode($opcions_input);
      if ($opcions_json === false) {
        http_response_code(400);
        echo json_encode(["message" => "Error codificant 'opcions' a JSON."]);
        exit;
      }
    }
  }

  try {
    // Usem paràmetres anònims (?) per consistència amb el teu codi original
    $stmt = $conn->prepare("INSERT INTO drink_event (nom, data_inici, data_fi, opcions) VALUES (?, ?, ?, ?)");
    if ($stmt === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant INSERT PDO: " . ($errorInfo[2] ?? 'Error'));
    }

    // Sanititzem el nom (usant la teva funció 'sanitize')
    $sanitized_nom = sanitize($nom); // <<-- CORREGIT: Utilitza la teva funció sanitize

    // Executem passant els paràmetres en un array
    $success = $stmt->execute([$sanitized_nom, $formatted_inici, $formatted_fi, $opcions_json]);

    if ($success) {
      $newEventId = $conn->lastInsertId();

      // Recuperar i retornar l'event creat
      $stmtSelect = $conn->prepare("SELECT * FROM drink_event WHERE event_id = ?");
      if ($stmtSelect === false) { /* Gestionar error */
        throw new Exception("Error SELECT post-insert");
      }
      $stmtSelect->execute([$newEventId]);
      $newEvent = $stmtSelect->fetch(PDO::FETCH_ASSOC);

      http_response_code(201);
      echo json_encode(['message' => 'Esdeveniment creat correctament.', 'event' => $newEvent]);
      exit;
    } else {
      // Si execute() retorna false i no llença excepció (depèn de config PDO)
      $errorInfo = $stmt->errorInfo();
      throw new Exception("Error executant INSERT PDO: " . ($errorInfo[2] ?? 'Error desconegut'));
    }

  } catch (PDOException $e) {
    error_log("Error PDO a createEventAction: " . $e->getMessage());
    // Comprovar codi d'error per duplicats (SQLSTATE 23000 sol ser integritat)
    if ($e->getCode() == '23000') {
      http_response_code(409); // Conflict
      echo json_encode(["message" => "Conflicte: Ja existeix un esdeveniment amb aquestes característiques."]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error del servidor (PDO) al crear l'esdeveniment."]);
    }
    exit;
  } catch (Exception $e) {
    error_log("Error General a createEventAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor al crear l'esdeveniment."]);
    exit;
  }
}

/**
 * Actualitza un esdeveniment existent.
 */
function updateEventAction(PDO $conn): void
{
  // Validació ID (igual que abans)
  $event_id_input = $_GET['event_id'] ?? null;
  $event_id = filter_var($event_id_input, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
  if ($event_id === false || $event_id === null) { /* error 400 */
    http_response_code(400);
    echo json_encode(["message" => "event_id requerit/invàlid"]);
    exit;
  }

  // Llegir i validar JSON del body (igual que a create)
  $json_data = file_get_contents('php://input');
  $data = json_decode($json_data, true);
  if (json_last_error() !== JSON_ERROR_NONE) { /* error 400 */
    http_response_code(400);
    echo json_encode(['message' => 'JSON invàlid']);
    error_log("JSON Error update: " . json_last_error_msg());
    exit;
  }
  if ($data === null) {
    $data = [];
  } // Permet body buit o "null", però no farem res si no hi ha camps

  // Validació de dades rebudes (igual que a create)
  // PERÒ: Ara els camps són opcionals per a PUT parcial (si ho desitges)
  // Si vols PUT complet, manté les comprovacions 'empty' o '!isset' com abans
  // Aquest exemple permet actualització parcial
  $fieldsToUpdate = [];
  $params = [];

  if (isset($data['nom'])) {
    if (empty(trim($data['nom']))) {
      http_response_code(400);
      echo json_encode(["message" => "El nom no pot ser buit."]);
      exit;
    }
    $fieldsToUpdate[] = "nom = :nom";
    $params[':nom'] = sanitize($data['nom']); // Sanititzar!
  }
  if (isset($data['data_inici'])) {
    $ts_inici = strtotime($data['data_inici']);
    if ($ts_inici === false) {
      http_response_code(400);
      echo json_encode(["message" => "Format data_inici invàlid."]);
      exit;
    }
    $fieldsToUpdate[] = "data_inici = :data_inici";
    $params[':data_inici'] = date('Y-m-d H:i:s', $ts_inici);
  }
  if (isset($data['data_fi'])) {
    $ts_fi = strtotime($data['data_fi']);
    if ($ts_fi === false) {
      http_response_code(400);
      echo json_encode(["message" => "Format data_fi invàlid."]);
      exit;
    }
    $fieldsToUpdate[] = "data_fi = :data_fi";
    $params[':data_fi'] = date('Y-m-d H:i:s', $ts_fi);
  }
  // Validació creuada de dates si s'han proporcionat les dues
  if (isset($params[':data_inici']) && isset($params[':data_fi'])) {
    if (strtotime($params[':data_inici']) >= strtotime($params[':data_fi'])) {
      http_response_code(400);
      echo json_encode(["message" => "data_inici ha de ser anterior a data_fi."]);
      exit;
    }
  } // Hauries d'afegir validacions si només es passa una data contra la data existent a la BD

  if (array_key_exists('opcions', $data)) { // Permet posar 'opcions' a null explícitament
    $opcions_input = $data['opcions'];
    $opcions_json = null;
    if ($opcions_input !== null) { /* ... (codi per gestionar opcions igual que a create) ... */
      if (is_string($opcions_input)) {
        json_decode($opcions_input);
        if (json_last_error() === JSON_ERROR_NONE) {
          $opcions_json = $opcions_input;
        }
      } elseif (is_array($opcions_input) || is_object($opcions_input)) {
        $opcions_json = json_encode($opcions_input);
        if ($opcions_json === false) {
          http_response_code(400);
          echo json_encode(["message" => "Error codificant 'opcions' a JSON."]);
          exit;
        }
      }
    }
    $fieldsToUpdate[] = "opcions = :opcions";
    $params[':opcions'] = $opcions_json;
  }

  if (empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['message' => 'Cap camp vàlid proporcionat per actualitzar.']);
    exit;
  }

  try {
    // Comprovar si l'event existeix abans d'intentar actualitzar
    $stmtCheck = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = :event_id");
    if ($stmtCheck === false) {
      throw new Exception("Error prepare check exists (update)");
    }
    $stmtCheck->execute([':event_id' => $event_id]);
    if ($stmtCheck->fetchColumn() === false) {
      http_response_code(404);
      echo json_encode(['message' => 'Esdeveniment no trobat per actualitzar.']);
      exit;
    }

    // Construir i executar l'UPDATE
    $sql = "UPDATE drink_event SET " . implode(', ', $fieldsToUpdate) . " WHERE event_id = :event_id";
    $params[':event_id'] = $event_id; // Afegir l'ID als paràmetres

    $stmtUpdate = $conn->prepare($sql);
    if ($stmtUpdate === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant UPDATE PDO: " . ($errorInfo[2] ?? 'Error'));
    }

    $success = $stmtUpdate->execute($params);

    if ($success) {
      // rowCount() pot ser poc fiable en alguns drivers/versions per a SELECT,
      // però per UPDATE/DELETE sol indicar les files afectades.
      $rowCount = $stmtUpdate->rowCount();

      // Recuperar l'event actualitzat (fins i tot si rowCount és 0)
      $stmtSelect = $conn->prepare("SELECT * FROM drink_event WHERE event_id = :event_id");
      if ($stmtSelect === false) {
        throw new Exception("Error prepare select post-update");
      }
      $stmtSelect->execute([':event_id' => $event_id]);
      $updatedEvent = $stmtSelect->fetch(PDO::FETCH_ASSOC);

      if ($rowCount > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Esdeveniment actualitzat correctament.', 'event' => $updatedEvent]);
      } else {
        http_response_code(200); // O 304 Not Modified
        echo json_encode(['message' => 'Cap canvi detectat a l\'esdeveniment.', 'event' => $updatedEvent]);
      }
      exit;
    } else {
      $errorInfo = $stmtUpdate->errorInfo();
      throw new Exception("Error executant UPDATE PDO: " . ($errorInfo[2] ?? 'Error desconegut'));
    }

  } catch (PDOException $e) {
    error_log("Error PDO a updateEventAction (ID: $event_id): " . $e->getMessage());
    if ($e->getCode() == '23000') {
      http_response_code(409);
      echo json_encode(["message" => "Conflicte de dades (possible duplicat)."]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error del servidor (PDO) a l'actualitzar."]);
    }
    exit;
  } catch (Exception $e) {
    error_log("Error General a updateEventAction (ID: $event_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor a l'actualitzar."]);
    exit;
  }
}

/**
 * Elimina un esdeveniment.
 */
function deleteEventAction(PDO $conn): void
{
  // Validació ID (igual que abans)
  $event_id_input = $_GET['event_id'] ?? null;
  $event_id = filter_var($event_id_input, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
  if ($event_id === false || $event_id === null) { /* error 400 */
    http_response_code(400);
    echo json_encode(["message" => "event_id requerit/invàlid"]);
    exit;
  }

  // Opcional: Lògica de permisos

  try {
    // Comprovar si existeix (opcional però recomanat per donar 404 correcte)
    $stmtCheck = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = :event_id");
    if ($stmtCheck === false) {
      throw new Exception("Error prepare check exists (delete)");
    }
    $stmtCheck->execute([':event_id' => $event_id]);
    if ($stmtCheck->fetchColumn() === false) {
      http_response_code(404);
      echo json_encode(["message" => "Esdeveniment no trobat per eliminar."]);
      exit;
    }

    // Eliminar
    $stmtDelete = $conn->prepare("DELETE FROM drink_event WHERE event_id = :event_id");
    if ($stmtDelete === false) {
      $errorInfo = $conn->errorInfo();
      throw new Exception("Error preparant DELETE PDO: " . ($errorInfo[2] ?? 'Error'));
    }

    $success = $stmtDelete->execute([':event_id' => $event_id]);

    if ($success) {
      // Comprovar si realment s'ha eliminat (rowCount)
      if ($stmtDelete->rowCount() > 0) {
        http_response_code(204); // No Content
        // No hi ha body per 204
      } else {
        // No hauria de passar si la comprovació d'existència ha anat bé
        error_log("DELETE event $event_id: rowCount = 0 tot i existir prèviament.");
        http_response_code(404); // O 500? Si existia, potser un error inesperat
        echo json_encode(["message" => "Esdeveniment no trobat o error inesperat en eliminar (rowCount=0)."]);
      }
    } else {
      $errorInfo = $stmtDelete->errorInfo();
      throw new Exception("Error executant DELETE PDO: " . ($errorInfo[2] ?? 'Error desconegut'));
    }
    exit;

  } catch (PDOException $e) {
    $errorIdForLog = $event_id ?? ($event_id_input ?? 'INVALID');
    error_log("Error PDO a deleteEventAction (ID: $errorIdForLog): " . $e->getMessage());
    // Comprovar error FK (si no hi ha ON DELETE CASCADE)
    if ($e->getCode() == '23000') { // 23000 és Integrity constraint violation
      http_response_code(409); // Conflict
      echo json_encode(["message" => "No es pot eliminar, té dades associades (participants?)."]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error del servidor (PDO) a l'eliminar."]);
    }
    exit;
  } catch (Exception $e) {
    $errorIdForLog = $event_id ?? ($event_id_input ?? 'INVALID');
    error_log("Error General a deleteEventAction (ID: $errorIdForLog): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor a l'eliminar."]);
    exit;
  }
}

/**
 * Inscriu un usuari a un esdeveniment.
 */
function signUpToEventAction(PDO $conn): void
{
  // Validació event_id (igual que abans)
  $event_id_input = $_GET['event_id'] ?? null;
  $event_id = filter_var($event_id_input, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
  if ($event_id === false || $event_id === null) { /* error 400 */
    http_response_code(400);
    echo json_encode(["message" => "event_id requerit/invàlid"]);
    exit;
  }

  // Obtenir i validar user_id de la sessió
  $user_id = $_GET['user_id'] ?? null;

  if ($user_id === null) {
    http_response_code(401); // Unauthorized
    error_log("getMyActiveSubscribedEventsAction fail: Unauthenticated user.");
    echo json_encode(["message" => "Autenticació requerida per veure les teves subscripcions actives."]);
    exit;
  }

  try {
    // Verificar si l'event existeix i està actiu
    $now = date('Y-m-d H:i:s');
    $stmtCheckEvent = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = :event_id AND data_fi >= :now");
    if ($stmtCheckEvent === false) {
      throw new Exception("Err prepare check event (signUp)");
    }
    $stmtCheckEvent->execute([':event_id' => $event_id, ':now' => $now]);
    if ($stmtCheckEvent->fetchColumn() === false) {
      http_response_code(404);
      echo json_encode(["message" => "L'esdeveniment no existeix o ha finalitzat."]);
      exit;
    }

    // Comprovar si ja està inscrit
    $stmtCheckSignUp = $conn->prepare("SELECT event_id FROM event_users WHERE event_id = :event_id AND user_id = :user_id");
    if ($stmtCheckSignUp === false) {
      throw new Exception("Err prepare check signup (signUp)");
    }
    $stmtCheckSignUp->execute([':event_id' => $event_id, ':user_id' => $user_id]);
    if ($stmtCheckSignUp->fetchColumn() !== false) {
      http_response_code(409); // Conflict
      echo json_encode(["message" => "Ja estàs inscrit en aquest esdeveniment."]);
      exit;
    }

    // Inscriure (INSERT IGNORE és més simple si només vols evitar errors de duplicat)
    // $stmtInsert = $conn->prepare("INSERT INTO event_users (event_id, user_id) VALUES (:event_id, :user_id)");
    $stmtInsert = $conn->prepare("INSERT IGNORE INTO event_users (event_id, user_id) VALUES (:event_id, :user_id)");
    if ($stmtInsert === false) {
      throw new Exception("Err prepare insert (signUp)");
    }

    $success = $stmtInsert->execute([':event_id' => $event_id, ':user_id' => $user_id]);

    if ($success) {
      // Si hem usat INSERT IGNORE, rowCount pot ser 0 si ja existia, o 1 si s'ha inserit.
      // Si NO hem usat IGNORE, hauria d'haver donat error 23000 si existia.
      if ($stmtInsert->rowCount() > 0) {
        http_response_code(201); // Created
        echo json_encode(['message' => 'Inscripció realitzada correctament.']);
      } else {
        // Si rowCount és 0 amb INSERT IGNORE, significa que ja existia
        http_response_code(200); // OK (o 409 si prefereixes indicar conflicte)
        echo json_encode(['message' => 'Ja estaves inscrit (INSERT IGNORE).']);
      }
    } else {
      $errorInfo = $stmtInsert->errorInfo();
      throw new Exception("Error executant INSERT signup PDO: " . ($errorInfo[2] ?? 'Error desconegut'));
    }
    exit;

  } catch (PDOException $e) {
    $errorEventId = $event_id ?? ($event_id_input ?? 'INVALID');
    $errorUserId = $user_id ?? ($user_id_auth ?? 'INVALID/UNAUTH');
    error_log("Error PDO a signUpToEventAction (Event: $errorEventId, User: $errorUserId): " . $e->getMessage() . " Code: " . $e->getCode());
    if ($e->getCode() == '23000') { // Integrity constraint (FK o duplicat si no hi ha IGNORE)
      // Podria ser FK d'usuari o event no existent, O duplicat si no usem IGNORE
      http_response_code(400); // O 404 o 409 depenent de la causa exacta
      echo json_encode(["message" => "Error d'integritat: L'event/usuari no existeix o ja estaves inscrit."]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error del servidor (PDO) durant la inscripció."]);
    }
    exit;
  } catch (Exception $e) {
    $errorEventId = $event_id ?? ($event_id_input ?? 'INVALID');
    $errorUserId = $user_id ?? ($user_id_auth ?? 'INVALID/UNAUTH');
    error_log("Error General a signUpToEventAction (Event: $errorEventId, User: $errorUserId): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor durant la inscripció."]);
    exit;
  }
}

/**
 * Desinscriu un usuari d'un esdeveniment.
 */
function unsignFromEventAction(PDO $conn): void
{
  // Validació event_id (igual)
  $event_id_input = $_GET['event_id'] ?? null;
  $event_id = filter_var($event_id_input, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
  if ($event_id === false || $event_id === null) { /* error 400 */
    http_response_code(400);
    echo json_encode(["message" => "event_id requerit/invàlid"]);
    exit;
  }

  // Obtenir i validar user_id de la sessió
  $user_id = $_GET['user_id'] ?? null;

  if ($user_id === null) {
    http_response_code(401); // Unauthorized
    error_log("getMyActiveSubscribedEventsAction fail: Unauthenticated user.");
    echo json_encode(["message" => "Autenticació requerida per veure les teves subscripcions actives."]);
    exit;
  }

  try {
    // Intentar eliminar la inscripció
    $stmtDelete = $conn->prepare("DELETE FROM event_users WHERE event_id = :event_id AND user_id = :user_id");
    if ($stmtDelete === false) {
      throw new Exception("Err prepare delete (unsign)");
    }

    $success = $stmtDelete->execute([':event_id' => $event_id, ':user_id' => $user_id]);

    if ($success) {
      if ($stmtDelete->rowCount() > 0) {
        http_response_code(204); // No Content (Èxit)
      } else {
        // No s'ha eliminat res. Comprovar si era perquè l'event no existia o perquè no estava inscrit.
        $stmtCheckEvent = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = :event_id");
        if ($stmtCheckEvent === false) {
          throw new Exception("Err prepare check event post-delete (unsign)");
        }
        $stmtCheckEvent->execute([':event_id' => $event_id]);
        if ($stmtCheckEvent->fetchColumn() === false) {
          http_response_code(404); // Event Not Found
          echo json_encode(["message" => "L'esdeveniment no existeix."]);
        } else {
          http_response_code(404); // Signup Not Found
          echo json_encode(["message" => "No estaves inscrit en aquest esdeveniment."]);
        }
      }
    } else {
      $errorInfo = $stmtDelete->errorInfo();
      throw new Exception("Error executant DELETE unsign PDO: " . ($errorInfo[2] ?? 'Error desconegut'));
    }
    exit;

  } catch (PDOException $e) {
    $errorEventId = $event_id ?? ($event_id_input ?? 'INVALID');
    $errorUserId = $user_id ?? ($user_id_auth ?? 'INVALID/UNAUTH');
    error_log("Error PDO a unsignFromEventAction (Event: $errorEventId, User: $errorUserId): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor (PDO) al desapuntar-se."]);
    exit;
  } catch (Exception $e) {
    $errorEventId = $event_id ?? ($event_id_input ?? 'INVALID');
    $errorUserId = $user_id ?? ($user_id_auth ?? 'INVALID/UNAUTH');
    error_log("Error General a unsignFromEventAction (Event: $errorEventId, User: $errorUserId): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error general del servidor al desapuntar-se."]);
    exit;
  }
}

function getEventStats($conn)
{
  if (isset($_GET['event_id'])) {
    $eventId = sanitize($_GET['event_id']);
  } else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el paràmetre date-start o date-end."));
  }
  if (isset($eventId)) {
    // Obtener datos generales
    $generalUserStats = getGeneralUserStatsEvent($conn, $eventId);
    $generalStats = getGeneralStatsEvent($conn, $eventId);
    // Obtener top spending day
    //$topDrinkByQuantity = getTopDrinkByQuantityEvent($conn, $eventId);
    // Obtener estadísticas semanales
    //$weeklyStats = getWeeklyStats($conn, $userId);
    // Obtener el mes bevedeor del grup
    $topDrinker = getTopDrinkerEvent($conn, $eventId);

    // Combinar resultados
    $result = array(
      'generalUserStats' => $generalUserStats,
      'generalStats' => $generalStats,
      //'topDrinkByQuantity' => $topDrinkByQuantity,
      //'weeklyStats' => $weeklyStats,
      'topDrinker' => $topDrinker
    );

    echo json_encode($result);
  } else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el paràmetre user_id."));
  }
}

function getGeneralUserStatsEvent($conn, $eventId)
{
  $sql = "SELECT
              SUM(quantity) AS total_litres,
              SUM(price) AS total_preu,
              COUNT(DISTINCT date) AS dies_beguts,
              SUM(num_drinks) AS begudes_totals
          FROM drink_data
          WHERE event_id = :eventId";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':eventId', $eventId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error a getGeneralStatsDate: " . $e->getMessage());
    return array("error" => "Error al obtenir estadístiques generals per dates.");
  }
}

function getGeneralStatsEvent($conn, $eventId)
{
  $sql = "SELECT
                SUM(quantity) AS total_litres,
                SUM(price) AS total_preu,
                COUNT(DISTINCT date) AS dies_beguts,
                SUM(num_drinks) AS begudes_totals
            FROM drink_data
            WHERE event_id = :eventId;";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':eventId', $eventId, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error a getGeneralStatsDate: " . $e->getMessage());
    return array("error" => "Error al obtenir estadístiques generals per dates.");
  }
}

function getTopDrinkerEvent($conn, $eventId)
{
  $sql = "SELECT
            drink_data.user_id AS user_id,
            festa_users.name AS user_name,
            SUM(quantity) AS litres_totals
          FROM drink_data
          JOIN festa_users ON drink_data.user_id = festa_users.user_id
          WHERE drink_data.event_id = :eventId
          GROUP BY drink_data.user_id, festa_users.name
          ORDER BY litres_totals DESC
          LIMIT 3";

  try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':eventId', $eventId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } catch (PDOException $e) {
    error_log("Error en getTopDrinkerEvent: " . $e->getMessage());
    return array("error" => "Error al obtenir el més bevedor de l'esdeveniment.");
  }
}

?>
