/**
 * ============================================================================
 *  server.js  —  The Node.js / Express backend for the "Connect" app
 * ============================================================================
 *
 *  WHAT THIS FILE DOES (read this like a tutorial, not just code):
 *
 *  1. It starts a small web server using the "Express" library.
 *  2. It serves our static frontend files (HTML/CSS/JS) that live in /public.
 *  3. It exposes a few JSON "API" routes that our frontend JavaScript will
 *     call using fetch() — this is exactly the async/AJAX pattern we talked
 *     about earlier:
 *          - GET  /api/posts             -> the Status feed (like Facebook posts)
 *          - GET  /api/friends           -> friends shown on the Map tab
 *          - GET  /api/chats/:id/messages -> messages in one chat (used for POLLING)
 *          - POST /api/chats/:id/messages -> send a new message
 *
 *  WHY NODE HANDLES "STATUS" AND "CHAT":
 *  Chat needs to feel "live" — new messages should show up without the user
 *  refreshing the page. That's a perfect use case for the AJAX polling
 *  pattern we discussed: the browser calls the server every few seconds and
 *  asks "anything new?". Node + Express is great at handling many small,
 *  fast JSON requests like this.
 *
 *  WHY WE ALSO HAVE A PHP FOLDER (see /php):
 *  This project intentionally ALSO includes PHP, so you can compare the two
 *  languages side by side. PHP renders the "Chat List" and "Profile" tabs.
 *  In real life you would rarely mix Node and PHP on the same site — this is
 *  done here purely so you (the learner) can see both in one project and
 *  compare their syntax and style. Look inside the /php folder next.
 *
 *  HOW TO RUN THIS FILE:
 *      1. Install dependencies:   npm install
 *      2. Start the server:       npm start        (or: node server.js)
 *      3. Open your browser to:   http://localhost:3000
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// STEP 1: Import the libraries we need.
// "require" is Node's way of loading a module (a reusable chunk of code).
// ----------------------------------------------------------------------------
const express = require("express"); // Express = a framework that makes it easy to build web servers
const path = require("path");       // "path" is a built-in Node module for working with file paths safely

// ----------------------------------------------------------------------------
// STEP 2: Create our Express application.
// Think of "app" as the server itself — we'll attach routes and settings to it.
// ----------------------------------------------------------------------------
const app = express();
const PORT = 3000; // The "port" is like a door number on your computer that the server listens on

// ----------------------------------------------------------------------------
// STEP 3: Middleware.
// "Middleware" = functions that run on EVERY request before it reaches your
// route handlers. Here we add two:
// ----------------------------------------------------------------------------

// (a) express.json() lets us read JSON data that the frontend sends us
//     (for example, when someone sends a new chat message).
app.use(express.json());

// (b) express.static() tells Express: "if a request matches a file inside
//     the /public folder, just send that file back directly."
//     This is how our index.html, style.css, and app.js get served.
app.use(express.static(path.join(__dirname, "public")));

// ----------------------------------------------------------------------------
// STEP 4: Our "fake database".
// In a real app this data would live in MySQL, MongoDB, etc. To keep this
// tutorial simple, we just store everything in plain JavaScript arrays that
// live in the server's memory. That means the data resets every time you
// restart the server — that's expected and fine for learning!
// ----------------------------------------------------------------------------

// --- Status feed posts (shown on the "Status" tab) ---
const posts = [
  {
    id: 1,
    author: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/100?img=47",
    time: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1000&q=80",
    caption:
      "Finally finished the concept work for the new lakeside retreat project. The morning fog was just too perfect to not share! 🌲✨",
    likes: 2400,
    comments: 48,
  },
  {
    id: 2,
    author: "Alex Rivera",
    avatar: "https://i.pravatar.cc/100?img=12",
    time: "5 hours ago",
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&q=80",
    caption: "Exploring some hidden gems in the city today. Check out this new gallery space!",
    likes: 856,
    comments: 12,
  },
  {
    id: 3,
    author: "Elena Zhao",
    avatar: "https://i.pravatar.cc/100?img=32",
    time: "10 hours ago",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80",
    caption: "Coffee break ☕",
    likes: 631,
    comments: 9,
  },
];

// --- Friends shown as pins on the "Map" tab ---
const friends = [
  { id: 1, name: "Sarah", avatar: "https://i.pravatar.cc/100?img=47", top: "38%", left: "27%", online: true },
  { id: 2, name: "Marcus", avatar: "https://i.pravatar.cc/100?img=13", top: "28%", left: "65%", online: true },
  { id: 3, name: "Elena", avatar: "https://i.pravatar.cc/100?img=32", top: "56%", left: "80%", online: false },
];

// --- Chat messages, grouped by chatId ---
// (chatId "1" = Elena Rodriguez, to match the chat list in the PHP file)
const chatMessages = {
  1: [
    { from: "them", name: "Elena Rodriguez", text: "Hey! Are you free later today?", time: "10:01 AM" },
    { from: "them", name: "Elena Rodriguez", text: "Can you check the live location link I sent?", time: "10:02 AM" },
  ],
};

// ----------------------------------------------------------------------------
// STEP 5: ROUTES
// A "route" pairs an HTTP method (GET, POST, etc.) + a URL path with a
// function that runs when a matching request comes in. The function
// receives "req" (the incoming request) and "res" (the response we send back).
// ----------------------------------------------------------------------------

// GET /api/posts  ->  send back the whole status feed as JSON
app.get("/api/posts", (req, res) => {
  // res.json() automatically converts our JS array into a JSON string
  // and sets the right headers. This is what our frontend's fetch() call
  // will receive.
  res.json(posts);
});

// GET /api/friends  ->  send back the list of friends for the map
app.get("/api/friends", (req, res) => {
  res.json(friends);
});

// GET /api/chats/:id/messages  ->  send back all messages for one chat
// ":id" is a "route parameter" — Express captures whatever is in that part
// of the URL and puts it in req.params.id
app.get("/api/chats/:id/messages", (req, res) => {
  const chatId = req.params.id;
  const messages = chatMessages[chatId] || [];
  res.json(messages);

  // >>> THIS is the route our frontend will call over and over again with
  // setInterval() to "poll" for new messages — exactly the AJAX polling
  // pattern from before!
});

// POST /api/chats/:id/messages  ->  add a new message to a chat
app.post("/api/chats/:id/messages", (req, res) => {
  const chatId = req.params.id;
  const { text } = req.body; // req.body works because of express.json() above

  if (!text || text.trim() === "") {
    // 400 = "Bad Request" — the client sent something invalid
    return res.status(400).json({ error: "Message text is required." });
  }

  if (!chatMessages[chatId]) {
    chatMessages[chatId] = [];
  }

  const newMessage = {
    from: "me",
    name: "You",
    text: text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  chatMessages[chatId].push(newMessage);

  // 201 = "Created" — a new resource (the message) was successfully created
  res.status(201).json(newMessage);
});

// ----------------------------------------------------------------------------
// STEP 6: Start the server and listen for incoming requests.
// ----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Connect app (Node/Express) running at http://localhost:${PORT}`);
  console.log(`   Remember to also start the PHP server — see README.md`);
});
