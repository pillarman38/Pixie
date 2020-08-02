let express = require('express')
let router = express.Router()
let models = require('../models/movies.models')

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

module.exports = router