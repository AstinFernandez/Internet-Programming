<?php
require_once "db.php";

header("Content-Type: application/json");

$result = $conn->query(
    "SELECT id, username, message, created_at 
     FROM messages 
     ORDER BY created_at ASC"
);

$messages = [];

while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode($messages);