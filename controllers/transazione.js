const pool = require('./connessionedb');

function Transazione() {};

Transazione.prototype = {

    recuperaTransazione : function (user, callback) {
        let sql = "SELECT * FROM transazione t WHERE (t.nick_mittente = ? OR t.destinatario = ?)";

        pool.query(sql, [user, user], function (err, result) {
            if(err) throw err;
            callback(result);
        })
    },

    newTransazione : function (dati, callback) {
        let sql = "INSERT INTO transazione(data, causale, nick_mittente, destinatario, importo, stato_transazione) VALUES(?,?,?,?,?,?)";

        pool.query(sql, dati, function (err, result) {
            if(err) throw err;
            callback(result);
        })
    }


};

module.exports = Transazione;