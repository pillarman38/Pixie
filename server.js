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
var pixieUpdater = require('./server/models/pixieUpdater')
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/dist/pibox'))
// app.use(express.static("I:/storage"))
app.use(express.static("/home/connor/Desktop/Movies"))
app.use(express.static("/home/connor/Desktop/Media"))
// app.use(express.static("/home/connor/Desktop/TV"))
app.use(express.static("./server/serverImages/"))
app.use(express.static("/media/connor/X9 Pro/TV"))

let userRoutes = require('./server/routes/movies.routes');
const { fstat } = require('fs');
const { FORMERR } = require('dns');
const connections = []

app.use('/api/mov', userRoutes)

app.get('*', (req, res) =>{
    res.sendFile('/dist/pibox/index.html', {root: __dirname})
})

server.listen(port, async () => {
  // await pixieUpdater()
  console.log(`Server running on port ${port}`)
});

