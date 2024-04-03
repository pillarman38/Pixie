// const net = require('net')
var pool = require('../../config/connections')

function search(data, callback) {
    console.log(data.searchVal);
    pool.query(`SELECT * FROM movies WHERE title LIKE '${data.searchVal}%' UNION SELECT * FROM shows WHERE title LIKE '${data.searchVal}%' LIMIT 5`, (err, res) => {
        console.log(err, res);
        callback(null, res)
    })
}

module.exports = search