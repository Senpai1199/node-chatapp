const socket = io() //socket is used to receive or send events
// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#share-location-button")
const $messages = document.querySelector("#messages") //div tag where html is to be inserted

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML


// Normal message that is not a location
socket.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text, // key (message) is the value we want to access inside the template 
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
})

// When user shares location
socket.on("locationMessage", (url) => {
    console.log(url)

    const html = Mustache.render(locationTemplate, {
        url: url.text,
        createdAt: moment(url.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
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

// socket.on("countUpdated", (count) => {
//     console.log(`The count has been updated to: ${count}`)
// })

// const increment_button = document.querySelector("#increment")
// increment_button.addEventListener("click", () => {
//     socket.emit("increment")
// })
 