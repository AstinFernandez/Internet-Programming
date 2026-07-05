<?php
/**
 * ============================================================================
 *  config.php  —  Shared setup code for all our PHP pages
 * ============================================================================
 *
 *  In PHP, it's common to put code you need on EVERY page into one shared
 *  file, then pull it into other files with require_once(). That's exactly
 *  what we're doing here.
 *
 *  This file does 3 things:
 *   1. Starts a PHP "session" — this is how PHP remembers a user between
 *      page requests (like "who is logged in right now?").
 *   2. Sends CORS headers. CORS stands for "Cross-Origin Resource Sharing".
 *      Our Node.js frontend runs on http://localhost:3000, but PHP runs on
 *      a DIFFERENT server, http://localhost:8000. Browsers block requests
 *      between two different "origins" (different ports count as different
 *      origins!) unless the server explicitly allows it. That's what the
 *      header() calls below do.
 *   3. Gives us a small helper function, read_json_file(), so we don't
 *      repeat ourselves in every PHP file that needs to load our fake
 *      "database" (a .json file on disk).
 * ============================================================================
 */

// session_start() must run before ANY HTML/output is sent to the browser.
// It looks for a session cookie in the request; if there isn't one yet, it
// creates one, so we can store data that "sticks around" between requests.
session_start();

// --- CORS headers, so our Node-served frontend (port 3000) is allowed to
//     fetch() this PHP file (served from port 8000) ---
header("Access-Control-Allow-Origin: *");   // "*" = allow any website to call this (fine for local learning; in production you'd list specific domains)
header("Content-Type: text/html; charset=UTF-8");

/**
 * read_json_file()
 * -----------------
 * A tiny helper that reads a .json file from disk and turns it into a PHP
 * array we can loop over with foreach().
 *
 * @param string $relativePath  path to the json file, relative to this folder
 * @return array                the decoded data (or an empty array on failure)
 */
function read_json_file(string $relativePath): array {
    $fullPath = __DIR__ . "/" . $relativePath; // __DIR__ = the folder this file lives in
    if (!file_exists($fullPath)) {
        return [];
    }

    $rawText = file_get_contents($fullPath);     // read the file as one big string
    $data = json_decode($rawText, true);         // "true" means: give me a PHP array, not an object
    return $data ?? []; // the ?? operator means "if $data is null, use [] instead"
}

/**
 * A super-simple stand-in for a "logged in user".
 * In a real app this would come from a login form + database lookup.
 * Here, we just store a fake user ID in the session the first time this
 * runs, so you can see PHP's $_SESSION superglobal in action.
 */
if (!isset($_SESSION["user_id"])) {
    $_SESSION["user_id"] = 1; // pretend "Jordan Blake" (id 1) is logged in
}
