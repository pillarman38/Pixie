var fs = require('fs')


let routeFunctions = {
    getMovieList: (req, callback) => {
        var arr = []
        var arrOfObj = []

        fs.readdir('/home/pi/Desktop/Movies', (err, files) =>{
            files.forEach(function getTvInfo(file) {
                
                fs.readdir('/home/pi/Desktop/Movies/' + file, (err, fileTwo) => {
                    console.log(fileTwo.length)
                    var movieObj = {}
                    for(var i = 0; i < fileTwo.length; i++) {
                        if(fileTwo[i].includes(".jpg")) {
                            movieObj['cover'] = `http://192.168.1.30:4012/${file.replace(new RegExp(' ', 'g'), '%20')}/${fileTwo[i].replace(new RegExp(' ', 'g'), '%20')}`
                        }
                        if(fileTwo[i].includes(".m4v")) {
                            movieObj['title'] = fileTwo[i]
                            movieObj['location'] = `http://192.168.1.30:4012/${file.replace(new RegExp(' ', 'g'), '%20')}/${fileTwo[i].replace(new RegExp(' ', 'g'), '%20')}`
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
    }
}
module.exports = routeFunctions