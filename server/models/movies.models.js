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
var fse = require('fs-extra')
// const server = http.createServer(app);
// const io = socketio(server);
var server = require('http').Server(serverFile.app)
var io = require('socket.io')(server)
var { spawn } = require('child_process')

// var ws = new WebSocket("ws://192.168.4.1:4012")

let routeFunctions = {
    getMovieList: (req, callback) => {
        var arr = []
        var arrOfObj = []

        fs.readdir('/home/pi/Desktop/Movies/', (err, files) =>{
            files.forEach(function getTvInfo(file) {
                
                fs.readdir('/home/pi/Desktop/Movies/' + file, (err, fileTwo) => {
                    console.log(fileTwo.length)
                    var movieObj = {}
                    for(var i = 0; i < fileTwo.length; i++) {
                        if(fileTwo[i].includes(".jpg")) {
                            movieObj['cover'] = `http://192.168.4.1:4012/${file.replace(new RegExp(' ', 'g'), '%20')}/${fileTwo[i].replace(new RegExp(' ', 'g'), '%20')}`
                        }
                        if(fileTwo[i].includes(".m4v")) {
                            movieObj['title'] = fileTwo[i]
                            movieObj['location'] = `http://192.168.4.1:4012/${file.replace(new RegExp(' ', 'g'), '%20')}/${fileTwo[i].replace(new RegExp(' ', 'g'), '%20')}`
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
        fs.readdir("/home/pi/Desktop/Media", (err, files) => {

            for(var i = 0; i < files.length; i++) {
            if(path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".png" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".PNG" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".jpg" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".jpeg") { 
                uri = {
                    location: `http://192.168.4.1:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`,
                    title: files[i],
                    percent: 100
                }
                    updaterObj['photo'].push(uri)
                }
                if(path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".mp4" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".MOV") {
                    uri = {
                        location: `http://192.168.4.1:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`,
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
            getSize("/home/pi/Desktop/Media", (err, size) => {
                
            if (err) { throw err; }
            currentSize = size

            if(lastSize != currentSize) {
                lastSize = size
                fs.readdir("/home/pi/Desktop/Media", (err, files) => {

                for(var i = 0; i < files.length; i++) {
                if(path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".png" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".PNG" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".jpg" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".jpeg") { 
                        uri = `http://192.168.4.1:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`
                        updaterObj['photo'].push(uri)
                    }
                    if(path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".mp4" || path.extname(`/home/pi/Desktop/Media/${files[i]}`) == ".MOV") {
                        uri = {
                            location: `http://192.168.4.1:4012/${files[i].replace(new RegExp(' ', 'g'), "%20")}`,
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
	
        fs.readdir('/media/pi/D984BEC90AAF0EEF', (err, files) =>{
            
	    var mainMovies = fs.readdirSync(`/home/pi/Desktop/Movies`)
            console.log(mainMovies, files)
	    var filesystemObj = {
		usb: files,
		filesystem: mainMovies
	    }
	callback(filesystemObj)
        })
    },

    mover: (itm, callback) => {
        console.log("Item: ", itm)
        var files = fs.readdirSync(`/media/pi`)
        console.log("FILES: ", files)
        const source = `/media/pi/D984BEC90AAF0EEF/${itm}`
        const destination = `/home/pi/Desktop/Movies/${itm}`

        fs.mkdir(`/home/pi/Desktop/Movies/${itm}`, (err) => {
                if(err) {
            console.log(err)
                    return err
                }
            })
            var copyMovie = spawn('rsync', ['-r', '--progress', `/media/pi/D984BEC90AAF0EEF/${[itm]}`, '/home/pi/Desktop/Movies'])
            copyMovie.on('data',(err) => {
                console.log("Copy error", err);
                
            })
            copyMovie.stdout.on('data',(err) => {
                var filteredArr = err.toString().split(" ").filter(itm => {
                    if(itm != `\r/` || itm != "") { 
                        return itm
                    }
                })
                console.log(filteredArr);
                var server = new WebSocket.Server({
                    port: 4012
                })
                
                // io.sockets.emit("videoUpdate", filteredArr)
                
            })
            copyMovie.stderr.on('data',(err) => {
                console.log("stderr", err);
                
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
                    //   console.log("HIIIIIIIIIIIIIIII", username);
                    // });
                // Listen for chatMessage
            //     socket.on('chatMessage', msg => {
            //         const user = getCurrentUser(socket.id);
            //         io.to(user.room).emit('message', formatMessage(user.username, msg));
            //     });
            
            //     socket.on('disconnect', () => {
            //         console.log("user has disconnected")
            //     });
            // });
            
            // server.listen(4012, () => console.log(`Server running on port ${port}`));
    },

deleter: (itm, callback) => {
console.log("ITM", itm)
    var newProc = exec(`sudo rm -rf /home/pi/Desktop/Movies/"${itm}"`)

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
console.log("deleted")
callback("deleted")
},

eject:(callback) => {
    var newProc = exec('sudo umount /media/pi/D984BEC90AAF0EEF/')

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
console.log("ejected")
callback("ejected")
}
}
module.exports = routeFunctions
