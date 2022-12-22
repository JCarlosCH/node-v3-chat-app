const socket = io();

// Elements
const $messageForm = document.getElementById("message-form");
const $messageFormInput = $messageForm.elements.message;
const $messageFormButtom = $messageForm.querySelector("button");
const $sendLocationButton = document.getElementById("send-location");
const $messages = document.getElementById("messages");
const $sidebar = document.getElementById("chat-sidebar");

// Templates
const messageTemplate = document.getElementById("message-template");
const locationTemplate = document.getElementById("location-template");
const sidebarTemplate = document.getElementById("sidebar-template");

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

function autoscroll() {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

function renderMessage(message) {
    const $newMessage = messageTemplate.content.cloneNode(true);
    $newMessage.querySelector(".username").textContent = message.username;
    $newMessage.querySelector(".created").textContent = moment(message.createdAt).format("hh:mm a");
    $newMessage.querySelector(".message-content").textContent = message.text;
    $messages.appendChild($newMessage);
}

function renderUrl(message) {
    const $newLocation = locationTemplate.content.cloneNode(true);
    $newLocation.querySelector(".username").textContent = message.username;
    $newLocation.querySelector(".created").textContent = moment(message.createdAt).format("hh:mm a");
    $newLocation.querySelector(".location").href = message.url;
    $messages.appendChild($newLocation);
}

function renderSidebar({ room, users }) {
    const $newSidebar = sidebarTemplate.content.cloneNode(true);
    $newSidebar.querySelector(".room-title").textContent = room;
    const $list = $newSidebar.querySelector(".users");
    for (var user of users) {
        const $li = document.createElement("li");
        $li.textContent = user.username;
        $list.appendChild($li);
    }
    $sidebar.replaceChildren($newSidebar);
}

socket.on("message", (message) => {
    renderMessage(message);
    autoscroll();
});

socket.on("locationMessage", (message) => {
    renderUrl(message);
    autoscroll();
});

socket.on("roomData", ({ room, users }) => {
    renderSidebar({ room, users });
});

$messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    $messageFormButtom.setAttribute("disabled", "disabled");

    const message = $messageFormInput.value;
    socket.emit("sendMessage", message, (error) => {
        $messageFormButtom.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            return console.error(error);
        }

        console.log("Message was delivered!");
    });
});

$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }
    $sendLocationButton.setAttribute("disabled", "disabled");
    navigator.geolocation.getCurrentPosition((position) => {

        const {
            coords: {
                latitude,
                longitude,
            },
        } = position;

        socket.emit("sendLocation", { latitude, longitude }, () => {
            console.log("Your location has been shared with other users");
            $sendLocationButton.removeAttribute("disabled");
        });
    })
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
