<?php
require_once "db.php";
session_start();

// Read JSON body from fetch()
$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");

if ($username === "") {
    http_response_code(400);
    echo json_encode(["error" => "Username required"]);
    exit;
}

// Store in session
$_SESSION["username"] = $username;

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username) VALUES (?)");
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $userId = $stmt->insert_id;
} else {
    $row = $result->fetch_assoc();
    $userId = $row["id"];
}

// Store user id in session
$_SESSION["user_id"] = $userId;

echo json_encode([
    "success" => true,
    "username" => $username,
    "user_id" => $userId
]);