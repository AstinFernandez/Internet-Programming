function login() {
    const username = document.getElementById("username").value.trim();

    if (username === "") {
        alert("Please enter a username.");
        return;
    }

    fetch("php/login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("login").style.display = "none";
            document.getElementById("chat").style.display = "block";

            loadMessages();
            setInterval(loadMessages, 2000);
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error(error);
        alert("Login failed.");
    });
}

function sendMessage() {
    const message = document.getElementById("message").value.trim();

    if (message === "") {
        return;
    }

    fetch("php/send_message.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(() => {
        document.getElementById("message").value = "";
        loadMessages();
    });
}

function loadMessages() {
    fetch("php/get_messages.php")
        .then(response => response.json())
        .then(messages => {

            const chatBox = document.getElementById("chatBox");
            chatBox.innerHTML = "";

            messages.forEach(msg => {

                const messageDiv = document.createElement("div");
                messageDiv.classList.add("message");

                const username = document.createElement("span");
                username.classList.add("message-user");
                username.textContent = msg.username;

                const text = document.createElement("span");
                text.classList.add("message-text");
                text.textContent = msg.message;

                const time = document.createElement("span");
                time.classList.add("message-time");
                time.textContent = msg.created_at;

                messageDiv.appendChild(username);
                messageDiv.appendChild(text);
                messageDiv.appendChild(time);

                chatBox.appendChild(messageDiv);
            });

        });
}

//setInterval(loadMessages, 2000);