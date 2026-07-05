<?php
/**
 * ============================================================================
 *  chatlist.php  —  Renders the "Chat" tab's list of conversations
 * ============================================================================
 *
 *  HOW THIS FITS IN:
 *  Our frontend JavaScript (public/js/app.js) will run:
 *      fetch("http://localhost:8000/chatlist.php")
 *  ...and drop whatever HTML this file prints straight into the page.
 *  This is a classic "server renders HTML, JS injects it" pattern — an
 *  alternative to the JSON APIs our Node server uses. Comparing the two
 *  approaches side by side is the whole point of mixing PHP and Node here!
 *
 *  KEY PHP CONCEPTS USED BELOW:
 *   - require_once():  loads another PHP file (like "import" in JS)
 *   - arrays & foreach: PHP's version of JS arrays and for...of loops
 *   - string interpolation: "Hello $name" automatically inserts variables
 *   - echo:            prints text to the page (like console.log, but for HTML)
 * ============================================================================
 */

require_once "config.php"; // gives us read_json_file() and starts the session

// Read our fake "database" of chats from disk.
$chats = read_json_file("data/chats.json");
?>

<!-- 
  Below is plain HTML, but notice the <?php ... ?> tags. PHP lets you jump
  in and out of "PHP mode" and "HTML mode" freely. Everything OUTSIDE the
  tags is sent to the browser exactly as written; everything INSIDE runs as
  PHP code.
-->

<?php foreach ($chats as $chat): ?>
    <!--
      foreach ($chats as $chat) means: "for every item in the $chats array,
      call it $chat for this loop, and run the HTML below once per item."
      This is exactly like: chats.forEach(chat => { ... }) in JavaScript.
    -->
    <div class="chat-row" data-chat-id="<?php echo $chat['id']; ?>">
        <img
            class="chat-avatar"
            src="<?php echo htmlspecialchars($chat['avatar']); ?>"
            alt="<?php echo htmlspecialchars($chat['name']); ?>"
        />

        <div class="chat-info">
            <div class="chat-top-line">
                <span class="chat-name">
                    <?php echo htmlspecialchars($chat['name']); ?>
                    <?php if ($chat['isGroup']): ?>
                        <span class="chat-member-count">• <?php echo (int) $chat['memberCount']; ?></span>
                    <?php endif; ?>
                </span>
                <span class="chat-time"><?php echo htmlspecialchars($chat['time']); ?></span>
            </div>
            <div class="chat-bottom-line">
                <span class="chat-last-message"><?php echo htmlspecialchars($chat['lastMessage']); ?></span>
                <?php if ($chat['unread'] > 0): ?>
                    <span class="chat-unread-badge"><?php echo (int) $chat['unread']; ?></span>
                <?php endif; ?>
            </div>
        </div>
    </div>
<?php endforeach; ?>

<?php
/**
 * A quick note on htmlspecialchars():
 * Whenever we print text that came from a "database" (even our little JSON
 * file) straight into HTML, we should wrap it in htmlspecialchars(). This
 * converts characters like < and > into safe HTML entities, which prevents
 * an attack called "Cross-Site Scripting" (XSS) — someone sneaking
 * <script> tags into stored data to run malicious code in other users'
 * browsers. It's a great habit to build early!
 */
?>
