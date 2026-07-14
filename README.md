# PHP JavaScript MySQL Real-Time Chat Application

A simple real-time chat web application built using fundamental web technologies:

- HTML
- CSS
- JavaScript (Fetch API / AJAX polling)
- PHP
- MySQL
- Apache

The purpose of this project is to demonstrate the core concepts of client-server communication, database interaction, sessions, and asynchronous updates without relying on external frameworks.

---

# Features

The application supports:

- User login using a username
- Session-based user identification
- Sending messages
- Retrieving messages from a MySQL database
- Real-time chat updates using AJAX polling
- Multiple users chatting simultaneously

---

# Project Structure
``` bash
Internet-Programming/
│
├── index.html # Main user interface
│
├── css/
│ └── style.css # Application styling
│
├── js/
│ └── app.js # Frontend logic and AJAX requests
│
├── php/
│ ├── db.php # MySQL database connection
│ ├── login.php # User login and session creation
│ ├── send_message.php # Store messages in database
│ └── get_messages.php # Retrieve messages
│
└── sql/
└── schema.sql # Database structure
```

---

# Requirements

Ensure the following are installed:

- PHP 8+
- Apache Web Server
- MySQL Server
- Web browser

Recommended environment:

- XAMPP
- LAMPP
- Linux Apache + MySQL + PHP stack

---

# Database Setup

## 1. Start MySQL

Make sure MySQL is running.

For Linux:

```bash
sudo systemctl start mysql
```
or if using XAMPP:
``` bash
sudo /opt/lampp/lampp startmysql
```
## 2. Create the database

Open MySQL:

```bash
mysql -u root -p
```
Run:
```bash
CREATE DATABASE chat_app;

Select the database:

USE chat_app;
```
Import the provided schema:
```bash
mysql -u root -p chat_app < sql/schema.sql
```
## `users`
Stores user identity and profile information.

| Column | Type | Description |
| :--- | :--- | :--- |
| **`id`** | `INTEGER` | Primary key. Unique user identifier. |
| **`username`** | `VARCHAR` | Unique username. |

---

## `messages`
Stores message content and sender metadata.

| Column | Type | Description |
| :--- | :--- | :--- |
| **`id`** | `INTEGER` | Primary key. Unique message identifier. |
| **`username`** | `VARCHAR` | Sender's username (references `users.username`). |
| **`message`** | `TEXT` | Message content. |
| **`created_at`** | `TIMESTAMP` | Timestamp of when the message was created. |
---
Configure Database Connection

Open:
```bash
php/db.php
```
Update the credentials if required:

```php
$host = "127.0.0.1";
$user = "root";
$pass = "your_password";
$db   = "chat_app";
```

# Running the Application

## Option 1: Using Apache

Move the project into Apache's web directory:

Example:

```bash
/opt/lampp/htdocs/
```
The final path should be:
```bash
/opt/lampp/htdocs/Internet-Programming
```
Start Apache:
```bash
sudo /opt/lampp/lampp startapache
```
Open:

http://localhost/Internet-Programming/

# How the Application Works
## Login Flow
User enters a username.

JavaScript sends the username to:
```bash
php/login.php
```
PHP creates a session.

User can now send messages.

## Sending Messages

When a user sends a message:
```bash
Browser
   |
   | Fetch API
   |
   v
send_message.php
   |
   v
MySQL messages table
```
## Receiving Messages

The frontend periodically requests new messages:

```bash
Browser
   |
   | Every few seconds
   |
   v
get_messages.php
   |
   v
MySQL
```
This AJAX polling mechanism provides real-time chat behavior.

## Testing the Application

To verify multiple users:

Open the application in two browsers.
Login as different users.

Example:

**Browser 1:**

Denis

**Browser 2:**

Elvis 

Send messages from both browsers.
Confirm messages appear on both sides.
