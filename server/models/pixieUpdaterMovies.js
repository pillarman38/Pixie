var pool = require("../../config/connections");
let fetch = require("node-fetch");
let i = 0;
let fs = require("fs");
let path = require("path");
const PixieWebSocket = require('../webSocket/socket')
const pixieUpdaterTv = require('./pixieUpdaterTv')
// const { sendMsg } = require("../webSocket/socket");
let connections = [];
let notYetAddedMovies = [];

async function getMoviePoster() {
  fs.existsSync
  const res = await fetch(
    `http://192.168.0.154:4012/MoviePosters/${notYetAddedMovies[i].title}.jpg`
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
      // console.log("Err:", err);
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
    `http://192.168.0.154:4012/MovieCoverArt/${notYetAddedMovies[i].title}.jpg`
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
      // console.log("Err:", err);
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
    console.log("creating movie dir", notYetAddedMovies[i].title);
    await fs.mkdirSync(
      `/home/connor/Desktop/Movies/${notYetAddedMovies[i].title}`
    );
  }
  const res = await fetch(
    `http://192.168.0.154:4012/toPixie/${notYetAddedMovies[i].title}.mp4`
  );
  const fileStream = fs.createWriteStream(
    `/home/connor/Desktop/Movies/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.mp4`
  );

  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );
  await getCoverArt()
      await getMoviePoster()
  // console.log(contentLength);

  let downloadCount = 0;
  let totalBytes = 0;

  return await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", () => {
      // console.log("Err:", err);
      return reject;
    });
    return res.body.on("data", async (data) => {
      totalBytes += Buffer.byteLength(data);
      
      const clients = PixieWebSocket
      
      let downloadComplete = Math.floor((100 * totalBytes) / contentLength);
      // console.log("DOWNLOADING: ", downloadComplete, clients.length);

      const msg = JSON.stringify({
        type: "Downloading",
        title: notYetAddedMovies[i].title,
        percentage: downloadComplete

      })
      clients.send(msg);

      if (downloadComplete === 100) {
        let movieStoreObj = {
          title: notYetAddedMovies[i].title,
          cast: notYetAddedMovies[i].cast || "",
          backgroundPoster: `http://pixie.local:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.jpg`,
          coverArt: `http://pixie.local:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}-poster.jpg`,
          location: `http://pixie.local:4012/${notYetAddedMovies[i].title}/${notYetAddedMovies[i].title}.mp4`,
          overview: notYetAddedMovies[i].overview || "",
          type: "movie",
        };

        pool.query(
          `INSERT INTO movies (title, cast, backgroundPoster, coverArt, location, overview, type)
                SELECT ?, ?, ?, ?, ?, ?, ?
                WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = ?)`,
          [
            movieStoreObj.title,
            movieStoreObj.cast,
            movieStoreObj.backgroundPoster,
            movieStoreObj.coverArt,
            movieStoreObj.location,
            movieStoreObj.overview,
            movieStoreObj.type,
            movieStoreObj.title,
          ],
          async (err, resp) => {
            // await getCoverArt();
            // await getMoviePoster();

            if (i + 1 !== notYetAddedMovies.length) {
              i += 1;
              startTranscoding();
            } else {
              // console.log("Movies done...");
              // getTVShows();
              await pixieUpdaterTv.getTVShows()
            }

            resolve();
          }
        );
      }
      return reject;
    });
  });
}

async function startTranscoding() {
  console.log("TRANSCODE STARTED", notYetAddedMovies.length);
  if (i !== notYetAddedMovies.length) {
    const msg = JSON.stringify({
      backOrFront: "backend",
      title: notYetAddedMovies[i].title,
      type: "movie",
      percentage: undefined,
    })

    const clients = PixieWebSocket
    clients.send(msg);
    // sendMsg(
    //   JSON.stringify({
    //     backOrFront: "backend",
    //     title: notYetAddedMovies[i].title,
    //     type: "movie",
    //     percentage: undefined,
    //   })
    // );
  } 
}

// pixieWs.on('message', async (message) => {
//   message = JSON.parse(message)
//   console.log('Received message from other server:', message);
//   if(message.type === "movie" && message.percentage === 100) {
//     await startDownloading()
//   }
// });

PixieWebSocket.on('message', async (message) => {
  message = JSON.parse(message);
  console.log('Received message from other server movies:', message);

  if (message.type === "movie" && message.percentage === 100) {
    console.log("START downloading");
    await startDownloading(message);
  }
});

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
          // console.log(err, res);
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
  // console.log("SAVED MOVIES:  ", savedMovies);
  if(savedMovies.length > 0) {
    return await new Promise((resolve, reject) => {
      pool.query(`SELECT * FROM movies`, (err, res) => {
        // console.log("ERR RES: ", err, res.length);
        const titles = res.map((itm) => itm.title);
        // console.log("SAVED MOVIES: ", savedMovies);
        if(savedMovies.length > 0) {
          let notSyncedToDB = savedMovies.filter((mov) => !titles.includes(mov));
          // console.log("NOT SYNCED: ", notSyncedToDB, titles.length);
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
            // console.log("SAVING TO DB");
            let movieStoreObj = {
              title: storedButNotSavedToDB[l].title,
              cast: storedButNotSavedToDB[l].cast || '',
              backgroundPoster: `http://pixie.local:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}.jpg`,
              coverArt: `http://pixie.local:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}-poster.jpg`,
              location: `http://pixie.local:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}.mp4`,
              overview: storedButNotSavedToDB[l].overview || "",
              type: "movie"
            };
            pool.query(
              `INSERT INTO movies SET ?`,
              movieStoreObj,
              (er, re) => {
                // console.log(er, re);
                if (l + 1 < storedButNotSavedToDB.length) {
                  l += 1;
                  saveToDB();
                } else {
                  // getTVShows();
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
        }
      });
    });
  } else {
    notYetAddedMovies = pixieMovieList
    return notYetAddedMovies
  }
}

async function getMovieList() {
  let pixableMovieList = []
  const savedMovies = await fs.readdirSync("/home/connor/Desktop/Movies");
  try {
    pixableMovieList = await fetch(
      "http://192.168.0.154:4012/api/mov/movies",
      {
        method: "post",
        body: JSON.stringify({ pid: 0 }),
        headers: { "Content-Type": "application/json" },
      }
    );
    
    pixableMovieList = await pixableMovieList.json();
    // console.log("MOVIE LIST: ", pixableMovieList);
    pixableMovieList = pixableMovieList.map((movie) => {
      return {
        title: movie.title,
        cast: movie.cast,
        overview: movie.overview,
        backgroundPoster: movie.backgroundPoster,
        coverArt: movie.coverArt,
      };
    });
  
    const pixableMovieListTitles = pixableMovieList.map((movie) => movie.title);
    let insersection = savedMovies.filter(
      (mov) => !pixableMovieListTitles.includes(mov)
    );
    // console.log("INTERSECTION: ", insersection, pixableMovieListTitles);
    if (insersection.length > 0) {
      const extraMovies = savedMovies.filter(
        (mov) => !pixableMovieListTitles.includes(mov)
      );
      // console.log(extraMovies);
      removeMovies(extraMovies);
    }
    // console.log("SYNC");
    await syncMoviesDB(pixableMovieList, savedMovies);
    // console.log("NOT YET ADDED: ", notYetAddedMovies);
    notYetAddedMovies = pixableMovieList.filter(
      (itm) => !savedMovies.includes(itm.title)
    );
    // console.log("Missing movies: ", notYetAddedMovies.map(movie => movie.title));
    if(notYetAddedMovies.length > 0) {
      await startTranscoding()
    } else {
      await pixieUpdaterTv.getTVShows()
    }
    
  } catch(err) {
    // console.log(err);
    await syncMoviesDB(pixableMovieList, savedMovies.length);
  }
}

module.exports = { getMovieList }
