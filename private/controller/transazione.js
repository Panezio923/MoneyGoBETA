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
        //Carico in token tutti i dati per la transazione e quando l'utente l'accetta effettuo la query su transazione ed invio/ricevi denaro. //TODO
        //Il destinatario della richiesta che è il mittente/destinatario del denaro è iniziato a null. Dopo che logga diventa il suo nick e richiama la richiesta. //TODO
        var token = crypto.createHmac('sha256', "random").update(user + Date.now()).digest('hex');
        console.log(token);

        let sql_token = "INSERT INTO token(token, id_transazione, data) VALUES(?,?,?);" ;

        pool.getConnection(function (err, connection) {
            if(err){
                console.log(err);
                callback(undefined, "CONNERR");
            }
            else{
                connection.beginTransaction(function (err) {
                    if (err) {
                        console.log(err);
                        callback("CONNERR");
                        connection.rollback();
                        connection.release();
                    } else {
                        this.newTransazione(causale, user, null, importo, "sospesa", function (esitoTransazione) {
                            if(!esitoTransazione){
                                callback(undefined, esitoTransazione);
                                connection.rollback();
                                connection.release();
                            }
                            else{
                               console.log(esitoTransazione.id);
                               console.log(esitoTransazione);
                            }
                        })
                    }
                })
            }
        })
    }

};



module.exports = Transazione;