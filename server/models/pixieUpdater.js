// const net = require('net')
var pool = require('../../config/connections')
let fetch = require('node-fetch')
let i = 0
let l = 0
let s = 0
let showDirIt = 0
let seasonNum = 0
let leftovers = []
let fs = require('fs')
let path = require('path')
let moviesModule = require('./movies.models')
let WebSocketClient = require('websocket').client
let WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 4015 });

let http = require('http')
var client = new WebSocketClient()
let connections = []
let server;
let wsServer;
let clientConnections = []
let notYetAddedMovies = []
let shows = []
let currentConvertingEp = 0
let currentSeason = 1
let numOfSeasons = 1
let seasons = 0
let episodes = []
let epsToTranscode = []

async function getMoviePoster() {
    const res = await fetch(`http://192.168.0.153:4012/MoviePosters/${notYetAddedMovies[i].title}.jpg`)
    const fileStream = fs.createWriteStream(`/home/pi/Desktop/Movies/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}-poster.jpg`);

    const contentEncoding = res.headers.get('content-encoding');
    const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
    
    let downloadCount = 0
    let totalBytes = 0

    return await new Promise((resolve, reject) => { 
        res.body.pipe(fileStream);
        res.body.on("error", ()=>{
          console.log("Err:", err);
          return reject  
      });
      return res.body.on("data", async (data) => {
          totalBytes += Buffer.byteLength(data)
          let downloadComplete = Math.floor((100 * totalBytes) / contentLength)
            // console.log("Poster: ", downloadComplete);
            
            if(downloadComplete === 100) {
                return resolve()
            }
        return reject  
    });
    })
}

async function getCoverArt() {
    const res = await fetch(`http://192.168.0.153:4012/MovieCoverArt/${notYetAddedMovies[i].title}.jpg`)
    const fileStream = fs.createWriteStream(`/home/pi/Desktop/Movies/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.jpg`);

    const contentEncoding = res.headers.get('content-encoding');
    const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
    
    let downloadCount = 0
    let totalBytes = 0

    return await new Promise((resolve, reject) => { 
        res.body.pipe(fileStream);
        res.body.on("error", ()=>{
          console.log("Err:", err);
          return reject  
      });
      return res.body.on("data", async (data)=>{
          totalBytes += Buffer.byteLength(data)
          let downloadComplete = Math.floor((100 * totalBytes) / contentLength)
            // console.log("DATA: ", downloadComplete);
            
            if(downloadComplete === 100) {
                return resolve()
            }
        return reject  
    });
    })
}

async function startDownloading() {
    // console.log("Downloading: ", notYetAddedMovies[i].title)
    const checkMovieDir = await fs.existsSync(`/home/pi/Desktop/Movies/${notYetAddedMovies[i].title}`);

    if(checkMovieDir === false) {
        await fs.mkdirSync(`/home/pi/Desktop/Movies/${notYetAddedMovies[i].title}`)
    }
    const res = await fetch(`http://192.168.0.153:4012/toPixie/${notYetAddedMovies[i].title}.mp4`)
    const fileStream = fs.createWriteStream(`/home/pi/Desktop/Movies/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.mp4`);

    const contentEncoding = res.headers.get('content-encoding');
    const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
    console.log(contentLength);
    
    let downloadCount = 0
    let totalBytes = 0

    return await new Promise((resolve, reject) => { 
        res.body.pipe(fileStream);
        res.body.on("error", ()=>{
          console.log("Err:", err);
          return reject  
      });
      return res.body.on("data", async (data)=>{
          totalBytes += Buffer.byteLength(data)
          let downloadComplete = Math.floor((100 * totalBytes) / contentLength)
            if(downloadComplete === 100) {
                let movieStoreObj = {
                    title: notYetAddedMovies[i].title,
                    cast: notYetAddedMovies[i].cast || '',
                    backdrop_path: `http://192.168.4.1:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.jpg`,
                    poster_path: `http://192.168.4.1:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}-poster.jpg`,
                    location: `http://192.168.4.1:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.mp4`,
                    overview: notYetAddedMovies[i].overview || '',
                    type: 'movie'
                }
                // console.log("Saving: ", movieStoreObj);

                pool.query(`INSERT INTO movieInfo SET ?`, movieStoreObj, async (err,resp) => {
                    // console.log(err, resp);
                    // console.log("CHECK: ", i + 1, notYetAddedMovies.length);
                    
                    await getCoverArt()
                    await getMoviePoster()

                    if(i + 1 !== notYetAddedMovies.length) {
                        i += 1
                        startTranscoding()
                    } else {
                        console.log('Movies done...');
                        getTVShows()
                    }
                    
                    resolve()
                })
            }
        return reject  
    });
    })
}

async function getSeasonArt(season) {
        const url = `http://192.168.0.153:4012/seasonArt/${epsToTranscode[currentConvertingEp]}-season-${season}.jpg`
        // console.log("URLLL: ", url);

        const res = await fetch(`http://192.168.0.153:4012/seasonArt/${epsToTranscode[currentConvertingEp].title}-season-${season}.jpg`)
        const fileStream = fs.createWriteStream(`/home/pi/Desktop/TV/seasonArt/${epsToTranscode[currentConvertingEp].title}-season-${season}.jpg`)

        const contentEncoding = res.headers.get('content-encoding');
        const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
        // console.log(contentLength);
        let totalBytes = 0

        return await new Promise((resolve, reject) => { 
            res.body.pipe(fileStream);
            res.body.on("error", ()=>{
            console.log("Err:", err);
            return reject  
            });
        return res.body.on("data", async (data)=>{
            totalBytes += Buffer.byteLength(data)
            let downloadComplete = Math.floor((100 * totalBytes) / contentLength)
                // console.log('SEASON PIC: ', downloadComplete);
                
            if(downloadComplete === 100) {
                const seasonObj = {
                    title: epsToTranscode[currentConvertingEp].title,
                    poster: `http://192.168.4.1:4012/seasonArt/${epsToTranscode[currentConvertingEp].title}-season-${season}.jpg`,
                    seasonNum: season
                }
                pool.query(`INSERT INTO seasons SET ?`,seasonObj, (err, res) => {
                    // console.log(err, res);
                    resolve()
                })
            }
            return reject  
        });
    })
}

async function startDownloadingTV(message) {
    // console.log("CURRENT CONVERTING EP: ", epsToTranscode[currentConvertingEp]);
    
    const epToStore = {
        epTitle: message.epTitle,
        location: `http://192.168.4.1:4012/Shows/${message.title}/Season ${message.season}/${message.epTitle}.mp4`.replace(new RegExp(' ', 'g'), '%20'),
        overview: message.overview,
        backdropPhotoUrl: `http://192.168.4.1:4012/epPosters/${epsToTranscode[currentConvertingEp].title}-ep${epsToTranscode[currentConvertingEp].epNumber}.jpg`,
        epNumber: epsToTranscode[currentConvertingEp].epNumber,
        title: epsToTranscode[currentConvertingEp].title,
        season: message.season,
    }
    // console.log("Store: ", epToStore, message);
    
    const checkShowDir = await fs.existsSync(`/media/pi/1AE3D29122E40336/TV/Shows/${epsToTranscode[currentConvertingEp].title}`);
    const cheackSeasonDir = await fs.existsSync(`/media/pi/1AE3D29122E40336/TV/Shows/${epsToTranscode[currentConvertingEp].title}/Season ${message.season}`);

    if(checkShowDir === false) {
        await fs.mkdirSync(`/media/pi/1AE3D29122E40336/TV/Shows/${epsToTranscode[currentConvertingEp].title}`)
    }
    if(cheackSeasonDir === false) {
        await fs.mkdirSync(`/media/pi/1AE3D29122E40336/TV/Shows/${epsToTranscode[currentConvertingEp].title}/Season ${message.season}`);
        await getSeasonArt(message.season)
    }

    pool.query(`INSERT INTO episodes SET ?`, epToStore, async(er, ress) => {
        // console.log('INCOMING: ', er, ress, message);
        
        const res = await fetch(`http://192.168.0.153:4012/toPixie/${message.epTitle}.mp4`)
        const fileStream = fs.createWriteStream(`/media/pi/1AE3D29122E40336/TV/Shows/${epsToTranscode[currentConvertingEp].title}/Season ${message.season}/${message.epTitle}.mp4`);

        const contentEncoding = res.headers.get('content-encoding');
        const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
        // console.log(contentLength);

        let downloadCount = 0
        let totalBytes = 0

        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", ()=>{
            console.log("Err:", err);
            return reject  
        });
        return res.body.on("data", async (data)=>{
            totalBytes += Buffer.byteLength(data)
            let downloadComplete = Math.floor((100 * totalBytes) / contentLength)
            // console.log("DATA: ", downloadComplete);  
            
            if(downloadComplete === 100 && currentConvertingEp + 1 === episodes.length) {
                console.log("Done with show", currentConvertingEp, episodes.length);
                s += 1
                return getShowInfo()
            } 

            if(downloadComplete === 100 && currentConvertingEp + 1 !== episodes.length) {
                // console.log("DOWNLOAD HAS COMPLETED: ");
                
                await getEpCoverArt()
                currentConvertingEp += 1
                await triggerTVTranscode()
            } 
            })
        })
    })
}

async function getEpCoverArt() {
    const res = await fetch(`http://192.168.0.153:4012/epPosters/${epsToTranscode[currentConvertingEp].title}-ep${currentConvertingEp}.jpg`)
    const fileStream = fs.createWriteStream(`/home/pi/Desktop/TV/epPosters/${epsToTranscode[currentConvertingEp].title}-ep${currentConvertingEp}.jpg`)

    const contentEncoding = res.headers.get('content-encoding');
    const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
    // console.log(contentLength);
    let totalBytes = 0

    return await new Promise((resolve, reject) => { 
        res.body.pipe(fileStream);
        res.body.on("error", ()=>{
          console.log("Err:", err);
          return reject  
      });
      return res.body.on("data", async (data) => {
          totalBytes += Buffer.byteLength(data)
          let downloadComplete = Math.floor((100 * totalBytes) / contentLength)
            
            // console.log("Episode poster download: ", downloadComplete);
            
            if(downloadComplete === 100) {
                resolve()
            }
        return reject  
    });
    })
}

async function startTranscoding() {
    if(i + 1 !== notYetAddedMovies.length) {
        connections[0].send(JSON.stringify({
            backOrFront: 'backend',
            title: notYetAddedMovies[i].title,
            type: 'movie',
            percentage: undefined
        }))
    } else {
        getTVShows()
    }
}

async function getTVCoverArt() {
    const res = await fetch(`${epsToTranscode[currentConvertingEp].coverArt}`)
    const fileStream = fs.createWriteStream(`/home/pi/Desktop/TV/coverArt/${epsToTranscode[currentConvertingEp].title}-poster.jpg`);

    const contentEncoding = res.headers.get('content-encoding');
    const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
    // console.log(contentLength);
    
    let downloadCount = 0
    let totalBytes = 0

    return await new Promise((resolve, reject) => { 
        res.body.pipe(fileStream);
        res.body.on("error", ()=>{
          console.log("Err:", err);
          return reject  
      });
      return res.body.on("data", async (data)=>{
          totalBytes += Buffer.byteLength(data)
          let downloadComplete = Math.floor((100 * totalBytes) / contentLength)

            // console.log("Cover: ", downloadComplete);
            
            if(downloadComplete === 100) {
                return resolve()
            }
        return reject  
    });
    })
}

async function getTVPoster() {
    const res = await fetch(`${epsToTranscode[currentConvertingEp].backdropPhotoUrl}`)
    const fileStream = fs.createWriteStream(`/home/pi/Desktop/TV/backdropPosters/${epsToTranscode[currentConvertingEp].title}-poster.jpg`);

    const contentEncoding = res.headers.get('content-encoding');
    const contentLength = res.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
    
    let downloadCount = 0
    let totalBytes = 0

    return await new Promise((resolve, reject) => { 
        res.body.pipe(fileStream);
        res.body.on("error", ()=>{
          console.log("Err:", err);
          return reject  
      });
      return res.body.on("data", async (data)=>{
          totalBytes += Buffer.byteLength(data)
          let downloadComplete = Math.floor((100 * totalBytes) / contentLength)

            if(downloadComplete === 100) {
                // console.log("NUMBAR OF SEASONS: ", numOfSeasons);
                return resolve()
            }
        return reject  
    });
    })
} 

async function filterAlreadyConvertedEps() {
    // console.log("SHOW: ", episodes.map(ep => ep.epTitle));
    return await new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM episodes WHERE title = '${shows[s].title}'`, async (err, res) => {
            // console.log("ALREADY SAVED EPS: ", episodes);
            const epTitles = res.map(ep => ep.epTitle)

            episodes = episodes.filter(ep => {
                if(!epTitles.includes(ep.epTitle)) {
                    return ep
                }
            })

            for(var i = 0; i < episodes.length; i++) {
                epsToTranscode.push(episodes[i])
            }

            // console.log("NOT SAVED EPS TWO: ", epsToTranscode.map(e => e.epTitle));

            // if(episodes.length === 0) {
                // if(s + 1 <= shows.length) {
                    s += 1
                    return await getShowInfo()
                // }
            // }
            resolve()
        })
    })
}

async function getShowInfo() {
    currentConvertingEp = 0
    // currentSeason = 1
    numOfSeasons = 1
    showEpLength = 0
    seasons = []
    episodes = []
    // console.log("SHOWES: ", shows.map(itm => itm.title).length, s);
    if(s !== shows.length) {
        const show = await fetch(`http://192.168.0.153:4012/api/mov/show`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: shows[s].title })
        })
        const showRes = await show.json()
        //   console.log("WHAAAAAAAAAAAA: ", showRes);

        // numOfSeasons = showRes.numOfSeasons
        seasons = showRes.seasonsList
        // showEpLength = showRes.epTotal
        episodes = seasons.map(season => season.episodes).flat()
        
        await filterAlreadyConvertedEps()
        await getTVPoster()
        await getTVCoverArt()
    }
    triggerTVTranscode()
}

async function triggerTVTranscode() {
    // console.log("EP: ", epsToTranscode[currentConvertingEp], i);
    
    connections.forEach(connection => {
        connection.send(JSON.stringify({
            backOrFront: 'backend',
            title: epsToTranscode[currentConvertingEp].epTitle,
            show: epsToTranscode[currentConvertingEp].title,
            type: 'tv',
            filePath: epsToTranscode[currentConvertingEp].filePath,
            // currentConvertingEp,
            season: epsToTranscode[currentConvertingEp].season,
            percentage: undefined
        }))
    })
}

async function getTVShows() {
    shows = await fetch('http://192.168.0.153:4012/api/mov/tv',{
        method: "post",
        body: JSON.stringify({pid: 0}),
        headers: { "Content-Type": "application/json" }
    })
    shows = await shows.json()

    // console.log("TV SHOW LIST: ", shows.map(itm => itm.title));
    // await addDirs()
    getShowInfo()
}

function wsConnection() {
    // getMovieList()
    async function getMovieList() {
        const pixieList = await fs.readdirSync(`/home/pi/Desktop/Movies`)
        
        let pixableMovieList = await fetch('http://192.168.0.153:4012/api/mov/movies',{
            method: "post",
            body: JSON.stringify({pid: 0}),
            headers: { "Content-Type": "application/json" }
        })
        pixableMovieList = await pixableMovieList.json()
        pixableMovieList = pixableMovieList.map((movie) => {
            return {
                title: movie.title,
                cast: movie.cast,
                overview: movie.overview,
                backdrop_path: movie.backdrop_path,
                poster_path: movie.poster_path
            }
        })

        // pixableMovieList = pixableMovieList.map(mov => mov.title)
        // console.log('MOVIES: ', pixableMovieList);
        console.log("PIXIE MOVIES: ", pixieList);
        
        notYetAddedMovies = pixableMovieList.filter(mov => {
            if(!pixieList.includes(mov.title)) {
                return mov
            }
        })
        console.log('Missing movies: ', notYetAddedMovies);  
    }
// getMovieList()
        wss.on('connection', ws => {
            clientConnections.push(ws)
            console.log('New client connected!')
            ws.send(JSON.stringify('connection established'))
            ws.on('close', () => console.log('Client has disconnected!'))
            ws.on('message', data => {
              wss.clients.forEach(client => {
                console.log(`distributing message: ${data}`)
                client.send(`${data}`)
              })
            })
            ws.onerror = function () {
              console.log('websocket error')
            }
        })

        client.connect('http://192.168.0.153:4444')
            client.on(`connectFailed`, function(err) {
            console.log('Websocket connection error' + err)
        })

        client.on('connect', async function(connection) {
            console.log('Connected to websocket server!', connections.length);
            connections.push(connection)
            await getMovieList()
            console.log("FIRST MOVIE: ", notYetAddedMovies[i].title);
            
            startTranscoding()

            connection.on('message', async (message) => {
                message = JSON.parse(message.utf8Data)
                // console.log("A message: ", message);

                if(message.type === 'movie') {
                    clientConnections.forEach((connection) => {
                        connection.send(JSON.stringify({
                            backOrFront: 'backend',
                            type: 'Syncing',
                            title: notYetAddedMovies[i].title,
                            percentDone: message.percentDone,
                            video: leftovers[l],
                          }))
                    })
                }

                if(message.type === 'tv') {
                    // triggerTVTranscode()
                }
                
                if(message.percentDone === 100 && message.type === 'movie') {
                    console.log("Start the download", message);
                    startDownloading()
                }
                if(message.percentDone === 100 && message.type === 'tv') {
                    console.log("Start the download for TV: ", message);
                    startDownloadingTV(message)
                }
            })
        })
}

module.exports = wsConnection