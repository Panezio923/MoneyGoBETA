const pool = require('./connessionedb');

function Transazione() {};

Transazione.prototype = {

    recuperaTransazione : function (user, callback) {
        let sql = "SELECT * FROM transazione t WHERE (t.nick_mittente = ? OR t.destinatario = ?) AND t.stato_transazione = ? ORDER BY id_transazione DESC";

        pool.query(sql, [user, user, "eseguita"], function (err, result) {
            if(err) throw err;
            if(result) callback(result);
            else callback(null);
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
    },

    /*
     * Restituisce tutte le transazioni che sono in attesa di approvazione da parte dell'utente
     * che sta utilizzando l'app. Le transazioni in attesa di approvazioni sono quelle che come mittente hanno l'utente
     * che deve inviare il denaro e come stato della transazione abbiano la dicitura "IN ATTESA"
     */
    recuperaTransazioniInAttesa : function (user, callback) {
        let sql = "SELECT * FROM transazione t WHERE t.nick_mittente = ? AND stato_transazione = ?";
        pool.query(sql, [user, "in attesa"], function (err, result) {
            if(err) throw err;
            if(result) callback(result);
            else callback(null);
        })
    },

    accettaTransazione : function (user, id, callback) {
        let sql = "UPDATE transazione SET stato_transazione = ? WHERE id_transazione = ? AND nick_mittente = ?";
        pool.query(sql, ["eseguita", id, user], function (err, result) {
            if(err) throw err;
            if(result) callback(true);
            else callback(false);
        })
    },

    rifiutaTransazione : function (user, id, callback) {
        let sql = "UPDATE transazione SET stato_transazione = ? WHERE id_transazione = ? AND nick_mittente = ?";
        pool.query(sql, ["rifiutata", id, user], function (err, result) {
            if(err) throw err;
            if(result) callback(true);
            else callback(false);
        })
    },
};

module.exports = Transazione;