const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (coords, username) => {
    return {
        url: `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`,
        createdAt: new Date().getTime(),
        username
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}