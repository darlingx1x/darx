<?php
session_start();
require_once 'db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $conn->prepare("SELECT id, password_hash FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($id, $hash);
    $stmt->fetch();

    if (password_verify($password, $hash)) {
        $_SESSION['user_id'] = $id;
        echo json_encode(['status' => 'success']);
        exit;
    }
}

http_response_code(401);
echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
