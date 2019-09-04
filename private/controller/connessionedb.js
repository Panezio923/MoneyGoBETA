const util = require('util');
const mysql = require('mysql');

/**
 * Creo la connessione al database
 */

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'y5s2h87f6ur56vae.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'vkhlv6on8oei4rl0',
    password: 'g6kvihnvb58vg2iw',
    database: 'kvwwpun5efp6rxrw',
    multipleStatement: true,

});

pool.getConnection((err, connection) =>{
    if(err)
        console.log(err + " --- Connessione al db non riuscita");

    if(connection)
        connection.release();
    return;
});


pool.query = util.promisify(pool.query);

module.exports = pool;
