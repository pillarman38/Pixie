// const net = require('net')
var pool = require("../../config/connections");
let fetch = require("node-fetch");
let i = 0;
let l = 0;
let s = 0;
let showDirIt = 0;
let seasonNum = 0;
let leftovers = [];
let fs = require("fs");
let path = require("path");
let moviesModule = require("./movies.models");
let WebSocketClient = require("websocket").client;
let WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 4015 });

let http = require("http");
const { not } = require("@angular/compiler/src/output/output_ast");
var client = new WebSocketClient();
let connections = [];
let server;
let wsServer;
let clientConnections = [];
let notYetAddedMovies = [];
let shows = [];
let currentConvertingEp = 0;
let currentSeason = 1;
let numOfSeasons = 1;
let seasons = 0;
let episodes = [];
let epsToTranscode = [];

async function getMoviePoster() {
  const res = await fetch(
    `http://192.168.0.153:4012/MoviePosters/${notYetAddedMovies[i].title}.jpg`
  );
  const fileStream = fs.createWriteStream(
    `/home/connor/Desktop/Movies/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}-poster.jpg`
  );

  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );

  let downloadCount = 0;
  let totalBytes = 0;

  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", () => {
      console.log("Err:", err);
      return reject;
    });
    return res.body.on("data", async (data) => {
      totalBytes += Buffer.byteLength(data);
      let downloadComplete = Math.floor((100 * totalBytes) / contentLength);
      // console.log("Poster: ", downloadComplete);

      if (downloadComplete === 100) {
        return resolve();
      }
      return reject;
    });
  });
}

async function getCoverArt() {
  const res = await fetch(
    `http://192.168.0.153:4012/MovieCoverArt/${notYetAddedMovies[i].title}.jpg`
  );
  const fileStream = fs.createWriteStream(
    `/home/connor/Desktop/Movies/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.jpg`
  );

  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );

  let downloadCount = 0;
  let totalBytes = 0;

  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", () => {
      console.log("Err:", err);
      return reject;
    });
    return res.body.on("data", async (data) => {
      totalBytes += Buffer.byteLength(data);
      let downloadComplete = Math.floor((100 * totalBytes) / contentLength);
      // console.log("DATA: ", downloadComplete);

      if (downloadComplete === 100) {
        return resolve();
      }
      return reject;
    });
  });
}

async function startDownloading() {
  // console.log("Downloading: ", notYetAddedMovies[i].title)
  const checkMovieDir = await fs.existsSync(
    `/home/connor/Desktop/Movies/${notYetAddedMovies[i].title}`
  );

  if (checkMovieDir === false) {
    await fs.mkdirSync(
      `/home/connor/Desktop/Movies/${notYetAddedMovies[i].title}`
    );
  }
  const res = await fetch(
    `http://192.168.0.153:4012/toPixie/${notYetAddedMovies[i].title}.mp4`
  );
  const fileStream = fs.createWriteStream(
    `/home/connor/Desktop/Movies/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.mp4`
  );

  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );
  console.log(contentLength);

  let downloadCount = 0;
  let totalBytes = 0;

  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", () => {
      console.log("Err:", err);
      return reject;
    });
    return res.body.on("data", async (data) => {
      totalBytes += Buffer.byteLength(data);
      let downloadComplete = Math.floor((100 * totalBytes) / contentLength);
      if (downloadComplete === 100) {
        let movieStoreObj = {
          title: notYetAddedMovies[i].title,
          cast: notYetAddedMovies[i].cast || "",
          backdropPath: `http://192.168.0.64:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.jpg`,
          posterPath: `http://192.168.0.64:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}-poster.jpg`,
          location: `http://192.168.0.64:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.mp4`,
          overview: notYetAddedMovies[i].overview || "",
          type: "movie",
        };

        pool.query(
          `INSERT INTO movies (title, cast, backdropPath, posterPath, location, overview, type)
                SELECT ?, ?, ?, ?, ?, ?, ?
                WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = ?)`,
          [
            movieStoreObj.title,
            movieStoreObj.cast,
            movieStoreObj.backdropPath,
            movieStoreObj.posterPath,
            movieStoreObj.location,
            movieStoreObj.overview,
            movieStoreObj.type,
            movieStoreObj.title,
          ],
          async (err, resp) => {
            await getCoverArt();
            await getMoviePoster();

            if (i + 1 !== notYetAddedMovies.length) {
              i += 1;
              startTranscoding();
            } else {
              console.log("Movies done...");
              getTVShows();
            }

            resolve();
          }
        );
      }
      return reject;
    });
  });
}

async function saveSeasonToDB() {
  const seasonFetch = await fetch("http://192.168.0.153:4012/api/mov/season", {
    method: "post",
    body: JSON.stringify({
      show: epsToTranscode[currentConvertingEp].title,
      season: epsToTranscode[currentConvertingEp].season,
    }),
    headers: { "Content-Type": "application/json" },
  });
  let seasonInfo = await seasonFetch.json();

  pool.query(`INSERT INTO seasons SET ?`, seasonInfo[0], (err, res) => {
    console.log(err, res);
  });
}

async function startDownloadingTV(message) {
  const epToStore = {
    epTitle: message.epTitle,
    location:
      `http://192.168.0.64:4012/Shows/${message.title}/Season ${message.season}/${message.epTitle}.mp4`.replace(
        new RegExp(" ", "g"),
        "%20"
      ),
    overview: message.overview,
    backdropPhotoUrl: epsToTranscode[currentConvertingEp].backdropPhotoUrl,
    epNumber: epsToTranscode[currentConvertingEp].epNumber,
    title: epsToTranscode[currentConvertingEp].title,
    season: message.season,
  };

  const checkShowDir = await fs.existsSync(
    `/media/connor/X9 Pro/TV/Shows/${epsToTranscode[currentConvertingEp].title}`
  );
  const cheackSeasonDir = await fs.existsSync(
    `/media/connor/X9 Pro/TV/Shows/${epsToTranscode[currentConvertingEp].title}/Season ${message.season}`
  );

  if (checkShowDir === false) {
    await fs.mkdirSync(
      `/media/connor/X9 Pro/TV/Shows/${epsToTranscode[currentConvertingEp].title}`
    );
  }
  if (cheackSeasonDir === false) {
    await fs.mkdirSync(
      `/media/connor/X9 Pro/TV/Shows/${epsToTranscode[currentConvertingEp].title}/Season ${message.season}`
    );
    await saveSeasonToDB();
  }

  pool.query(`INSERT INTO episodes SET ?`, epToStore, async (er, ress) => {
    // console.log('INCOMING: ', er, ress, message);

    const res = await fetch(
      `http://192.168.0.153:4012/toPixie/${message.epTitle}.mp4`
    );
    const fileStream = fs.createWriteStream(
      `/media/connor/X9 Pro/TV/Shows/${epsToTranscode[currentConvertingEp].title}/Season ${message.season}/${message.epTitle}.mp4`
    );

    const contentEncoding = res.headers.get("content-encoding");
    const contentLength = res.headers.get(
      contentEncoding ? "x-file-size" : "content-length"
    );
    // console.log(contentLength);

    let downloadCount = 0;
    let totalBytes = 0;

    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", () => {
        console.log("Err:", err);
        return reject;
      });
      return res.body.on("data", async (data) => {
        totalBytes += Buffer.byteLength(data);
        let downloadComplete = Math.floor((100 * totalBytes) / contentLength);
        // console.log("DATA: ", downloadComplete);

        if (
          downloadComplete === 100 &&
          currentConvertingEp + 1 !== epsToTranscode.length
        ) {
          await getEpCoverArt();

          // filterAlreadyConvertedEps()
          currentConvertingEp += 1;
          await triggerTVTranscode();
        }
      });
    });
  });
}

async function getEpCoverArt() {
  const res = await fetch(epsToTranscode[currentConvertingEp].backdropPhotoUrl);
  const fileStream = fs.createWriteStream(
    `/media/connor/X9 Pro/TV/epPosters/${epsToTranscode[currentConvertingEp].title}-ep${currentConvertingEp}.jpg`
  );

  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );
  // console.log(contentLength);
  let totalBytes = 0;

  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", () => {
      console.log("Err:", err);
      return reject;
    });
    return res.body.on("data", async (data) => {
      totalBytes += Buffer.byteLength(data);
      let downloadComplete = Math.floor((100 * totalBytes) / contentLength);

      // console.log("Episode poster download: ", downloadComplete);

      if (downloadComplete === 100) {
        resolve();
      }
      return reject;
    });
  });
}

async function startTranscoding() {
  if (i !== notYetAddedMovies.length) {
    connections[0].send(
      JSON.stringify({
        backOrFront: "backend",
        title: notYetAddedMovies[i].title,
        type: "movie",
        percentage: undefined,
      })
    );
  } else {
    getTVShows();
  }
}

async function getTVCoverArt(title, coverArtUrl) {
  const res = await fetch(coverArtUrl);
  const fileStream = fs.createWriteStream(
    `/media/connor/X9 Pro/TV/Shows/${title}/${title}.jpg`
  );

  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );
  // console.log(contentLength);

  let downloadCount = 0;
  let totalBytes = 0;

  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", () => {
      console.log("Err:", err);
      return reject;
    });
    return res.body.on("data", async (data) => {
      totalBytes += Buffer.byteLength(data);
      let downloadComplete = Math.floor((100 * totalBytes) / contentLength);

      // console.log("Cover: ", downloadComplete);

      if (downloadComplete === 100) {
        return resolve();
      }
      return reject;
    });
  });
}

async function getTVPoster(title, backdropPhotoUrl) {
  const res = await fetch(backdropPhotoUrl);
  const fileStream = fs.createWriteStream(
    `/media/connor/X9 Pro/TV/Shows/${title}/${title}-poster.jpg`
  );

  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );

  let downloadCount = 0;
  let totalBytes = 0;

  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", () => {
      console.log("Err:", err);
      return reject;
    });
    return res.body.on("data", async (data) => {
      totalBytes += Buffer.byteLength(data);
      let downloadComplete = Math.floor((100 * totalBytes) / contentLength);
      console.log("DOWNLOADING IMAGE: ", downloadComplete);
      if (downloadComplete === 100) {
        console.log("DOWNLOAD COMPLETE: ", downloadComplete);
        return resolve();
      }
      return reject;
    });
  });
}

// async function filterAlreadyConvertedEps() {
//     const index = epsToTranscode.indexOf(currentConvertingEp);
//     if (index > -1) { // only splice array when item is found
//         epsToTranscode.splice(index, 1); // 2nd parameter means remove one item only
//     }
// }

async function triggerTVTranscode() {
  connections.forEach((connection) => {
    connection.send(
      JSON.stringify({
        backOrFront: "backend",
        title: epsToTranscode[currentConvertingEp].epTitle,
        show: epsToTranscode[currentConvertingEp].title,
        type: "tv",
        filePath: epsToTranscode[currentConvertingEp].filePath,
        // currentConvertingEp,
        season: epsToTranscode[currentConvertingEp].season,
        percentage: undefined,
      })
    );
  });
}

async function syncTVShows(showsFromPixable, savedShows) {
  return await new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM shows`, async (err, res) => {
      const titles = showsFromPixable.map((itm) => itm.title);
      let notSyncedToDB = showsFromPixable.filter(
        (mov) => !savedShows.includes(mov.title)
      );
      let dbTitles = res.map((itm) => itm.title);

      let storedButNotSavedToDB = [];

      for (let i = 0; i < showsFromPixable.length; i++) {
        if (!dbTitles.includes(showsFromPixable[i].title)) {
          storedButNotSavedToDB.push(showsFromPixable[i]);
        }
      }

      function rmDuplicates(array) {
        let newArray = [];
        let uniqueObject = {};

        for (let i in array) {
          objTitle = array[i]["title"];
          uniqueObject[objTitle] = array[i];
        }

        for (i in uniqueObject) {
          newArray.push(uniqueObject[i]);
        }

        return newArray;
      }

      storedButNotSavedToDB = rmDuplicates(storedButNotSavedToDB);
      let l = 0;
      async function saveToDB() {
        let showStoreObj = {
          title: storedButNotSavedToDB[l].title,
          // cast: storedButNotSavedToDB[l].cast || '',
          backdropPath: `http://192.168.0.64:4012/Shows/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}-poster.jpg`,
          posterPath: `http://192.168.0.64:4012/Shows/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}.jpg`,
          location: `http://192.168.0.64:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}.mp4`,
          overview: storedButNotSavedToDB[l].overview || "",
          type: "show",
        };
        if (
          !fs.existsSync(
            `/media/connor/X9 Pro/TV/Shows/${storedButNotSavedToDB[l].title}`
          )
        ) {
          await fs.mkdirSync(
            `/media/connor/X9 Pro/TV/Shows/${storedButNotSavedToDB[l].title}`
          );
        }

        await getTVPoster(
          storedButNotSavedToDB[l].title,
          `http://192.168.0.153:4012/tvPosters/${storedButNotSavedToDB[l].title}.jpg`
        );
        await getTVCoverArt(
          storedButNotSavedToDB[l].title,
          `http://192.168.0.153:4012/tvCoverArt/${storedButNotSavedToDB[l].title}.jpg`
        );
        pool.query(`INSERT INTO shows SET ?`, showStoreObj, async (er, re) => {
          console.log(er, re);
          if (l + 1 < storedButNotSavedToDB.length) {
            l += 1;
            await saveToDB();
          } else {
            resolve();
          }
        });
      }
      if (l < storedButNotSavedToDB.length) {
        await saveToDB();
      } else {
        await syncEps();
        resolve();
      }
      console.log(storedButNotSavedToDB);
    });
  });
}

async function syncEps() {
  const shows = await fs.readdirSync(`/media/connor/X9 Pro/TV/Shows`);
  let i = 0;
  let dirPath = `/media/connor/X9 Pro/TV/Shows/`;
  let epsOnOPixie = [];

  function readAllFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      if (file.isDirectory()) {
        readAllFiles(path.join(dir, file.name));
      } else {
        epsOnOPixie.push(file.name.split(".").slice(0, -1).join("."));
      }
    }
  }

  readAllFiles(dirPath);
  let epsFromPixable = await fetch(`http://192.168.0.153:4012/api/mov/eplist`);
  epsFromPixable = await epsFromPixable.json();
  let pixableTitlesOnly = epsFromPixable.map((ep) => ep.epTitle);

  epsToTranscode = epsFromPixable.filter(
    (x) => !epsOnOPixie.includes(x.epTitle)
  );
  if (epsToTranscode.length > 0) {
    triggerTVTranscode();
  }
}

async function getTVShows() {
  shows = await fetch("http://192.168.0.153:4012/api/mov/tv", {
    method: "post",
    body: JSON.stringify({ pid: 0 }),
    headers: { "Content-Type": "application/json" },
  });
  shows = await shows.json();

  const savedTVShows = await fs.readdirSync("/media/connor/X9 Pro/TV/Shows");
  await syncTVShows(shows, savedTVShows);
}

function removeMovies(extraMovies) {
  let extramoviesdirs = extraMovies.map((mov) => {
    return { title: mov, dir: `/home/connor/Desktop/Movies/${mov}` };
  });
  let directoryPath = undefined;
  let i = 0;

  function recursive() {
    directoryPath = extramoviesdirs[i].dir;
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file, index) => {
        const curPath = path.join(directoryPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          recursive();
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });

      pool.query(
        `DELETE FROM movies WHERE title = '${extramoviesdirs[i].title}'`,
        (err, res) => {
          console.log(err, res);
          i += 1;
          fs.rmdirSync(directoryPath);
          if (i + 1 < extramoviesdirs.length) {
            recursive();
          }
        }
      );
    }
  }

  if (extramoviesdirs.length > 0) {
    recursive();
  }
}

async function syncMoviesDB(pixieMovieList, savedMovies) {
  return await new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM movies`, (err, res) => {
      const titles = res.map((itm) => itm.title);
      let notSyncedToDB = savedMovies.filter((mov) => !titles.includes(mov));

      let storedButNotSavedToDB = [];

      for (let l = 0; l < pixieMovieList.length; l++) {
        if (notSyncedToDB.includes(pixieMovieList[l].title)) {
          storedButNotSavedToDB.push(pixieMovieList[l]);
        }
      }

      function rmDuplicates(array) {
        let newArray = [];
        let uniqueObject = {};

        for (let m in array) {
          objTitle = array[m]["title"];
          uniqueObject[objTitle] = array[m];
        }

        for (m in uniqueObject) {
          newArray.push(uniqueObject[m]);
        }

        return newArray;
      }

      storedButNotSavedToDB = rmDuplicates(storedButNotSavedToDB);
      let l = 0;
      function saveToDB() {
        let movieStoreObj = {
          title: storedButNotSavedToDB[l].title,
          cast: storedButNotSavedToDB[l].cast || '',
          backdropPath: `http://192.168.0.64:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}.jpg`,
          posterPath: `http://192.168.0.64:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}-poster.jpg`,
          location: `http://192.168.0.64:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}.mp4`,
          overview: storedButNotSavedToDB[l].overview || "",
        };
        pool.query(
          `INSERT INTO movies SET ?`,
          movieStoreObj,
          (er, re) => {
            console.log(er, re);
            if (l + 1 < storedButNotSavedToDB.length) {
              l += 1;
              saveToDB();
            } else {
              getTVShows();
              resolve();
            }
          }
        );
      }
      if (l < storedButNotSavedToDB.length) {
        saveToDB();
      } else {
        resolve();
      }
    });
  });
}

async function wsConnection() {
  let pixableMovieList = []
  const savedMovies = await fs.readdirSync("/home/connor/Desktop/Movies");
  async function getMovieList() {
    try {
      pixableMovieList = await fetch(
        "http://192.168.0.153:4012/api/mov/movies",
        {
          method: "post",
          body: JSON.stringify({ pid: 0 }),
          headers: { "Content-Type": "application/json" },
        }
      );
      pixableMovieList = await pixableMovieList.json();
      pixableMovieList = pixableMovieList.map((movie) => {
        return {
          title: movie.title,
          cast: movie.cast,
          overview: movie.overview,
          backdropPath: movie.backdropPath,
          posterPath: movie.posterPath,
        };
      });
      
      const pixableMovieListTitles = pixableMovieList.map((movie) => movie.title);
      let insersection = savedMovies.filter(
        (mov) => !pixableMovieListTitles.includes(mov)
      );
      if (insersection.length >= 1) {
        const extraMovies = savedMovies.filter(
          (mov) => !pixableMovieListTitles.includes(mov)
        );
        console.log(extraMovies);
        removeMovies(extraMovies);
      }
      await syncMoviesDB(pixableMovieList, savedMovies);
      notYetAddedMovies = pixableMovieList.filter(
        (itm) => !savedMovies.includes(itm.title)
      );
      console.log("Missing movies: ", notYetAddedMovies);
    } catch(err) {
      console.log(err);
      await syncMoviesDB(pixableMovieList, savedMovies);
    }
  }

  await getMovieList();

  wss.on("connection", (ws) => {
    clientConnections.push(ws);
    console.log("New client connected!");
    ws.send(JSON.stringify("connection established"));
    ws.on("close", () => console.log("Client has disconnected!"));
    ws.on("message", (data) => {
      wss.clients.forEach((client) => {
        console.log(`distributing message: ${data}`);
        client.send(`${data}`);
      });
    });
    ws.onerror = function () {
      console.log("websocket error");
    };
  });

  client.connect("http://192.168.0.153:4444");
  client.on(`connectFailed`, function (err) {
    console.log("Websocket connection error" + err);
  });

  client.on("connect", async function (connection) {
    console.log("Connected to websocket server!", connections.length);
    connections.push(connection);
    
    startTranscoding();

    connection.on("message", async (message) => {
      message = JSON.parse(message.utf8Data);

      if (message.type === "movie") {
        clientConnections.forEach((connection) => {
          connection.send(
            JSON.stringify({
              backOrFront: "backend",
              type: "Syncing",
              title: notYetAddedMovies[i].title,
              percentDone: message.percentDone,
              video: leftovers[l],
            })
          );
        });
      }

      if (message.percentDone === 100 && message.type === "movie") {
        console.log("Start the download", message);
        startDownloading();
      }
      if (message.percentDone === 100 && message.type === "tv") {
        console.log("Start the download for TV: ", message);
        startDownloadingTV(message);
      }
    });
  });
}

module.exports = wsConnection;
