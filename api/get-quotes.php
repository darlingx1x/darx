<?php
$host = "localhost";
$dbname = "zapom263_quotes";
$username = "ВАШ_ПОЛЬЗОВАТЕЛЬ_БД"; // замените
$password = "ВАШ_ПАРОЛЬ_БД";      // замените

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo "Ошибка соединения с БД: " . $conn->connect_error;
    exit;
}

$sql = "SELECT text, author, created_at FROM quotes ORDER BY created_at DESC";
$result = $conn->query($sql);

$quotes = [];
while ($row = $result->fetch_assoc()) {
    $quotes[] = $row;
}

header('Content-Type: application/json');
echo json_encode($quotes, JSON_UNESCAPED_UNICODE);

$conn->close();
?>
