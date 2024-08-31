var pool = require("../../config/connections");
let fetch = require("node-fetch");
let fs = require("fs");
let path = require("path");
const PixieWebSocket = require('../webSocket/socket')

let shows = [];
let currentConvertingEp = 0;
let epsToTranscode = [];

async function getSeasonArt(ep) {
  console.log("EP: ", ep);
  const res = await fetch(`http://192.168.0.154:4012/seasonArt/${ep.title}-season-${ep.season}`);
  const contentEncoding = res.headers.get("content-encoding");
  const contentLength = res.headers.get(
    contentEncoding ? "x-file-size" : "content-length"
  );
  console.log("SEASONART: ");
  const fileStream = fs.createWriteStream(
    `/mnt/usb0/TV/seasonArtWork/${ep.title}-s${ep.season}.jpg`
  );
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
        resolve();
      }
      return reject;
    });
  });
}

async function saveSeasonToDB() {
  // const seasonFetch = await fetch("http://192.168.0.154:4012/api/mov/season", {
  //   method: "post",
  //   body: JSON.stringify({
  //     show: epsToTranscode[currentConvertingEp].title,
  //     season: epsToTranscode[currentConvertingEp].season,
  //   }),
  //   headers: { "Content-Type": "application/json" },
  // });

  // let seasonInfo = await seasonFetch.json();
  if(epsToTranscode[currentConvertingEp]) {
    await getSeasonArt(epsToTranscode[currentConvertingEp])

    let seasonInfo = {
      show: epsToTranscode[currentConvertingEp].title,
      season: epsToTranscode[currentConvertingEp].season,
      seasonArt: `http://pixie.local:4012/seasonArt/`
    }

    console.log("SEASON INFO: ", seasonInfo);
    pool.query(`INSERT INTO seasons SET ?`, seasonInfo, (err, res) => {
      console.log(err, res);
    });
  }
}

async function getEpCoverArt() {
  const ep = epsToTranscode[currentConvertingEp]
  console.log("EP: ", ep);
  const backdropPhotoUrl = `http://192.168.0.154:4012/epPosters/${ep.title}-ep${ep.epNumber}-s${ep.season}.jpg`
  console.log("CONVER URLS: ", backdropPhotoUrl);
  const res = await fetch(backdropPhotoUrl);

  const fileStream = fs.createWriteStream(
    `/mnt/usb0/TV/epArtWork/${ep.title}-ep${ep.epNumber}-s${ep.season}.jpg`
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

      if (downloadComplete === 100) {
        resolve();
      }
      return reject;
    });
  });
}

// async function startTranscoding() {
//   if (i !== notYetAddedMovies.length) {
//     connections[0].send(
//       JSON.stringify({
//         backOrFront: "backend",
//         title: notYetAddedMovies[i].title,
//         type: "movie",
//         percentage: undefined,
//       })
//     );
//   } 
// }

async function getTVCoverArt(title, coverArtUrl) {
  const res = await fetch(coverArtUrl);
  const fileStream = fs.createWriteStream(
    `/mnt/usb0/TV/coverArt/${title}.jpg`
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
    `/mnt/usb0/TV/backdropArt/${title}-poster.jpg`
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

function recieveMsg(msg) {
  console.log(msg);
}

async function startDownloadingTV(ep) {
  console.log("EP ep: ", ep);
  const epToStore = {
    epTitle: ep.epTitle,
    location:
      `http://pixie.local:4012/shows/${ep.title}/Season ${ep.season}/${ep.epTitle}.mp4`.replace(
        new RegExp(" ", "g"),
        "%20"
      ),
    overview: ep.overview,
    backdropPhotoUrl: `http://pixie.local:4012/epArtWork/${ep.title}-ep${ep.epNumber}-s${ep.season}.jpg`,
    epNumber: ep.epNumber,
    showTitle: ep.title,
    season: ep.season,
  };

  const checkShowDir = await fs.existsSync(
    `/mnt/usb0/TV/shows/${ep.title}`
  );
  const cheackSeasonDir = await fs.existsSync(
    `/mnt/usb0/TV/shows/${ep.title}/Season ${ep.season}`
  );

  if (checkShowDir === false) {
    console.log("DIR DOES NOT EXIST: ", checkShowDir);
    await fs.mkdirSync(
      `/mnt/usb0/TV/shows/${ep.title}`
    );
  }
  if (cheackSeasonDir === false) {
    console.log("DIR DOES NOT EXIST: ", checkShowDir);
    await fs.mkdirSync(
      `/mnt/usb0/TV/shows/${ep.title}/Season ${ep.season}`
    );
    await saveSeasonToDB();
  }

  pool.query(`INSERT INTO episodes SET ?`, epToStore, async (er, ress) => {
    console.log('INCOMING: ', er, ress, ep);

    const res = await fetch(
      `http://192.168.0.154:4012/toPixie/${ep.epTitle}.mp4`
    );
    const fileStream = fs.createWriteStream(
      `/mnt/usb0/TV/shows/${ep.title}/Season ${ep.season}/${ep.epTitle}.mp4`
    );

    const contentEncoding = res.headers.get("content-encoding");
    const contentLength = res.headers.get(
      contentEncoding ? "x-file-size" : "content-length"
    );

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

        const clients = PixieWebSocket
        const msg = JSON.stringify({
          type: "Downloading",
          title: ep.epTitle,
          percentage: downloadComplete
  
        })
        clients.send(msg);
        
        if (
          downloadComplete === 100 &&
          currentConvertingEp + 1 !== epsToTranscode.length
        ) {
          await getEpCoverArt();

          filterAlreadyConvertedEps()
          currentConvertingEp += 1;
          await triggerTVTranscode();
        }
      });
    });
  });
}

async function filterAlreadyConvertedEps() {
    const index = epsToTranscode.indexOf(currentConvertingEp);
    if (index > -1) { // only splice array when item is found
      epsToTranscode.splice(index, 1); // 2nd parameter means remove one item only
    }
}

PixieWebSocket.on('message', async (message) => {
  message = JSON.parse(message);
  console.log('Received message from other server:', message);

  if (message.type === "movie") {
    // await movies.startDownloading();
  }
  if (message.type === "tv" && message.percentage === 100) {
    await startDownloadingTV(message);
  }
});


async function triggerTVTranscode() {
  console.log("TRANSCODE EP: ", epsToTranscode[currentConvertingEp])
  
  const clients = PixieWebSocket
  const msg = {
    backOrFront: "backend",
    title: epsToTranscode[currentConvertingEp].epTitle,
    show: epsToTranscode[currentConvertingEp].title,
    type: "tv",
    filePath: epsToTranscode[currentConvertingEp].filePath,
    season: epsToTranscode[currentConvertingEp].season,
    percentage: undefined,
    epNumber: epsToTranscode[currentConvertingEp].epNumber
  }
  // console.log("CLIENTS: LENGTH: ", clients);

  clients.send(JSON.stringify(msg));
}

let season = 0
function createSeasonDirs(show) {
  // console.log("SHOW: ", show);
  if (!fs.existsSync(`/mnt/usb0/TV/${show.title}/Season ${season + 1}`)) {
    // Create the directory
    // fs.mkdirSync(`/mnt/usb0/TV/${show.title}/Season ${season + 1}`, { recursive: true });
    console.log('Directory created successfully!');
  } 
  console.log("SEASON ITERATION: ", season, show.numberOfSeasons);
  if(season + 1 < show.numberOfSeasons) {
    season += 1
    console.log("SEASON INCREMENT: ", season);
    createSeasonDirs(show)
  } else {
    season = 0
  }
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
          backgroundPoster: `http://pixie.local:4012/backdropArt/${storedButNotSavedToDB[l].title}-poster.jpg`,
          coverArt: `http://pixie.local:4012/coverArt/${storedButNotSavedToDB[l].title}.jpg`,
          // location: `http://pixie.local:4012/${storedButNotSavedToDB[l].title}/${storedButNotSavedToDB[l].title}.mp4`,
          overview: storedButNotSavedToDB[l].overview || "",
          type: "show",
        };
        if (
          !fs.existsSync(
            `/mnt/usb0/TV/shows/${storedButNotSavedToDB[l].title}`
          )
        ) {
          await fs.mkdirSync(
            `/mnt/usb0/TV/shows/${storedButNotSavedToDB[l].title}`
          );
        }

        await getTVPoster(
          storedButNotSavedToDB[l].title,
          `http://192.168.0.154:4012/tvPosters/${storedButNotSavedToDB[l].title}.jpg`
        );
        await getTVCoverArt(
          storedButNotSavedToDB[l].title,
          `http://192.168.0.154:4012/tvCoverArt/${storedButNotSavedToDB[l].title}.jpg`
        );
        createSeasonDirs(storedButNotSavedToDB[l])
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
  const shows = await fs.readdirSync(`/mnt/usb0/TV`);
  let i = 0;
  let dirPath = `/mnt/usb0/TV/`;
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
  let epsFromPixable = await fetch(`http://192.168.0.154:4012/api/mov/eplist`);
  epsFromPixable = await epsFromPixable.json();
  // console.log(epsFromPixable);
  let pixableTitlesOnly = epsFromPixable.map((ep) => ep.epTitle);

  epsToTranscode = epsFromPixable.filter(
    (x) => !epsOnOPixie.includes(x.epTitle)
  );
  // console.log(epsToTranscode);
  if (epsToTranscode.length > 0) {
    triggerTVTranscode();
  }
}

async function getTVShows() {
  shows = await fetch("http://192.168.0.154:4012/api/mov/tv", {
    method: "post",
    body: JSON.stringify({ pid: 0 }),
    headers: { "Content-Type": "application/json" },
  });
  shows = await shows.json();

  const savedTVShows = await fs.readdirSync("/mnt/usb0/TV");
  await syncTVShows(shows, savedTVShows);
  await syncEps()
}

module.exports = { getTVShows, recieveMsg }
