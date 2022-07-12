require('./config/config')
const path = require('path');
const http = require('http');
const express = require('express');
// const socketio = require('socket.io');
var port = 4012
const app = express();
var fs = require('fs')
const server = http.createServer(app);
// const io = socketio(server);
var bodyParser = require('body-parser') 
var electron = require('electron')
var pixieUpdater = require('./server/models/pixieUpdater')
// var socketsFile = require('./sockets')
// const io = require('socket.io-client')

// const socketio = io('http://192.168.0.153:4012')

// socketio.on("welcome", (data)=>{
//     console.log('welcome');
// })

// Set static folder
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/dist/pibox'))
app.use(express.static("I:/storage"))
app.use(express.static("/home/pi/Desktop/Movies"))
app.use(express.static("/home/pi/Desktop/Media"))
app.use(express.static('./server/serverImages/'))

let userRoutes = require('./server/routes/movies.routes');
const { fstat } = require('fs');
const { FORMERR } = require('dns');

app.use('/api/mov', userRoutes)

app.get('*', (req, res) =>{
    res.sendFile('/dist/pibox/index.html', {root: __dirname})
})

// io.on('connection', socket => {
//     console.log("user connected")
    
//     // io.sockets.emit('message', "connected")

//     socket.on('test event', (username) => {
//     //   console.log("HIIIIIIIIIIIIIIII", username);
//       io.sockets.emit("message", username)
//     });
//     socket.on('photoUpdater', (username) => {
//         //   console.log("HIIIIIIIIIIIIIIII", username);
//           io.sockets.emit("photoUpdate", username)
//         });
//     socket.on('videoUpdater', (username) => {
//         //   console.log("HIIIIIIIIIIIIIIII", username);
//           io.sockets.emit("videoUpdate", username)
//         });
//     // Listen for chatMessage
//     socket.on('chatMessage', msg => {
//         const user = getCurrentUser(socket.id);
//         io.to(user.room).emit('message', formatMessage(user.username, msg));
//     });

//     socket.on('disconnect', () => {
//         console.log("user has disconnected")
//     });
// });

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
  
});


function createWindow() {
  const win = new electron.BrowserWindow({
    // width: 800,
    // height: 600,
    webPreference: {
      worldSafeExecuteJavaScript: true,
      contextIsolation: true
    }
  })
  win.loadURL('http://192.168.4.1:4012')
  win.setKiosk(true)
  // win.webContents.openDevTools();
}

electron.app.whenReady().then(createWindow).then(pixieUpdater.moviesNeeded)
