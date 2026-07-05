/**
 * ============================================================================
 *  app.js — Frontend JavaScript for the Connect app
 * ============================================================================
 *
 *  This file is the "glue" between our HTML and our two backends:
 *      - Node/Express (http://localhost:3000) → Status feed, Map, Chat messages
 *      - PHP           (http://localhost:8000) → Chat list, Profile
 *
 *  Everything here uses "async/await" and fetch() — the same asynchronous
 *  pattern we talked about earlier. Read the comments in order; they're
 *  written like a walkthrough, not just documentation.
 * ============================================================================
 */

// The PHP server runs separately from Node, on its own port. We keep the
// base URL in one constant so it's easy to change later.
const PHP_BASE_URL = "http://localhost:8000";

// This will remember which chat is currently open (null = no chat open),
// and the ID of our setInterval "poller" so we can stop it later.
let activeChatId = null;
let pollingIntervalId = null;

// ----------------------------------------------------------------------------
// SECTION 1: Tab navigation
// ----------------------------------------------------------------------------

/**
 * Switches which <section class="view"> is visible, and highlights the
 * matching bottom-nav button. This is the whole "SPA" trick: nothing here
 * loads a new page, we just toggle CSS classes.
 */
function switchView(viewName) {
    // Hide every view, then show only the one we want.
    document.querySelectorAll(".view").forEach((section) => {
        section.classList.remove("active");
    });
    document.getElementById(`view-${viewName}`).classList.add("active");

    // Update which nav button looks "active".
    document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.toggle("nav-btn-active", btn.dataset.view === viewName);
    });

    // Each time we LEAVE the chat tab, it's good practice to stop polling
    // for messages — no point calling the server if nobody's watching.
    if (viewName !== "chat") {
        stopPollingMessages();
    }

    // Lazily load data for each tab only the first time it's opened —
    // see the `if (!loaded)` guards inside each load function below.
    if (viewName === "status") loadStatusFeed();
    if (viewName === "chat") loadChatList();
    if (viewName === "map") loadMap();
    if (viewName === "profile") loadProfile();
}

// Wire up every bottom-nav button to call switchView() with its data-view.
document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
});

// ----------------------------------------------------------------------------
// SECTION 2: Status feed (talks to Node/Express)
// ----------------------------------------------------------------------------

let statusFeedLoaded = false;

async function loadStatusFeed() {
    if (statusFeedLoaded) return; // don't re-fetch every time the tab opens
    statusFeedLoaded = true;

    // --- Stories row (small avatars along the top) ---
    const storiesRow = document.getElementById("stories-row");
    const storyPeople = [
        { name: "Your Story", img: "https://i.pravatar.cc/100?img=5" },
        { name: "Alex", img: "https://i.pravatar.cc/100?img=12" },
        { name: "Sarah", img: "https://i.pravatar.cc/100?img=47" },
        { name: "Marcus", img: "https://i.pravatar.cc/100?img=13" },
        { name: "Elena", img: "https://i.pravatar.cc/100?img=32" },
    ];
    storiesRow.innerHTML = storyPeople
        .map((p) => `<div class="story"><img src="${p.img}" alt="${p.name}"><span>${p.name}</span></div>`)
        .join("");

    // --- The actual feed, fetched from our Node API ---
    const feedContainer = document.getElementById("feed");
    try {
        // `await fetch(...)` pauses this function (WITHOUT freezing the
        // whole page — that's the "asynchronous" part) until the network
        // request finishes and headers come back.
        const response = await fetch("/api/posts");

        // `await response.json()` reads the response body and parses it
        // from a JSON string into a real JavaScript array.
        const posts = await response.json();

        // Build one HTML "card" per post and join them into one string.
        feedContainer.innerHTML = posts
            .map(
                (post) => `
            <article class="post-card">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.author}">
                    <div>
                        <div class="post-author">${post.author}</div>
                        <div class="post-time">${post.time}</div>
                    </div>
                </div>
                <img class="post-image" src="${post.image}" alt="">
                <p class="post-caption">${post.caption}</p>
                <div class="post-footer">
                    <span><i class="ph ph-heart"></i> ${formatCount(post.likes)}</span>
                    <span><i class="ph ph-chat-circle"></i> ${post.comments}</span>
                    <span><i class="ph ph-share-network"></i></span>
                </div>
            </article>
        `
            )
            .join("");
    } catch (error) {
        // If the Node server isn't running, or something else goes wrong,
        // we land here instead of crashing the whole page.
        feedContainer.innerHTML = `<p class="loading-text">Couldn't load posts. Is the Node server running? (${error.message})</p>`;
    }
}

/** Turns 2400 into "2.4k" for a nicer-looking like count. */
function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
    return String(n);
}

// Let people "post" from the composer box. We keep this simple: it just
// adds a card to the TOP of the feed on the client side (no server save),
// which is a good beginner exercise to extend later (hint: try turning this
// into a POST /api/posts request on the Node server!).
document.getElementById("composer-submit").addEventListener("click", () => {
    const input = document.querySelector(".composer-input");
    const text = input.value.trim();
    if (!text) return;

    const feedContainer = document.getElementById("feed");
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
        <div class="post-header">
            <img src="https://i.pravatar.cc/60?img=5" alt="You">
            <div>
                <div class="post-author">You</div>
                <div class="post-time">Just now</div>
            </div>
        </div>
        <p class="post-caption" style="padding-top:16px;">${text}</p>
        <div class="post-footer">
            <span><i class="ph ph-heart"></i> 0</span>
            <span><i class="ph ph-chat-circle"></i> 0</span>
            <span><i class="ph ph-share-network"></i></span>
        </div>
    `;
    feedContainer.prepend(card);
    input.value = "";
});

// ----------------------------------------------------------------------------
// SECTION 3: Chat list (talks to PHP) + open conversation (talks to Node)
// ----------------------------------------------------------------------------

let chatListLoaded = false;

async function loadChatList() {
    if (chatListLoaded) return;
    chatListLoaded = true;

    const chatListContainer = document.getElementById("chat-list");
    try {
        // Here's the PHP call! Notice it's a completely different server
        // (different port) than everything else. This only works because
        // config.php sent CORS headers allowing it.
        const response = await fetch(`${PHP_BASE_URL}/chatlist.php`);
        const html = await response.text(); // PHP sends back ready-made HTML, not JSON
        chatListContainer.innerHTML = html;

        // Now that the rows exist in the DOM, attach a click handler to
        // each one so tapping a row opens that conversation.
        document.querySelectorAll(".chat-row").forEach((row) => {
            row.addEventListener("click", () => {
                const chatId = row.dataset.chatId;
                const chatName = row.querySelector(".chat-name").firstChild.textContent.trim();
                openConversation(chatId, chatName);
            });
        });
    } catch (error) {
        chatListContainer.innerHTML = `<p class="loading-text">Couldn't load chats. Is the PHP server running on port 8000? (${error.message})</p>`;
    }
}

/** Opens the full-screen conversation panel for one chat and starts polling. */
function openConversation(chatId, chatName) {
    activeChatId = chatId;
    document.getElementById("conversation-name").textContent = chatName;
    document.getElementById("conversation-panel").classList.add("open");

    fetchMessagesOnce(); // load immediately, don't wait for the first interval tick
    startPollingMessages();
}

document.getElementById("conversation-back").addEventListener("click", () => {
    document.getElementById("conversation-panel").classList.remove("open");
    stopPollingMessages();
    activeChatId = null;
});

/**
 * THIS is AJAX polling in action, exactly like we discussed earlier:
 * every 3 seconds, ask the server "what messages exist right now?" and
 * redraw the conversation. In a bigger app you'd upgrade this to
 * WebSockets, but polling is simple, reliable, and a great starting point.
 */
function startPollingMessages() {
    stopPollingMessages(); // clear any old interval first, just in case
    pollingIntervalId = setInterval(fetchMessagesOnce, 3000);
}

function stopPollingMessages() {
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
}

async function fetchMessagesOnce() {
    if (!activeChatId) return;
    try {
        const response = await fetch(`/api/chats/${activeChatId}/messages`);
        const messages = await response.json();
        renderMessages(messages);
    } catch (error) {
        console.error("Polling failed:", error);
    }
}

function renderMessages(messages) {
    const container = document.getElementById("conversation-messages");
    container.innerHTML = messages
        .map(
            (msg) => `
        <div class="message-bubble ${msg.from === "me" ? "message-me" : "message-them"}">
            ${escapeHtml(msg.text)}
            <span class="message-time">${msg.time}</span>
        </div>
    `
        )
        .join("");
    container.scrollTop = container.scrollHeight; // auto-scroll to the newest message
}

// Sending a message: this is the OTHER half of AJAX — instead of GET-ing
// data, we POST new data to the server.
document.getElementById("conversation-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // stop the form from doing a full page reload (the old-school default)

    const input = document.getElementById("conversation-input");
    const text = input.value.trim();
    if (!text || !activeChatId) return;

    input.value = "";

    try {
        await fetch(`/api/chats/${activeChatId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // tells the server "the body below is JSON"
            body: JSON.stringify({ text }),                  // JS object -> JSON string
        });
        fetchMessagesOnce(); // refresh immediately so the sender sees their own message right away
    } catch (error) {
        console.error("Failed to send message:", error);
    }
});

/** A tiny safety helper so user-typed text can't inject stray HTML tags. */
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ----------------------------------------------------------------------------
// SECTION 4: Map tab (talks to Node/Express)
// ----------------------------------------------------------------------------

let mapLoaded = false;

async function loadMap() {
    if (mapLoaded) return;
    mapLoaded = true;

    try {
        const response = await fetch("/api/friends");
        const friends = await response.json();

        // Draw a pin for each friend on top of the map background.
        const mapCanvas = document.getElementById("map-canvas");
        friends.forEach((friend) => {
            const pin = document.createElement("div");
            pin.className = "friend-pin";
            pin.style.top = friend.top;
            pin.style.left = friend.left;
            pin.innerHTML = `
                <img src="${friend.avatar}" alt="${friend.name}">
                ${friend.online ? '<span class="status-dot"></span>' : ""}
            `;
            mapCanvas.appendChild(pin);
        });

        // Fill in the "Friends Nearby" bottom sheet list too.
        const friendsList = document.getElementById("friends-list");
        friendsList.innerHTML = friends
            .map(
                (f) => `
            <div class="friend-row">
                <img src="${f.avatar}" alt="${f.name}">
                <div>
                    <div class="friend-row-name">${f.name}</div>
                    <div class="friend-row-status">${f.online ? "🟢 Online now" : "⚪ Offline"}</div>
                </div>
            </div>
        `
            )
            .join("");

        const onlineCount = friends.filter((f) => f.online).length;
        document.getElementById("online-count").textContent = `${onlineCount} ONLINE`;
    } catch (error) {
        console.error("Failed to load map data:", error);
    }
}

// ----------------------------------------------------------------------------
// SECTION 5: Profile tab (talks to PHP)
// ----------------------------------------------------------------------------

let profileLoaded = false;

async function loadProfile() {
    if (profileLoaded) return;
    profileLoaded = true;

    const container = document.getElementById("profile-container");
    try {
        const response = await fetch(`${PHP_BASE_URL}/profile.php`);
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="loading-text">Couldn't load profile. Is the PHP server running on port 8000? (${error.message})</p>`;
    }
}

// ----------------------------------------------------------------------------
// SECTION 6: Initial load
// ----------------------------------------------------------------------------
// The Status tab is visible by default (see the "active" class in the HTML),
// so we load its data as soon as this script runs.
loadStatusFeed();
