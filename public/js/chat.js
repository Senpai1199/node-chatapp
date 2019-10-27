const socket = io() //socket is used to receive or send events
// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")

const $sendLocationButton = document.querySelector("#share-location-button")


socket.on("message", (message) => {
    console.log(message)
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
 