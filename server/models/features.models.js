const util = require('util');
const exec = util.promisify(require('child_process').exec);

function getNetworkList(stdout) {
    const networks = stdout.split("NAME")

    const newNetworksList = []
    for(let i = 0; i < networks.length; i++) {
        networks[i] = networks[i].replace(/:\s*/g, "\n").split(/\r?\n/);

        const freq = parseInt(networks[i][networks[i].indexOf("FREQ") + 1].replace(" MHz", ""))
        let freqStr = ""
        if(freq < 3000) {
            freqStr = "2.4"
        } else {
            freqStr = "5"
        }
        const networkObj = {
            ssid: networks[i][networks[i].indexOf("SSID") + 1],
            signalStrength: networks[i][networks[i].indexOf("BARS") + 1],
            freq: freqStr,
            chan: networks[i][networks[i].indexOf("CHAN") + 1]
        }

        if(networkObj.ssid !== "" && networkObj.ssid !== "--") {
            newNetworksList.push(networkObj)
        }
        
    }
    return newNetworksList
}

let features = {
    getNetworksList: async (callback) => {
        const { stdout, stderr } = await exec('nmcli -m multiline -f ALL dev wifi');
        // console.log(stderr, stdout);
        if(stdout) {
            callback(null, getNetworkList(stdout))
        }

        if (stderr) {
          console.error(`error: ${stderr}`);
          callback(stderr, null)
        }
    },
    connect: async (selectedNetwork, callback) => {
        //sudo nmcli dev wifi connect network-ssid password "network-password"
        const { stdout, stderr } = await exec(`sudo nmcli dev wifi connect "${selectedNetwork.ssid}" password "${selectedNetwork.password}"`);
        
        console.log(stderr, stdout);
        // if(stdout) {
        //     callback(null, getNetworkList(stdout))
        // }

        if (stderr) {
          console.error(`error: ${stderr}`);
          callback(stderr, null)
        }
    },
    ping: (callback) => {
        callback(null, "pinged")
    },
    switchToHotSpot: async () => {
        const { stdout, stderr } = await exec(`sudo nmcli con up Pixie`);
        console.log(stderr, stdout);
    }
}

module.exports = features