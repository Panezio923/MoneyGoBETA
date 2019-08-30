const pool = require('./connessionedb');
const crypto = require('crypto');

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
            if(result) callback(true);
            else callback(false);
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

    /*Funzione che crea una transazione in stato "sospesa" che viene accettata attraverso
    * l'uso del token a cui è associata.
    * @param {string} type - Se è un link di richiesta o di invio.
    * @param {string} user - Colui che crea il link.
    * @param {string} causale - La motivazione della creazione del link.
    * @param {float} importo - L'importo della transazione.
    * @param {function} callback - La funzione da eseguire una volta terminate le operazioni.
    */
    creaToken : function (type, user, causale, importo, callback) {
        var token = crypto.createHmac('sha256', "random").update(user + Date.now()).digest('hex');
        console.log(token);
        var data = new Date.now();

        let sql_token = "INSERT INTO transazione(data, causale, nick_mittente, destinatario, importo, stato_transazione, token) VALUES(?,?,?,?,?,?,?)";

        if(type === "SEND") {
            //Se è un token di invio allora chi lo crea è il mittente del denaro.
            pool.query(sql_token, [data, causale, user, null, importo, "sospesa", token], function (esitoTransazione) {
                if (!esitoTransazione) callback(false);
                else callback(true);
            })
        }
        else if(type === "RCV"){
            //Se è un token di richiesta allora chi lo crea è il destinatario del denaro.
            pool.query(sql_token, [data, causale, null, user, importo, "sospesa", token], function (esitoTransazione) {
                if (!esitoTransazione) callback(false);
                else callback(true);
            })
        }
    },

};



module.exports = Transazione;