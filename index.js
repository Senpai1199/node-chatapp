const path = require("path")
const express = require("express")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { generateMessage, generateLocationMessage } = require("./utils/messages")
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users")
 
const publicDirectoryPath = path.join(__dirname, "public")
app.use(express.static(publicDirectoryPath))

// let count = 0

io.on('connection', (socket) => { // socket is a parameter that contains info about the new connection
    console.log("New WebSocket connection")

    //socket.broadcast.emit -> emits the event to everyone except the current client

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if(error) {
            return callback(error)
        }
        

        socket.join(user.room)

        socket.emit("message", generateMessage("Admin", "Welcome"))
        socket.broadcast.to(user.room).emit( "message", generateMessage("Admin", `${user.username} has joined the chatroom.`)) //limits broadcast to that room
                                                                                             // and not to every client
        //io.to.emit, socket.broadcast.to.emit

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id)
        socket.join(user.room)

        const filter = new Filter()
        if(filter.isProfane(message)) {
            return callback("Profanity is not allowed.")
        }

        io.to(user.room).emit("message", generateMessage(user.username, message)) //emit the message event to every client
        callback( )
    })

    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id)
        socket.join(user.room)


        io.to(user.room).emit("locationMessage", generateLocationMessage(coords, user.username))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`)) //client is already disconnected so no need to use socket.broadcast.emit()
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
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
