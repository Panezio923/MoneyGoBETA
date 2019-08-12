const pool = require('./connessionedb');

function Transazione() {};

Transazione.prototype = {

    recuperaTransazione : function (user, callback) {
        let sql = "SELECT * FROM transazione t WHERE (t.nick_mittente = ? OR t.destinatario = ?) AND t.stato_transazione = ? ORDER BY id_transazione DESC";

        pool.query(sql, [user, user, "eseguita"], function (err, result) {
            if(err) throw err;
            callback(result);
        })
    },

    newTransazione : function (causale, mittente, destinatario, importo, stato, callback) {
        let sql = "INSERT INTO transazione(data, causale, nick_mittente, destinatario, importo, stato_transazione) VALUES(?,?,?,?,?,?)";

        var d = new Date();

        pool.query(sql, [d, causale, mittente, destinatario, importo, stato], function (err, result) {
            if(err) throw err;
            if(result) callback(result);
            else callback(null);
        })
    }
};

module.exports = Transazione;