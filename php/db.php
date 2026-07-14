<?php

$host = "127.0.0.1";
$user = "root";
$pass = "root";
$db   = "chat_app";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}