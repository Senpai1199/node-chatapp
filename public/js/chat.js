const socket = io() //socket is used to receive or send events
// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#share-location-button")
const $messages = document.querySelector("#messages") //div tag where html is to be inserted
const $sidebar = document.querySelector("#sidebar") //div tag of sidebar

// Templates 
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage) //getComputedStyle() is a provided global function to get CSS styles of elements
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) //Bottom margin of the new message to be added in newMessageHeight
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // Depth of scrolling (How far have I scrolled)
    const scrollOffset = $messages.ScrollTop + visibleHeight

    if(containerHeight - newMessageHeight >= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight //autoscroll the user to the bottom
    }

}

// Normal message that is not a location
socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text, // key (message) is the value we want to access inside the template 
        createdAt: moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

// When user shares location
socket.on("locationMessage", (message) => {
    console.log(message)

    const html = Mustache.render(locationTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a"),
        username: message.username,
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

//Update room data when user joins or disconnects from room
socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

// Send message to everyone
$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // disable form
    $messageFormButton.setAttribute("disabled", "disabled")

    const message = $messageFormInput.value //message is the name attribute of input tag
    socket.emit("sendMessage", message, (error) => { //(error) is the callback function for acknowledging the event
        // enable the button inside callback
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log("Message delivered")
    })
})

 //Share location button
$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute("disabled", "disabled") //temporarily disabling it until callback 
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        socket.emit("sendLocation", { latitude, longitude }, () => { // () is the callback
            // re enable the button
            $sendLocationButton.removeAttribute("disabled")

            console.log("Location Shared")
        })
    })
})

socket.emit("join", { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = "/"
    }
})

// socket.on("countUpdated", (count) => {
//     console.log(`The count has been updated to: ${count}`)
// })

// const increment_button = document.querySelector("#increment")
// increment_button.addEventListener("click", () => {
//     socket.emit("increment")
// })

 