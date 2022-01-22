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

router.get('/movieListOnStartup', (req, res) => {
    models.getMovieList(req.body, (err, resp)=>{
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})
router.post('/moreMoviesOnScroll', (req, res) => {
    models.getMoreMoviesOnScroll(req.body, (error, resp)=>{
        if(error) {
            res.send(error)
        }
        if(resp) {
            res.send(resp)
        }
    })
})
router.get('/tvList', (req, res) => {
    models.getTvList(req.body, (err, resp)=>{
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
    console.log("REQ.BODY", req.files)
    models.uploadMedia(req.files,  (err, resp) => {
        console.log("REQ.BODY", req.fiies, req.body, err, resp)
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

router.get('/dirinfogetter', (req, res) => {
    models.dirinfogetter((err, resp)=>{
        // console.log(err, res)
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

router.get('/eject', (req, res) => {
    console.log("hiiii")
    models.eject((err, resp)=>{
        // console.log(err, res)
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})
router.post('/mover', (req, res) => {
    console.log("hiiii", req.body)
    models.mover(req.body['toMove'], (err, resp)=>{
        // console.log(err, res)
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

router.post('/deleter', (req, res) => {
    console.log("hiiii", req.body)
    models.deleter(req.body['toDelete'], (err, resp)=>{
        // console.log(err, res)
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

module.exports = router
