let express = require('express')
let router = express.Router()
let models = require('../models/movies.models')
let multer = require('multer')

let photoPath = "I:/storage"

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
    console.log(req.files)
    models.uploadMedia({
       location: `http://192.168.4.1:4012/${req.files[0]['filename'].replace(new RegExp(' ', 'g'), '%20')}}`,
        size: req.files[0]['size']
    },  (err, resp) => {
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
