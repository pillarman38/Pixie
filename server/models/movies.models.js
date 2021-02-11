var serverFile = require('../../server')
var fs = require('fs')
const { pathToFileURL } = require('url')
var exec = require('child_process').exec
var path = require('path')
const getSize = require('get-folder-size');
var lastSize = 0
var currentSize = 0
// var server = require('http').Server(serverFile.app)
// var io = require('socket.io')(server)
console.log(serverFile)
let routeFunctions = {
    getMovieList: (req, callback) => {
        var arr = []
        var arrOfObj = []

        fs.readdir('J:/Movies', (err, files) =>{
            files.forEach(function getTvInfo(file) {
                
                fs.readdir('J:/Movies/' + file, (err, fileTwo) => {
                    console.log(fileTwo.length)
                    var movieObj = {}
                    for(var i = 0; i < fileTwo.length; i++) {
                        if(fileTwo[i].includes(".jpg")) {
                            movieObj['cover'] = `http://192.168.1.86:4012/${file.replace(new RegExp(' ', 'g'), '%20')}/${fileTwo[i].replace(new RegExp(' ', 'g'), '%20')}`
                        }
                        if(fileTwo[i].includes(".m4v")) {
                            movieObj['title'] = fileTwo[i]
                            movieObj['location'] = `http://192.168.1.86:4012/${file.replace(new RegExp(' ', 'g'), '%20')}/${fileTwo[i].replace(new RegExp(' ', 'g'), '%20')}`
                        }
                    }
                    arr.push(movieObj)
                    // console.log(arr.length,
                    if(arr.length == files.length) {
                        console.log(fileTwo.length,  files.length, arr.length ,movieObj)
                        callback(arr)
                    }
                })
            })
        })
    },
    getmedia: (req, callback) => {
        var updaterObj = {
            video: [],
            photo: []
        }
        fs.readdir("J:/storage", (err, files) => {

            for(var i = 0; i < files.length; i++) {
            if(path.extname(`J:/storage/${files[i]}`) == ".png" || path.extname(`J:/storage/${files[i]}`) == ".PNG" || path.extname(`J:/storage/${files[i]}`) == ".jpg" || path.extname(`J:/storage/${files[i]}`) == ".jpeg") { 
                uri = {
                    location: `http://192.168.1.86:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`,
                    title: files[i],
                    percent: 100
                }
                    updaterObj['photo'].push(uri)
                }
                if(path.extname(`J:/storage/${files[i]}`) == ".mp4" || path.extname(`J:/storage/${files[i]}`) == ".MOV") {
                    uri = {
                        location: `http://192.168.1.86:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`,
                        title: files[i],
                        percent: 100
                    }
                    updaterObj['video'].push(uri)
                } 
                if(files.length - 1 === i) {
            
                    callback(updaterObj)
                    
                }
            }
        })
    },
    uploadMedia: (photoInfo, callback) => {
        var filesize = photoInfo['size']
        console.log("INFO", photoInfo, filesize)
        
        var updaterObj = {
            video: [],
            photo: []
        }
        lastSize = 0
        
        function listSize() {
            getSize("J:/storage", (err, size) => {
                
            if (err) { throw err; }
            currentSize = size

            if(lastSize != currentSize) {
                lastSize = size
                fs.readdir("J:/storage", (err, files) => {

                for(var i = 0; i < files.length; i++) {
                if(path.extname(`J:/storage/${files[i]}`) == ".png" || path.extname(`J:/storage/${files[i]}`) == ".PNG" || path.extname(`J:/storage/${files[i]}`) == ".jpg" || path.extname(`J:/storage/${files[i]}`) == ".jpeg") { 
                        uri = `http://192.168.1.86:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`
                        updaterObj['photo'].push(uri)
                    }
                    if(path.extname(`J:/storage/${files[i]}`) == ".mp4" || path.extname(`J:/storage/${files[i]}`) == ".MOV") {
                        uri = {
                            location: `http://192.168.1.86:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`,
                            title: files[i]
                        }
                        updaterObj['video'].push(uri)
                    } 
                    
                    if(files.length - 1 === i) {
                        console.log(i, files.length)
                        setTimeout(() => {
                            console.log("Sizes round 2", currentSize, filesize, lastSize, filesize + currentSize)
                            console.log("Going back")
                            callback(updaterObj)
                        },3000) 
                    }
                }
            })
          } 
        })
    }
        setTimeout(() => {
            console.log("Sizes", currentSize, filesize, lastSize, filesize + currentSize)
           
            listSize()
        }, 1000)
    },
    powerOff: (req, callback) => {
        var newProc = exec('sudo shutdown now')

        newProc.on('error', function(data) {
            console.log(data)
        })
        newProc.on('data', function(data) {
            console.log(data)
        })
        newProc.stderr.on('data', function(data) {
            console.log(data)
        })
        newProc.on('close', function(data) {
            console.log(data)
        })
    },
    dirinfogetter: (callback) => {
        fs.readdir('J:/Movies', (err, files) =>{
            console.log(files);
            callback(files)
        })
    }
}
module.exports = routeFunctions
