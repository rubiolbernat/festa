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
        getEventDetailsAction($conn); // Passa l'ID
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

// --- Implementació de les Funcions d'Acció Independents ---

// GET /events  o  ?action=getAllEvents
function getAllEventsAction($conn)
{
  try {
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event ORDER BY data_inici DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $events = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    http_response_code(200);
    echo json_encode($events);
    exit;
  } catch (Exception $e) {
    error_log("Error a getAllEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al recuperar els esdeveniments."]);
    exit;
  }
}

// GET ?action=getNextEvent
function getNextEventAction($conn)
{
  try {
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE data_inici >= ? ORDER BY data_inici ASC LIMIT 1");
    $stmt->bind_param("s", $now);
    $stmt->execute();
    $result = $stmt->get_result();
    $event = $result->fetch_assoc();
    $stmt->close();

    http_response_code(200); // Fins i tot si no hi ha event, la petició és correcta
    echo json_encode($event); // Retornarà null si no es troba
    exit;
  } catch (Exception $e) {
    error_log("Error a getNextEventAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al recuperar el pròxim esdeveniment."]);
    exit;
  }
}

// GET ?action=getFutureEvents
function getFutureEventsAction($conn)
{
  try {
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE data_fi >= ? ORDER BY data_inici ASC");
    $stmt->bind_param("s", $now);
    $stmt->execute();
    $result = $stmt->get_result();
    $events = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    http_response_code(200);
    echo json_encode($events);
    exit;
  } catch (Exception $e) {
    error_log("Error a getFutureEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al recuperar esdeveniments futurs."]);
    exit;
  }
}

// GET ?action=getPastEvents
function getPastEventsAction($conn)
{
  try {
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE data_fi < ? ORDER BY data_inici DESC");
    $stmt->bind_param("s", $now);
    $stmt->execute();
    $result = $stmt->get_result();
    $events = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    http_response_code(200);
    echo json_encode($events);
    exit;
  } catch (Exception $e) {
    error_log("Error a getPastEventsAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al recuperar esdeveniments passats."]);
    exit;
  }
}

// GET ?action=getEventsByDate&date=YYYY-MM-DD
function getEventsByDateAction($conn)
{
  // Obtenir el paràmetre 'date' directament
  $date = isset($_GET['date']) ? sanitize($_GET['date']) : null;

  if (!$date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'date' requerit amb format YYYY-MM-DD."]);
    exit;
  }
  try {
    $stmt = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE DATE(data_inici) <= ? AND DATE(data_fi) >= ? ORDER BY data_inici ASC");
    $stmt->bind_param("ss", $date, $date);
    $stmt->execute();
    $result = $stmt->get_result();
    $events = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    http_response_code(200);
    echo json_encode($events);
    exit;
  } catch (Exception $e) {
    error_log("Error a getEventsByDateAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al recuperar esdeveniments per data."]);
    exit;
  }
}

// GET /events/{id}
function getEventDetailsAction($conn)
{
  $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : null;
  $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : null;
  $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : null;
  $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : null;
  if (!filter_var($event_id, FILTER_VALIDATE_INT) || $event_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ID d'esdeveniment invàlid proporcionat."]);
    exit;
  }
  try {
    // Obtenir detalls
    $stmtEvent = $conn->prepare("SELECT event_id, nom, data_creacio, data_inici, data_fi, opcions FROM drink_event WHERE event_id = ?");
    $stmtEvent->bind_param("i", $event_id);
    $stmtEvent->execute();
    $resultEvent = $stmtEvent->get_result();
    $event = $resultEvent->fetch_assoc();
    $stmtEvent->close();

    if (!$event) {
      http_response_code(404);
      echo json_encode(["message" => "Esdeveniment no trobat."]);
      exit;
    }

    // Obtenir participants
    $stmtUsers = $conn->prepare("SELECT user_id, data_inscripcio FROM event_users WHERE event_id = ?");
    $stmtUsers->bind_param("i", $event_id);
    $stmtUsers->execute();
    $resultUsers = $stmtUsers->get_result();
    $participants = $resultUsers->fetch_all(MYSQLI_ASSOC);
    $stmtUsers->close();

    $event['participants'] = $participants;

    http_response_code(200);
    echo json_encode($event);
    exit;

  } catch (Exception $e) {
    error_log("Error a getEventDetailsAction (ID: $event_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al recuperar els detalls de l'esdeveniment."]);
    exit;
  }
}

// POST /events  o ?action=addEvent
function createEventAction($conn)
{   // Validació de dades rebudes (ara dins la funció)
  $nom = $data['nom'] ?? null;
  $data_inici = $data['data_inici'] ?? null;
  $data_fi = $data['data_fi'] ?? null;
  // Opcions: Si s'envien com a string JSON, les decodifiquem; si ja són array/objecte, les codifiquem
  $opcions_input = $data['opcions'] ?? null;
  $opcions_json = null;
  if (is_string($opcions_input)) {
    $decoded = json_decode($opcions_input, true);
    if (json_last_error() === JSON_ERROR_NONE) {
      $opcions_json = $opcions_input; // Ja era un JSON string vàlid
    } else if (is_array($opcions_input) || is_object($opcions_input)) {
      $opcions_json = json_encode($opcions_input); // Era array/objecte, el codifiquem
    } else {
      // Si no és cap dels anteriors, potser text pla? Ho guardem tal qual o com a null?
      // Per consistència, intentem guardar sempre JSON o NULL.
      // Si es vol text pla, caldria ajustar la lògica o el tipus de dada a la BD.
      // Assumim que es vol JSON o res.
      $opcions_json = null;
    }
  } elseif (is_array($opcions_input) || is_object($opcions_input)) {
    $opcions_json = json_encode($opcions_input);
  }


  if (empty($nom) || empty($data_inici) || empty($data_fi)) {
    http_response_code(400);
    echo json_encode(["message" => "Falten camps obligatoris: nom, data_inici, data_fi."]);
    exit;
  }

  // Validació de dates
  $ts_inici = strtotime($data_inici);
  $ts_fi = strtotime($data_fi);
  if ($ts_inici === false || $ts_fi === false) {
    http_response_code(400);
    echo json_encode(["message" => "Format de data invàlid per data_inici o data_fi. Utilitza formats reconeguts (ex: YYYY-MM-DD HH:MM:SS)."]);
    exit;
  }
  if ($ts_fi < $ts_inici) {
    http_response_code(400);
    echo json_encode(["message" => "La data de fi no pot ser anterior a la data d'inici."]);
    exit;
  }
  $formatted_inici = date('Y-m-d H:i:s', $ts_inici);
  $formatted_fi = date('Y-m-d H:i:s', $ts_fi);


  try {
    $stmt = $conn->prepare("INSERT INTO drink_event (nom, data_inici, data_fi, opcions) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $nom, $formatted_inici, $formatted_fi, $opcions_json);

    if ($stmt->execute()) {
      $newEventId = $conn->insert_id;
      // Recuperar i retornar l'esdeveniment creat
      $stmtSelect = $conn->prepare("SELECT * FROM drink_event WHERE event_id = ?");
      $stmtSelect->bind_param("i", $newEventId);
      $stmtSelect->execute();
      $newEvent = $stmtSelect->get_result()->fetch_assoc();
      $stmtSelect->close();

      http_response_code(201); // Created
      echo json_encode(['message' => 'Esdeveniment creat correctament.', 'event' => $newEvent]);
      exit;
    } else {
      error_log("Error SQL a createEventAction: " . $stmt->error);
      http_response_code(500);
      echo json_encode(["message" => "Error del servidor al crear l'esdeveniment."]);
      exit;
    }
    $stmt->close(); // Es tanca automàticament amb l'exit, però és bona pràctica
  } catch (Exception $e) {
    error_log("Error a createEventAction: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al crear l'esdeveniment."]);
    exit;
  }
}

// PUT /events/{id}
function updateEventAction($conn)
{ // Rep dades sanititzades i user_id
  if (!filter_var($event_id, FILTER_VALIDATE_INT) || $event_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ID d'esdeveniment invàlid proporcionat."]);
    exit;
  }

  // Validació de dades rebudes
  $nom = $data['nom'] ?? null;
  $data_inici = $data['data_inici'] ?? null;
  $data_fi = $data['data_fi'] ?? null;
  $opcions_input = $data['opcions'] ?? null;
  $opcions_json = null;
  // Lògica per gestionar opcions (similar a createEventAction)
  if (is_string($opcions_input)) {
    $decoded = json_decode($opcions_input, true);
    $opcions_json = (json_last_error() === JSON_ERROR_NONE) ? $opcions_input : null;
  } elseif (is_array($opcions_input) || is_object($opcions_input)) {
    $opcions_json = json_encode($opcions_input);
  }


  if (empty($nom) || empty($data_inici) || empty($data_fi)) {
    http_response_code(400);
    echo json_encode(["message" => "Falten camps obligatoris: nom, data_inici, data_fi."]);
    exit;
  }
  // Validació de dates
  $ts_inici = strtotime($data_inici);
  $ts_fi = strtotime($data_fi);
  if ($ts_inici === false || $ts_fi === false) {
    http_response_code(400);
    echo json_encode(["message" => "Format de data invàlid per data_inici o data_fi."]);
    exit;
  }
  if ($ts_fi < $ts_inici) {
    http_response_code(400);
    echo json_encode(["message" => "La data de fi no pot ser anterior a la data d'inici."]);
    exit;
  }
  $formatted_inici = date('Y-m-d H:i:s', $ts_inici);
  $formatted_fi = date('Y-m-d H:i:s', $ts_fi);

  try {
    $stmt = $conn->prepare("UPDATE drink_event SET nom = ?, data_inici = ?, data_fi = ?, opcions = ? WHERE event_id = ?");
    $stmt->bind_param("ssssi", $nom, $formatted_inici, $formatted_fi, $opcions_json, $event_id);

    if ($stmt->execute()) {
      if ($stmt->affected_rows > 0) {
        // Opcional: retornar l'esdeveniment actualitzat
        $stmtSelect = $conn->prepare("SELECT * FROM drink_event WHERE event_id = ?");
        $stmtSelect->bind_param("i", $event_id);
        $stmtSelect->execute();
        $updatedEvent = $stmtSelect->get_result()->fetch_assoc();
        $stmtSelect->close();

        http_response_code(200);
        echo json_encode(['message' => 'Esdeveniment actualitzat correctament.', 'event' => $updatedEvent]);
        exit;
      } else {
        // Comprovar si existeix per diferenciar 404 de 200 sense canvis
        $stmtCheck = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = ?");
        $stmtCheck->bind_param("i", $event_id);
        $stmtCheck->execute();
        $exists = $stmtCheck->get_result()->num_rows > 0;
        $stmtCheck->close();
        if ($exists) {
          http_response_code(200); // O 304 si vols ser estricte
          echo json_encode(['message' => 'Cap canvi detectat a l\'esdeveniment.']);
          exit;
        } else {
          http_response_code(404);
          echo json_encode(["message" => "Esdeveniment no trobat per actualitzar."]);
          exit;
        }
      }
    } else {
      error_log("Error SQL a updateEventAction (ID: $event_id): " . $stmt->error);
      http_response_code(500);
      echo json_encode(["message" => "Error del servidor a l'actualitzar l'esdeveniment."]);
      exit;
    }
    $stmt->close();
  } catch (Exception $e) {
    error_log("Error a updateEventAction (ID: $event_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor a l'actualitzar l'esdeveniment."]);
    exit;
  }
}

// DELETE /events/{id}
function deleteEventAction($conn)
{
  if (!filter_var($event_id, FILTER_VALIDATE_INT) || $event_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ID d'esdeveniment invàlid proporcionat."]);
    exit;
  }

  try {
    // Abans d'esborrar, comprovar si existeix per donar un 404 correcte
    $stmtCheck = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = ?");
    $stmtCheck->bind_param("i", $event_id);
    $stmtCheck->execute();
    $exists = $stmtCheck->get_result()->num_rows > 0;
    $stmtCheck->close();

    if (!$exists) {
      http_response_code(404);
      echo json_encode(["message" => "Esdeveniment no trobat per eliminar."]);
      exit;
    }

    // Procedir a eliminar (ON DELETE CASCADE hauria de gestionar event_users)
    $stmt = $conn->prepare("DELETE FROM drink_event WHERE event_id = ?");
    $stmt->bind_param("i", $event_id);

    if ($stmt->execute()) {
      if ($stmt->affected_rows > 0) {
        http_response_code(204); // No Content
        exit;
      } else {
        // Això no hauria de passar si la comprovació d'existència funciona bé
        error_log("DELETE event $event_id: affected_rows = 0 tot i existir prèviament.");
        http_response_code(500);
        echo json_encode(["message" => "Error inesperat en eliminar l'esdeveniment."]);
        exit;
      }
    } else {
      error_log("Error SQL a deleteEventAction (ID: $event_id): " . $stmt->error);
      http_response_code(500);
      // Podria ser un error de foreign key si ON DELETE CASCADE no funciona bé
      echo json_encode(["message" => "Error del servidor a l'eliminar l'esdeveniment."]);
      exit;
    }
    $stmt->close();
  } catch (Exception $e) {
    error_log("Error a deleteEventAction (ID: $event_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor a l'eliminar l'esdeveniment."]);
    exit;
  }
}

// POST /events/{id}?action=signUp  (o action al body)
function signUpToEventAction($conn)
{
  // Validar IDs
  if (!filter_var($event_id, FILTER_VALIDATE_INT) || $event_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ID d'esdeveniment invàlid."]);
    exit;
  }
  if ($user_id === null || !filter_var($user_id, FILTER_VALIDATE_INT) || $user_id <= 0) {
    http_response_code(401); // Requereix autenticació
    echo json_encode(["message" => "Necessites iniciar sessió per apuntar-te (ID usuari no vàlid)."]);
    exit;
  }


  try {
    // Verificar si l'esdeveniment existeix i està actiu? (Opcional)
    $stmtCheckEvent = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = ? AND data_fi >= NOW()");
    $stmtCheckEvent->bind_param("i", $event_id);
    $stmtCheckEvent->execute();
    $eventExists = $stmtCheckEvent->get_result()->num_rows > 0;
    $stmtCheckEvent->close();
    if (!$eventExists) {
      http_response_code(404);
      echo json_encode(["message" => "L'esdeveniment no existeix o ja ha finalitzat."]);
      exit;
    }


    // Comprovar si ja està inscrit (per evitar error de clau primària duplicada)
    $stmtCheck = $conn->prepare("SELECT event_id FROM event_users WHERE event_id = ? AND user_id = ?");
    $stmtCheck->bind_param("ii", $event_id, $user_id);
    $stmtCheck->execute();
    $isAlreadySignedUp = $stmtCheck->get_result()->num_rows > 0;
    $stmtCheck->close();

    if ($isAlreadySignedUp) {
      http_response_code(409); // Conflict
      echo json_encode(["message" => "Ja estàs inscrit en aquest esdeveniment."]);
      exit;
    }

    // Inscriure
    $stmtInsert = $conn->prepare("INSERT INTO event_users (event_id, user_id) VALUES (?, ?)");
    $stmtInsert->bind_param("ii", $event_id, $user_id);

    if ($stmtInsert->execute()) {
      http_response_code(201); // Created (o 200 OK si es prefereix)
      echo json_encode(['message' => 'Inscripció realitzada correctament.']);
      exit;
    } else {
      error_log("Error SQL signUpToEventAction (Event: $event_id, User: $user_id): " . $stmtInsert->error);
      // Comprovar si l'error és per clau forana (usuari o event esborrat just abans?)
      if (strpos(strtolower($stmtInsert->error), 'foreign key constraint') !== false) {
        http_response_code(404); // O 400 Bad Request
        echo json_encode(["message" => "Error en la inscripció: L'usuari o l'esdeveniment especificat no existeix."]);
      } else {
        http_response_code(500);
        echo json_encode(["message" => "Error del servidor durant la inscripció."]);
      }
      exit;
    }
    $stmtInsert->close(); // Redundant per exit

  } catch (Exception $e) {
    error_log("Error a signUpToEventAction (Event: $event_id, User: $user_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor durant la inscripció."]);
    exit;
  }
}

// POST /events/{id}?action=unsign (o action al body)
function unsignFromEventAction($conn)
{
  // Validar IDs
  if (!filter_var($event_id, FILTER_VALIDATE_INT) || $event_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ID d'esdeveniment invàlid."]);
    exit;
  }
  if ($user_id === null || !filter_var($user_id, FILTER_VALIDATE_INT) || $user_id <= 0) {
    http_response_code(401); // Requereix autenticació
    echo json_encode(["message" => "Necessites iniciar sessió per desapuntar-te (ID usuari no vàlid)."]);
    exit;
  }

  try {
    $stmt = $conn->prepare("DELETE FROM event_users WHERE event_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $event_id, $user_id);

    if ($stmt->execute()) {
      if ($stmt->affected_rows > 0) {
        http_response_code(204); // No Content
        exit;
      } else {
        // No s'ha eliminat res: l'usuari no estava inscrit o l'event no existia
        // Comprovem si l'event existeix per donar un missatge més clar
        $stmtCheckEvent = $conn->prepare("SELECT event_id FROM drink_event WHERE event_id = ?");
        $stmtCheckEvent->bind_param("i", $event_id);
        $stmtCheckEvent->execute();
        $eventExists = $stmtCheckEvent->get_result()->num_rows > 0;
        $stmtCheckEvent->close();

        if (!$eventExists) {
          http_response_code(404);
          echo json_encode(["message" => "L'esdeveniment no existeix."]);
        } else {
          http_response_code(404); // O 400 Bad Request
          echo json_encode(["message" => "No estaves inscrit en aquest esdeveniment."]);
        }
        exit;
      }
    } else {
      error_log("Error SQL unsignFromEventAction (Event: $event_id, User: $user_id): " . $stmt->error);
      http_response_code(500);
      echo json_encode(["message" => "Error del servidor al desapuntar-se."]);
      exit;
    }
    $stmt->close(); // Redundant
  } catch (Exception $e) {
    error_log("Error a unsignFromEventAction (Event: $event_id, User: $user_id): " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error del servidor al desapuntar-se."]);
    exit;
  }
}

?>
