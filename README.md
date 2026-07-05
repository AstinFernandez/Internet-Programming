# Connect — a learner-friendly Node.js + PHP mini social app

This project recreates the "Connect" app mockups using **plain HTML/CSS**,
**Node.js/Express**, and **PHP** — on purpose, side by side, so you can learn
and compare both backend languages in one place.

Every file is heavily commented like a tutorial. Read them in this order for
the smoothest learning path:

1. `server.js` — the Node/Express backend
2. `php/config.php` → `php/chatlist.php` → `php/profile.php` — the PHP backend
3. `public/index.html` — the page structure
4. `public/js/app.js` — the frontend logic that ties it all together
5. `public/css/style.css` — the visual design

## Why two backends?

| Tab      | Powered by | Why                                                              |
|----------|-----------|-------------------------------------------------------------------|
| Status   | Node.js   | Simple JSON API, fetched once with `fetch()`                     |
| Chat     | Node.js   | Needs **AJAX polling** (`setInterval` + `fetch`) to feel "live"   |
| Map      | Node.js   | Another simple JSON API (friend pin positions)                    |
| Chat list| PHP       | Demonstrates PHP reading a "database" file and looping with `foreach` |
| Profile  | PHP       | Demonstrates PHP **sessions** (`$_SESSION`)                        |

In a real product you'd almost never run Node and PHP together like this —
you'd pick one. It's done here purely so this project can double as a
side-by-side lesson in both languages.

## Project structure

```
connect-app/
├── server.js              # Node/Express server (run with `node server.js`)
├── package.json
├── public/                 # Everything Node serves as static files
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── php/                     # Everything the PHP built-in server serves
    ├── config.php           # shared setup: sessions + CORS + JSON helper
    ├── chatlist.php          # renders the Chat tab's list
    ├── profile.php            # renders the Profile tab
    └── data/
        ├── chats.json          # fake "database" for chats
        └── users.json           # fake "database" for the profile
```

## How to run it

You need **two servers running at the same time** (in two separate terminal
windows/tabs) — that's normal when a project mixes two backend languages.

### 1. Start the Node.js server (port 3000)

```bash
cd connect-app
npm install     # downloads Express, only needed the first time
npm start        # or: node server.js
```

### 2. Start the PHP server (port 8000)

PHP ships with a tiny built-in development server — perfect for learning,
no Apache/XAMPP required (though XAMPP works fine too, since you already
use it for your Lyrical project).

```bash
cd connect-app/php
php -S localhost:8000
```

### 3. Open the app

Visit **http://localhost:3000** in your browser. The page itself is served
by Node, but its JavaScript will also call out to `http://localhost:8000`
for the Chat list and Profile tabs — open your browser's DevTools → Network
tab and watch both sets of requests happen if you want to see it in action.

## Things to try next (good practice exercises)

- Make the composer's "Post" button actually save posts on the Node server
  (add a `POST /api/posts` route, like the chat message route already does).
- Add a second chat's messages to `chatMessages` in `server.js` and click
  another row in the chat list to test it.
- Change the polling interval in `app.js` (`setInterval(fetchMessagesOnce, 3000)`)
  and see how it trades off "freshness" against extra server requests.
- Swap `chats.json` / `users.json` for a real MySQL database and rewrite the
  PHP to use `mysqli` or `PDO` instead of `file_get_contents()`.
---
# Project Notes – Architecture Review

## Summary

After reviewing the current codebase, I identified that the project currently runs a hybrid architecture combining:
- Node.js (Express) backend
- PHP backend
- Static frontend (HTML/CSS/JS)
- JSON files acting as a temporary database

While this works technically, it introduces unnecessary complexity for a coursework project that is intended to demonstrate fundamentals of PHP, JavaScript, HTML, CSS, and MySQL.

---

## Current Architecture (as implemented)

### 1. Node.js Layer
- `server.js` serves:
  - `/api/posts`
  - `/api/friends`
  - `/api/chats/:id/messages`
- Stores all data in in-memory JavaScript arrays
- No persistence (data resets on restart)

### 2. PHP Layer
- Handles chat list and profile-related endpoints
- Uses JSON files under `php/data/` as a pseudo-database
- Includes session handling and CORS configuration

### 3. Frontend Layer
- HTML/CSS/JS in `public/`
- Uses `fetch()` to communicate with:
  - Node APIs (port 3000)
  - PHP endpoints (previously port 8000, now Apache)
- Mixed dependency on two backend systems

---

## Issues with Current Design

1. Multiple backend systems (Node + PHP) in the same project
2. No real database (only JSON files in Node and PHP)
3. Inconsistent API structure
4. Frontend depends on different servers/ports
5. Over-engineered for the scope of the assignment

This makes the project harder to explain, maintain, and defend during evaluation.

---

## Recommended Simplified Architecture

The project should be reduced to a single-stack PHP application using MySQL.

### Final Architecture
``` bash
Browser
    ↓
HTML / CSS / JavaScript
    ↓(AJAX / fetch)
PHP (Apache)
    ↓
MySQL Database
```

---

## Proposed Final Project Structure

```bash
chat-app/
├── css/
│ └── style.css
├── js/
│ └── app.js
├── php/
│ ├── db.php
│ ├── login.php
│ ├── send_message.php
│ ├── get_messages.php
│ └── logout.php
├── sql/
│ └── schema.sql
├── index.html
└── README.md
``` 
---

## Database Design (MySQL)

### users
- id (PK)
- username

### messages
- id (PK)
- user_id (FK)
- message
- created_at

---

## Core Application Flow

1. User opens `index.html`
2. User enters username (session-based login)
3. JavaScript sends requests using `fetch()`
4. PHP handles requests:
   - `send_message.php` → INSERT into MySQL
   - `get_messages.php` → SELECT from MySQL
5. Frontend polls messages every 2–3 seconds (AJAX polling)
6. Messages are rendered dynamically in the UI

---

## What Should Be Removed

To align with the simplified architecture:
- `server.js`
- `package.json`
- `package-lock.json`
- Node API routes
- JSON-based “database” files (`php/data/`)

---

## Objective

The goal is to demonstrate understanding of:
- PHP backend development
- MySQL database operations (CRUD)
- JavaScript AJAX polling
- HTML/CSS UI construction
- Session handling

Not to build a large-scale system or multi-framework application.

---

## Next Step

Refactor the project to a single PHP + MySQL backend and ensure the frontend only communicates with PHP endpoints served via Apache.