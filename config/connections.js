var mysql = require('mysql')

var pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: 3306
})

pool.getConnection((err, connection) => {
    if(err) {
        console.log(err)
    }
    if(connection) {
        connection.release()
    }
})
module.exports = pool