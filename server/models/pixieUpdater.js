// const net = require('net')
var pool = require('../../config/connections')
let fetch = require('node-fetch')
let i = 0
let l = 0
let leftovers = []
let fs = require('fs')
let path = require('path')
let moviesModule = require('./movies.models')
var WebSocketClient = require('websocket').client;

async function transcodeIterator() {
    let data = leftovers[i]
    console.log("DAYTAAA: ", data);
    if(data) {
    let req = await fetch(`http://192.168.0.153:4012/api/mov/transcodeMoviesForPixie`,{
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({movie: data})
    })
    let res = await req.json()
    let responseData = await res
    console.log("RESP: ", responseData);
}
}
let why = {
    moviesNeeded: async () => {
        try{
        let movies = await fetch("http://192.168.0.153:4012/api/mov/movies", {
            method: "post",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            //make sure to serialize your JSON body
            body: JSON.stringify({
              pid: 0
            })
          })
        movies = await movies.json()
    
        pool.query(`SELECT title FROM movieInfo`, (err, res) => {
            let resTitles = res.map(itm => itm.title)
            movies = movies.map(itm => itm.title)
            leftovers = movies.filter(itm => !resTitles.includes(itm))
            // console.log(leftovers);
            
        })

    } catch(err) {
        console.log("Not connected to ethernet");
        
    }
    
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log("LEFTOVERS: ", leftovers);
    
    connection.sendUTF(JSON.stringify({
        backOrFront: 'backend',
        type: 'movie',
        video: leftovers[l],
    }))
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', async function(message) {
        var msg = JSON.parse(message.utf8Data)
        // console.log("MSG: ", msg);
        
        if (msg.type === 'utf8') {
            console.log("Received: '" + msg + "'");
        }
        if(msg.type === 'Movie finished transcoding') {
            // connection.close()
            console.log('made it', msg.video)
            
            fs.mkdir(path.join("/home/pi/Desktop/Movies", msg.video), async (err)=>{
                
const replacement = msg.video.replace(new RegExp(' ', 'g'), '%20')
const url = `http://192.168.0.153:4012/toPixie/${msg.video.replace(new RegExp(' ', 'g'), '%20')}/${msg.video.replace(new RegExp(' ', 'g'), '%20')}.mp4`;
console.log("URL: ", url, replacement);

const ress = await fetch(url)
  const fileStream = fs.createWriteStream(`/home/pi/Desktop/Movies/${msg.video}/${msg.video}.mp4`);
  let downloadCount = 0
  await new Promise((resolve, reject) => { 
      ress.body.pipe(fileStream);
      ress.body.on("error", ()=>{
          console.log("Err:", err);
          return reject  
      });
      ress.body.on("data", ()=>{
        // console.log("Err:", err);
        if(downloadCount === 0) {
            connection.sendUTF(JSON.stringify({
                backOrFront: 'backend',
                type: 'Downloading',
                video: leftovers[l],
              }))
        }
        downloadCount = 1
        // return reject  
    });
      fileStream.on("finish", () => {
          console.log("Finished");
          connection.sendUTF(JSON.stringify({
            backOrFront: 'backend',
            type: 'finished downloading',
            video: leftovers[l],
          }))
          
        console.log("Numbers: ",l + 1, leftovers.length);
        
          if(l + 1 !== leftovers.length) {
              l += 1
            connection.sendUTF(JSON.stringify({
                backOrFront: 'backend',
                type: 'movie',
                video: leftovers[l],
            }))
          } else {
            connection.sendUTF(JSON.stringify({
                backOrFront: 'backend',
                type: 'Syncing complete',
                video: leftovers[l],
            }))
            moviesModule.updateMoviesForPixe(leftovers[l])
          }
          
          return resolve
      });
    });
    // await ress.body.pipe(fs.createWriteStream(`/home/pi/Desktop/Movies/${msg.video}/${msg.video}.mp4`))
    
        })
    }
    })
});

client.connect('ws://192.168.0.153:4444/');
    }
}

module.exports = why