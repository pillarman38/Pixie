let express = require('express')
let router = express.Router()
let models = require('../models/movies.models')
let multer = require('multer')

let photoPath = "J:/storage"

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
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})
router.get('/getmedia', (req, res) => {
    models.getmedia(req.body, (err, resp)=>{
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

router.post('/uploadmedia', upload.any(), function (req, res, next) {
    
    models.uploadMedia(`http://192.168.1.86:4012/${req.body['photos']}`, (err, resp) => {
        // console.log("REQ.BODY", req.fiies, req.body, err, resp)
        if(err) {
            // console.log(err)
            res.send(err)
        }
        if(resp) {
            // console.log(resp)
            res.send(resp)
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
