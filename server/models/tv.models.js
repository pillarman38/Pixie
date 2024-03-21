var serverFile = require('../../server')
var fs = require('fs')
const { pathToFileURL } = require('url')
var exec = require('child_process').exec
var path = require('path')
const getSize = require('get-folder-size');
var lastSize = 0
var WebSocket = require('ws')
var currentSize = 0
// const http = require('http');
var fetch = require('node-fetch')
var pool = require('../../config/connections')
var fse = require('fs-extra')
// const server = http.createServer(app);
// const io = socketio(server);
// var server = require('http').Server(serverFile.app)
// var io = require('socket.io')(server)
var { spawn } = require('child_process')
var fetch = require('node-fetch')
// var ws = new WebSocket(`wsz://192.168.4.1:4013`)
// var wss = new WebSocket.Server({
//     port: 4013
// })

let tvFunctions = {
    getShow: (show, callback) => {
        pool.query(`SELECT * FROM tv WHERE title = '${show.title}'`, (err, res) => {
            pool.query(`SELECT * FROM seasons WhERE title = '${show.title}'`, (er, seasons) => {
                pool.query(`SELECT * FROM episodes WHERE title = '${show.title}'`, (e, r) => {
                    let seasonsList = []
                    let seasonGrabFromEp = r.map(episode => episode.season)
                    let setSeasons = [...new Set(seasonGrabFromEp)] 
                    console.log(seasonGrabFromEp, setSeasons);

                    for(var i = 0; i < setSeasons.length; i++) {
                        let seasonEps = r.filter(ep => ep.season === setSeasons[i]).sort((a, b) => a.epNumber - b.epNumber)
                        const seasonObj = {
                            title: res.title,
                            episodes: seasonEps,
                            seasonNum: i,
                            poster: seasons[i] ? seasons[i].poster : `http://192.168.4.1:4012/assets/images/four0four.gif`
                        }
                        seasonsList.push(seasonObj)
                    }

                    const showObject = {
                        numberOfSeasons: setSeasons.length,
                        seasonsList,
                        epTotal: res.length
                    }
                    console.log(seasonsList);
                    
                    // for(var i = 0; i < r.length) {}
                    callback(err, showObject)
                })
            })
        })
    }
}
module.exports = tvFunctions
