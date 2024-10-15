<?php
require_once 'vendor/autoload.php';

session_start();

// Włącz wyświetlanie błędów (tylko w środowisku deweloperskim)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Upewnij się, że żądanie jest metodą POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Metoda niedozwolona
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit();
}

// Odczytaj dane z żądania
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400); // Błędne żądanie
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

// Walidacja danych (przykład, dostosuj do swoich potrzeb)
$requiredFields = ['therapist', 'consultation', 'date', 'time', 'name', 'email', 'phone'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Field '$field' is required"]);
        exit();
    }
}

// Przygotuj dane wydarzenia
$therapist = htmlspecialchars($input['therapist']);
$consultation = htmlspecialchars($input['consultation']);
$date = htmlspecialchars($input['date']); // Format YYYY-MM-DD
$time = htmlspecialchars($input['time']); // Format HH:MM
$name = htmlspecialchars($input['name']);
$email = htmlspecialchars($input['email']);
$phone = htmlspecialchars($input['phone']);

// Połącz datę i godzinę
$startDateTime = $date . 'T' . $time . ':00';
$endDateTime = date('Y-m-d\TH:i:s', strtotime($startDateTime) + 3600); // Zakładamy 1 godzinę

// Ustaw klienta Google API
$client = new Google_Client();
$client->setAuthConfig('credentials.json');
$client->setAccessType('offline');
$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php');
$client->addScope(Google_Service_Calendar::CALENDAR);

if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
    $client->setAccessToken($_SESSION['access_token']);

    // Sprawdź, czy token nie wygasł
    if ($client->isAccessTokenExpired()) {
        // Odśwież token
        $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
        $_SESSION['access_token'] = $client->getAccessToken();
    }

    $service = new Google_Service_Calendar($client);

    // Przygotuj obiekt wydarzenia
    $event = new Google_Service_Calendar_Event(array(
        'summary' => "Konsultacja: $consultation",
        'description' => "Rezerwacja przez: $name\nEmail: $email\nTelefon: $phone\nTerapeuta: $therapist",
        'start' => array(
            'dateTime' => $startDateTime,
            'timeZone' => 'Europe/Warsaw',
        ),
        'end' => array(
            'dateTime' => $endDateTime,
            'timeZone' => 'Europe/Warsaw',
        ),
        'attendees' => array(
            array('email' => $email),
        ),
    ));

    // Wstaw wydarzenie do kalendarza
    $calendarId = 'primary';
    try {
        $event = $service->events->insert($calendarId, $event);
        echo json_encode(['success' => true, 'eventId' => $event->getId()]);
    } catch (Exception $e) {
        http_response_code(500); // Błąd serwera
        echo json_encode(['error' => 'Failed to create event: ' . $e->getMessage()]);
    }
} else {
    http_response_code(401); // Nieautoryzowany
    echo json_encode(['error' => 'Unauthorized. Please authenticate with Google Calendar API.']);
}
?>
