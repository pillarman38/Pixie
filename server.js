require('./config/config')
const path = require('path');
const http = require('http');
const express = require('express');
// const socketio = require('socket.io');
var port = 4012
const app = express();
var fs = require('fs')
const server = http.createServer(app);
const cors = require('cors')
var bodyParser = require('body-parser') 
var electron = require('electron')
var pixieUpdater = require('./server/models/pixieUpdater')
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/dist/pibox'))
// app.use(express.static("I:/storage"))
app.use(express.static("/home/pi/Desktop/Movies"))
app.use(express.static("/home/pi/Desktop/Media"))
// app.use(express.static("/home/pi/Desktop/TV"))
app.use(express.static("./server/serverImages/"))
app.use(express.static("/media/pi/1AE3D29122E40336/TV"))

let userRoutes = require('./server/routes/movies.routes');
const { fstat } = require('fs');
const { FORMERR } = require('dns');
const connections = []

app.use('/api/mov', userRoutes)

app.get('*', (req, res) =>{
    res.sendFile('/dist/pibox/index.html', {root: __dirname})
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

function createWindow() {
  const win = new electron.BrowserWindow({
    width: 1500,
    height: 1000,
    webPreference: {
      worldSafeExecuteJavaScript: true,
      contextIsolation: true
    }
  })
  win.loadURL('http://192.168.4.1:4012')
  // win.setKiosk(true)
  win.webContents.openDevTools();
}
pixieUpdater()
electron.app.whenReady().then(createWindow)
