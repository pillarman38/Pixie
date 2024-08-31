let features = require('../models/features.models')
let express = require('express')
let router = express.Router()

router.get('/networks', async (req, res) => {
    await features.getNetworksList((err, resp) => {
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

router.post('/connect', async (req, res) => {
    await features.connect(req.body, (err, resp) => {
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

router.get('/ping', async (req, res) => {
    await features.ping((err, resp) => {
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

router.get('/switchtohotspot', async (req, res) => {
    await features.switchToHotSpot((err, resp) => {
        if(err){
            res.send(err)
        } else {
            res.send(resp)
        }
    })
})

module.exports = router