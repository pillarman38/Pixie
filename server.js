require('./config/config')
require('./server/webSocket/socket')
const http = require('http');
const express = require('express');
let port = 4012
const app = express();
const server = http.createServer(app);
const cors = require('cors')
let bodyParser = require('body-parser') 
let pixieUpdaterMovies = require('./server/models/pixieUpdaterMovies')
let pixieUpdaterTv = require('./server/models/pixieUpdaterTv')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/dist/pixie'))
app.use(express.static("/home/connor/Desktop/Movies"))
app.use(express.static("/home/connor/Desktop/Media"))
app.use(express.static("./server/serverImages/"))
app.use(express.static("/mnt/usb0/TV"))

let userRoutes = require('./server/routes/movies.routes');
let featuresRoutes = require('./server/routes/features.routes');
const pixieWs = require('./server/webSocket/socket');

app.use('/api/mov', userRoutes)
app.use('/api/mov', featuresRoutes)

app.get('*', (req, res) =>{
    res.sendFile('/dist/pixie/index.html', {root: __dirname})
})

server.listen(port, async () => {
  // const p = pixieWs.create()
  await pixieUpdaterMovies.getMovieList()
  // await pixieUpdaterTv.getTVShows()
  console.log(`Server running on port ${port}`)
});
