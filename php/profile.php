<?php
/**
 * ============================================================================
 *  profile.php  —  Renders the "Profile" tab
 * ============================================================================
 *
 *  This page shows off PHP SESSIONS. A session is how a website remembers
 *  who you are as you move between pages, even though HTTP itself has no
 *  memory (every request is normally a "fresh start"). PHP does this with a
 *  cookie that stores a session ID, plus a matching bit of data saved on the
 *  server — accessed through the special $_SESSION array.
 *
 *  In config.php we already set:
 *      $_SESSION["user_id"] = 1;
 *  Here, we USE that value to decide which profile to load and display.
 * ============================================================================
 */

require_once "config.php";

// $_SESSION works like a regular PHP associative array, except PHP saves it
// on the server between requests. Here we read the "logged in" user's id.
$currentUserId = $_SESSION["user_id"];

// Load all users from our fake JSON database, then find the one that
// matches $currentUserId.
$users = read_json_file("data/users.json");

$currentUser = null;
foreach ($users as $user) {
    if ($user["id"] === $currentUserId) {
        $currentUser = $user;
        break; // stop looping once we've found our match
    }
}

// Defensive fallback: if for some reason we didn't find a user, avoid
// crashing the page with an error.
if ($currentUser === null) {
    $currentUser = [
        "name" => "Unknown User",
        "username" => "@unknown",
        "avatar" => "https://i.pravatar.cc/150",
        "bio" => "",
        "location" => "",
        "posts" => 0,
        "friends" => 0,
        "photos" => 0,
    ];
}
?>

<div class="profile-card">
    <img
        class="profile-avatar"
        src="<?php echo htmlspecialchars($currentUser['avatar']); ?>"
        alt="<?php echo htmlspecialchars($currentUser['name']); ?>"
    />
    <h2 class="profile-name"><?php echo htmlspecialchars($currentUser['name']); ?></h2>
    <p class="profile-username"><?php echo htmlspecialchars($currentUser['username']); ?></p>
    <p class="profile-bio"><?php echo htmlspecialchars($currentUser['bio']); ?></p>
    <p class="profile-location">📍 <?php echo htmlspecialchars($currentUser['location']); ?></p>

    <div class="profile-stats">
        <div class="profile-stat">
            <span class="stat-number"><?php echo (int) $currentUser['posts']; ?></span>
            <span class="stat-label">Posts</span>
        </div>
        <div class="profile-stat">
            <span class="stat-number"><?php echo (int) $currentUser['friends']; ?></span>
            <span class="stat-label">Friends</span>
        </div>
        <div class="profile-stat">
            <span class="stat-number"><?php echo (int) $currentUser['photos']; ?></span>
            <span class="stat-label">Photos</span>
        </div>
    </div>

    <p class="profile-session-note">
        🔎 <em>This whole card was rendered by PHP using a session variable
        (<code>$_SESSION['user_id'] = <?php echo (int) $currentUserId; ?></code>)
        to decide which user's data to load. Refresh this tab and the session
        keeps remembering you're user #<?php echo (int) $currentUserId; ?>!</em>
    </p>
</div>
