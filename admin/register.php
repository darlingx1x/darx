<?php
// Отладка
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Сессия
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 🔌 Подключение к БД
$host = "localhost";
$dbname = "zapom263_quotes";
$username = "zapom263_darlingx";  // Указан в cPanel
$password = "qwerty2412";
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Ошибка подключения к БД: " . $conn->connect_error);
}

// 📩 Получаем email и пароль
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// ❗ Проверка на пустоту
if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны']);
    exit;
}

// ✅ Проверка силы пароля
if (strlen($password) < 6 || !preg_match('/[a-z]/i', $password) || !preg_match('/\d/', $password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Пароль должен содержать минимум 6 символов, включая буквы и цифры']);
    exit;
}

// ❌ Проверка: email уже зарегистрирован?
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Email уже зарегистрирован']);
    exit;
}

// ✅ Хеширование и запись
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
$stmt->bind_param("ss", $email, $hash);

if ($stmt->execute()) {
    $_SESSION['user_id'] = $stmt->insert_id;
    header("Location: /quotes.html"); // 🔁 Перенаправление
    exit;
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка сервера']);
}
?>
