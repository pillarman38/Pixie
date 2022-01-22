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
var request = require('request')
var ws = new WebSocket(`ws://192.168.4.1:4013`)
var wss = new WebSocket.Server({
    port: 4013
})

let routeFunctions = {
    getMovieList: (req, callback) => {
        var arr = []
        var arrOfObj = []

        function re() {
            return fs.readdirSync(`/home/pi/Desktop/Movies`, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent['name'])
        }
        
        var arrToFilterWith = re()

        pool.query(`SELECT title FROM movieInfo`, (err, res) => {
            var resToFilterWith = res.map(itm => itm['title'])
            var filteredArr = arrToFilterWith.filter(function(e) {
                return this.indexOf(e) < 0;
            }, resToFilterWith)
            console.log("FILTERED ARR", filteredArr);
            var i = 0

            function iterate(movie) {
                console.log(movie);
                
                request(`https://api.themoviedb.org/3/search/movie?api_key=490cd30bbbd167dd3eb65511a8bf2328&query=${movie.replace(new RegExp(' ', 'g'), '%20')}`, {json: true}, (err, res, body) => {
                    if(err) {console.log(err)}
                    console.log("BODY: ", body['results'], movie, `https://api.themoviedb.org/3/search/movie?api_key=490cd30bbbd167dd3eb65511a8bf2328&query=${movie.replace(new RegExp(' ', 'g'), '%20')}`);
                    console.log("BODYY: ", body);
                    
                    if(body != undefined) {
                        var download = function(uri, filename, callback) {
                            request.head(uri, function(err, res, body) {
                                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
                            })
                        }

                        download(`https://image.tmdb.org/t/p/w500${body['results'][0]['backdrop_path']}`, `/home/pi/Desktop/Movies/${movie}/${body['results'][0]['backdrop_path']}`, function(){
                            console.log("done", body['results'][0]['backdrop_path'])
                        }) 
                        download(`https://image.tmdb.org/t/p/w500${body['results'][0]['poster_path']}`, `/home/pi/Desktop/Movies/${movie}/${body['results'][0]['poster_path']}`, function(){
                            console.log("done", body['results'][0]['poster_path'])
                        })
                    
                        request(`https://api.themoviedb.org/3/movie/${body['results'][0]['id']}/credits?api_key=490cd30bbbd167dd3eb65511a8bf2328&language=en-US`, { json: true }, (error, resp, bodyTwo) => {
                            var cast = {
                                acting: bodyTwo['cast'].map(itm => {
                                        return {
                                            name: itm['name'],
                                            character: itm['character']
                                    }
                                }, movie),
                                directing: bodyTwo['crew'].filter(itm => {
                                    if(itm['job'] == "Director") {
                                        return itm
                                    }
                                }, movie)[0]['name']
                            }
                            console.log(cast);
                            if(body['results'][0]['backdrop_path'] != null) {
                                var finalObj = {
                                    title: movie,
                                    cast: JSON.stringify(cast),
                                    overview: body['results'][0]['overview'],
                                    backdrop_path: `http://192.168.4.1:4012/${movie.replace(new RegExp(" ", "g"), "%20")}/${body['results'][0]['poster_path'].replace("/", "")}`,
                                    poster_path: `http://192.168.4.1:4012/${movie.replace(new RegExp(" ", "g"), "%20")}/${body['results'][0]['backdrop_path'].replace("/", "")}`,
                                    movieLocation: `http://192.168.4.1:4012/${movie.replace(new RegExp(" ", "g"), "%20")}/${movie.replace(new RegExp(" ", "g"), "%20")}.m4v`
                                }
                                console.log(finalObj)
                                pool.query(`INSERT INTO movieInfo SET ?`,finalObj, (err,resp) => {
                                    console.log(err, resp);
                                })
                            }
                        })
                    }
                })
                console.log(i,arrToFilterWith.length, filteredArr.length);
                
                if(i + 1 != filteredArr.length) {
                    i += 1
                    iterate(filteredArr[i])
                } 
            }
            console.log(filteredArr);
            if(filteredArr.length !== 0) {
                iterate(filteredArr[i])
            } else {
                pool.query(`SELECT * FROM movieInfo LIMIT 50`, (err, res) => {
                    callback(res)
                })
            }
            })
        },
        getMoreMoviesOnScroll: (selectionToUpdate, callback) => {
            console.log(selectionToUpdate);
            
            pool.query(`SELECT * FROM movieInfo WHERE id > '${selectionToUpdate.id}' LIMIT 50`, (err, res)=>{
                console.log(err, res);
                callback(err, res)
            })
        },
        getTvList: (req, callback) => {
            var arr = []
            var arrOfObj = []
    
            function re() {
                return fs.readdirSync(`/home/pi/Desktop/tvShows`, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent['name'])
            }
            
            var arrToFilterWith = re()
    
            pool.query(`SELECT title FROM tvShowInfo`, (err, res) => {
                
                var resToFilterWith = res.map(itm => itm['title'])
                var filteredArr = arrToFilterWith.filter(function(e) {
                    return this.indexOf(e) < 0;
                }, resToFilterWith)
                // console.log("FILTERED ARR", filteredArr);
                var i = 0
    
                function iterate(tv) {
                    // console.log("MOVIE", movie);
                    
                    request(`https://api.themoviedb.org/3/search/tv?api_key=490cd30bbbd167dd3eb65511a8bf2328&query=${tv.replace(new RegExp(' ', 'g'), '%20')}`, {json: true}, (err, res, body) => {
                        if(err) {console.log(err)}
                        // console.log(body['results'][0], movie);
                        
                        if(body != undefined) {
                            var download = function(uri, filename, callback) {
                                request.head(uri, function(err, res, body) {
                                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
                                })
                            }
                            
                                download(`https://image.tmdb.org/t/p/w500${body['results'][0]['backdrop_path']}`, `/home/pi/Desktop/tvShows/${tv}/${body['results'][0]['backdrop_path']}`, function(){
                                    // console.log("done", body['results'][0]['backdrop_path'])
                                }) 
                                download(`https://image.tmdb.org/t/p/w500${body['results'][0]['poster_path']}`, `/home/pi/Desktop/Movies/${tv}/${body['results'][0]['poster_path']}`, function(){
                                    // console.log("done", body['results'][0]['poster_path'])
                                })
                            
                            request(`https://api.themoviedb.org/3/movie/${body['results'][0]['id']}/credits?api_key=490cd30bbbd167dd3eb65511a8bf2328&language=en-US`, { json: true }, (error, resp, bodyTwo) => {
                                var cast = {
                                    acting: bodyTwo['cast'].map(itm => {
                                            return {
                                                name: itm['name'],
                                                character: itm['character']
                                        }
                                    }, movie),
                                    directing: bodyTwo['crew'].filter(itm => {
                                        if(itm['job'] == "Director") {
                                            return itm
                                        }
                                    }, movie)[0]['name']
                                }
                                // console.log(cast);
                                if(body['results'][0]['backdrop_path'] != null) {
                                    var finalObj = {
                                        title: movie,
                                        cast: JSON.stringify(cast),
                                        overview: body['results'][0]['overview'],
                                        backdrop_path: `http://192.168.4.1:4012/${tv.replace(new RegExp(" ", "g"), "%20")}/${body['results'][0]['poster_path'].replace("/", "")}`,
                                        poster_path: `http://192.168.4.1:4012/${tv.replace(new RegExp(" ", "g"), "%20")}/${body['results'][0]['backdrop_path'].replace("/", "")}`,
                                        movieLocation: `http://192.168.4.1:4012/${tv.replace(new RegExp(" ", "g"), "%20")}/${tv.replace(new RegExp(" ", "g"), "%20")}.m4v`
                                    }
                                    // console.log(finalObj)
                                    pool.query(`INSERT INTO movieInfo SET ?`,finalObj, (err,resp) => {
                                        // console.log(err, resp);
                                    })
                                }
                            })
                        }
                    })
                    console.log(i,arrToFilterWith.length, filteredArr.length);
                    
                    if(i + 1 != filteredArr.length) {
                        i += 1
                        iterate(filteredArr[i])
                    } else {
                        pool.query(`SELECT * FROM movieInfo`, (err, res) => {
                            // console.log(res);
                            callback(res)
                            
                        })
                        
                    }
                }
                iterate(filteredArr[i])
                // console.log(arrToFilterWith);
                
                    
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
    uploadMedia: async (files, callback) => {
        var filesize = files['size']
        console.log("INFO", files, filesize)

        for(var i = 0; i < files.length; i++) {
                var newJob = function() {
                    console.log("MADE IUT", files[i]);
                    var extensionRepalcer = undefined

                    switch(files[i]['mimetype']) {
                        case 'image/jpeg':
                            extensionRepalcer = files[i]['filename'].substr(0, files[i]['filename'].lastIndexOf(".")) + "_thumb.jpeg"
                        case 'image/png':
                            extensionRepalcer = files[i]['filename'].substr(0, files[i]['filename'].lastIndexOf(".")) + "_thumb.png"
                        case 'video/quicktime':
                            extensionRepalcer = files[i]['filename'].substr(0, files[i]['filename'].lastIndexOf(".")) + "_thumb.jpeg"
                        // case 'video/heic':
                        //     extensionRepalcer = files[i]['filename'].substr(0, files[i]['filename'].lastIndexOf(".")) + "_thumb.heic"
                    }
                    
                    console.log("REPALCER: ", extensionRepalcer);
                    
                    var newProc = exec(`ffmpeg -i '/home/pi/Desktop/Media/${files[i]['filename']}' -vf scale=200:-1 /home/pi/Desktop/Media/${extensionRepalcer}`)
                    newProc.on('error', function(err) {
                        console.log("hi", err);
                    })
                    newProc.stdout.on('data', function(data) {
                        console.log("hio", data);
                    })
                    newProc.stderr.on('stderr', function(data) {
                        console.log("hello", data);
                    })
                    newProc.on('close', function(close) {
                        console.log("why", close);
                    })
                    var addedMedia = {
                        location: `http://192.168.4.1:4012/${files[i]['filename'].replace(new RegExp(' ', 'g'), '%20')}`,
                        thumbnail: `http://192.168.4.1:4012/${extensionRepalcer}`,
                        type: files[i]['mimetype']
                    }
                    
                    pool.query('INSERT INTO `photos` SET ?', addedMedia, (error, resp) =>{
                        console.log("III: ", i, files.length);
    
                    })
                }
                await newJob()

            await console.log("done");
            pool.query('SELECT * FROM photos', addedMedia, (error, resp) =>{
                callback(error, resp)
            })
            
            }
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
	
        fs.readdir('/media/pi/USB Drive1', (err, files) =>{
            
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
        const source = `/media/pi/USB Drive1/${itm}`
        const destination = `/home/pi/Desktop/Movies/${itm}`

        fs.mkdir(`/home/pi/Desktop/Movies/${itm}`, (err) => {
                if(err) {
            console.log(err)
                    return err
                }
            })
            var copyMovie = spawn('rsync', ['-r', '--progress', `/media/pi/USB Drive1/${[itm]}`, '/home/pi/Desktop/Movies'])
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
                
                wss.clients.forEach(function each(client) {
                    if(client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(filteredArr[2]))
                    }
                })
            })
            copyMovie.stderr.on('data',(err) => {
                console.log("stderr", err);
                
            })

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
    var newProc = exec('sudo umount /media/pi/USB Drive1/')

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
