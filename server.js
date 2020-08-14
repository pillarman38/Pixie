var express = require('express')
const app = express()
const port = 4012
var cors = require('cors')
var http = require('http')

app.use(express.static(__dirname + '/dist/pibox'))
app.use(express.static("/home/pi/Desktop/Movies"))
app.use(express.static("/home/pi/Desktop/Media"))

let userRoutes = require('./server/routes/movies.routes')

app.use('/api/mov', userRoutes)

app.get('*', (req, res) =>{
    res.sendFile('/dist/pibox/index.html', {root: __dirname})
})

var server = app.listen(port, function() {
    var host = 'localhost'
    var thisport = server.address().port
    console.log(`Example app listening on port ${port}`)
})

