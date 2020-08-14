let express = require('express')
let router = express.Router()
let models = require('../models/movies.models')
let multer = require('multer')

let photoPath = "/home/pi/Desktop/Media"

var storage = multer.diskStorage({
    destination: function(req, file, next) {
        next(null, photoPath);
    },
    filename: function(req, file, next) {
        next(null, file.originalname)
    }
})

var upload = multer({storage: storage})

router.get('/movieList', (req, res) => {
    models.getMovieList(req.body, (err, resp)=>{
        // console.log(err, res)
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

router.post('/uploadmedia', upload.any(), function (req, res, next) {
    console.log("hi", req.files)
    models.uploadMedia(`http://192.168.4.1:4012/${req.files[0]['originalname']}`, (err, resp) => {
        if(err) {
            console.log(err)
            res.send({err: err})
        }
        if(resp) {
            res.send({resp: resp})
        }
    })
})
router.get('/power', (req, res) => {
    models.powerOff((err, resp)=>{
        // console.log(err, res)
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

module.exports = router
