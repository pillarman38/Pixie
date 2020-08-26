const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
var port = 4012
const app = express();
var fs = require('fs')
const server = http.createServer(app);
const io = socketio(server);
// var socketsFile = require('./sockets')

// Set static folder
app.use(express.static(__dirname + '/dist/pibox'))
app.use(express.static("J:/storage"))
app.use(express.static("/home/pi/Desktop/Media"))

let userRoutes = require('./server/routes/movies.routes');
const { fstat } = require('fs');
const { FORMERR } = require('dns');

app.use('/api/mov', userRoutes)

app.get('*', (req, res) =>{
    res.sendFile('/dist/pibox/index.html', {root: __dirname})
})

io.on('connection', socket => {
    console.log("user connected")
    
    // io.sockets.emit('message', "connected")

    socket.on('test event', (username) => {
    //   console.log("HIIIIIIIIIIIIIIII", username);
      io.sockets.emit("message", username)
    });
    socket.on('photoUpdater', (username) => {
        //   console.log("HIIIIIIIIIIIIIIII", username);
          io.sockets.emit("photoUpdate", username)
        });
    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        console.log("user has disconnected")
    });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
