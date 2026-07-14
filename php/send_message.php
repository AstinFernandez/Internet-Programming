<?php
require_once "db.php";
session_start();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$message = trim($data["message"] ?? "");

if ($message === "") {
    http_response_code(400);
    echo json_encode(["error" => "Message required"]);
    exit;
}

$username = $_SESSION["username"] ?? "Anonymous";

$stmt = $conn->prepare(
    "INSERT INTO messages (username, message) VALUES (?, ?)"
);

$stmt->bind_param("ss", $username, $message);

$stmt->execute();

echo json_encode([
    "success" => true,
    "message_id" => $stmt->insert_id
]);