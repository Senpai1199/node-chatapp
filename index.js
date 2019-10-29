const path = require("path")
const express = require("express")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { generateMessage, generateLocationMessage } = require("./utils/messages")

const publicDirectoryPath = path.join(__dirname, "public")
app.use(express.static(publicDirectoryPath))

// let count = 0

io.on('connection', (socket) => { // socket is a parameter that contains info about the new connection
    console.log("New WebSocket connection")

    //socket.broadcast.emit -> emits the event to everyone except the current client

    socket.on("join", ({ username, room }) => {
        socket.join(room)

        socket.emit("message", generateMessage("Welcome"))
        socket.broadcast.to(room).emit("message", generateMessage(`${username} has joined the chatroom.`)) //limits broadcast to that room
                                                                                             // and not to every client
        //io.to.emit, socket.broadcast.to.emit
    })

    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)) {
            return callback("Profanity is not allowed.")
        }

        io.emit("message", generateMessage(message)) //emit the message event to every client
        callback( )
    })

    socket.on("sendLocation", (coords, callback) => {
        io.emit("locationMessage", generateLocationMessage(coords))
        callback()
    })

    socket.on("disconnect", () => {
        io.emit("message", generateMessage("A user has left.")) //client is already disconnected so no need to use socket.broadcast.emit()
    })
 

 // Broadcast - send the event to everybodt except the connected client

    // socket.emit('countUpdated', count)

    // socket.on("increment", () => {
    //     count += 1;
    //     // socket.emit("countUpdated", count) //emits event to particular connection
    //     io.emit("countUpdated", count) //emits event to every single connection
    // })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})
