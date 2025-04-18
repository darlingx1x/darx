<?php
session_start();
require_once 'db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
$stmt->bind_param("ss", $email, $hash);

if ($stmt->execute()) {
    $_SESSION['user_id'] = $stmt->insert_id;
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Email уже зарегистрирован']);
}
