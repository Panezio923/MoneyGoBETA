const pool = require('./connessionedb');
const crypto = require('crypto');
const User = require('./user');
const mail = require('../mailer');
const bot = require('../bot');

function Transazione() {}
const users = new User();

function sendComunicazione(user, msg){
    users.find(user, function(esito){
        if(esito.comunicazione === 0){
            mail.inizializza();
            mail.inviaMailNotifica(esito.email, decodeURI(msg));
        }
        else if( esito.comunicazione === 2){
            bot.sendTextTg("978219762:AAHaFe80I5p2Rlooe7dEN3KaGLJIxiyxReE", esito.telegram, msg);
        }
    });
}

Transazione.prototype = {

    recuperaTransazione : function (user, callback) {
        let sql = "SELECT * FROM transazione t WHERE (t.nick_mittente = ? OR t.destinatario = ?) AND t.stato_transazione = ? ORDER BY id_transazione DESC";

        pool.query(sql, [user, user, "eseguita"], function (err, result) {
            if(err) throw err;
            if(!result) callback(null);
            else callback(result);
        })
    },

    recuperaInfoTransazione: function(idTransazione, token, callback){
        let sql = "SELECT * FROM transazione WHERE id_transazione = ? OR token = ? ";

        pool.query(sql, [idTransazione, token], function (err, transazione) {
            if(err) throw err;
            if(!transazione) callback(null);
            else callback(transazione[0]);
        })
    },

    newTransazione : function (causale, mittente, destinatario, importo, stato, callback) {
        let sql = "INSERT INTO transazione(data, causale, nick_mittente, destinatario, importo, stato_transazione) VALUES(?,?,?,?,?,?)";
        var d = new Date();
        pool.query(sql, [d, causale, mittente, destinatario, importo, stato], function (err, result) {
            if(err) throw err;
            if(result) {
                if(stato === "eseguita" && causale !== "ricarica conto") {
                    var msgMitt = ("Una transazione è andata a buon fine con importo €" + importo.toFixed( 2 ) + " verso " + destinatario);
                    sendComunicazione( mittente, encodeURI( msgMitt ) );
                    var msgDest = "Hai ricevuto € " + importo.toFixed( 2 ) + " da parte di " + mittente;
                    sendComunicazione( destinatario, encodeURI( msgDest ) );
                    callback( true );
                    return;
                }
                callback(true);
                return;
            }
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
        that = this;
        let sql = "UPDATE transazione SET stato_transazione = ? WHERE id_transazione = ? AND nick_mittente = ?";
        pool.query(sql, ["eseguita", id, user], function (err, result) {
            if(err) throw err;
            if(result) {
                that.recuperaInfoTransazione(id, null, function (transazione) {
                    var msgMitt = ("Una transazione è stata accettata con importo €" + transazione.importo.toFixed(2) +  " verso " + transazione.destinatario);
                    sendComunicazione(transazione.nick_mittente, encodeURI(msgMitt));
                    var msgDest = "Hai ricevuto € " + transazione.importo.toFixed(2) + " da parte di " + transazione.nick_mittente;
                    sendComunicazione(transazione.destinatario, encodeURI(msgDest));
                    callback(true);
                    return;
                })
            }
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
    creaToken : function (type, user, causale, importo, metodo, callback) {
        var token = crypto.createHmac('sha256', "random").update(user + Date.now()).digest('hex');
        console.log(token);
        var data = new Date();

        let sql_token = "INSERT INTO transazione(data, causale, nick_mittente, destinatario, importo, stato_transazione, token) VALUES(?,?,?,?,?,?,?)";
        let sql = "INSERT INTO link_pagamento(token, metodo, tipo) VALUES(?,?,?)";

        if(type === "SEND") {
            //Se è un token di invio allora chi lo crea è il mittente del denaro.
            pool.query(sql_token, [data, causale, user, "null", importo, "sospesa", token], function (err, esitoTransazione) {
                if(err) throw err;
                if (!esitoTransazione) callback(false);
                else {
                    pool.query(sql, [token, metodo, "SEND"], function(err, esitoToken) {
                        if(err) throw err;
                        if(!esitoToken) callback(false);
                        else callback(token);
                    })
                }
            })
        }
        else if(type === "RCV") {
            //Se è un token di richiesta allora chi lo crea è il destinatario del denaro.
            pool.query( sql_token, [data, causale, "null", user, importo, "sospesa", token], function (err, esitoTransazione) {
                if(err) throw err;
                if (!esitoTransazione) callback( false );
                else {
                    pool.query( sql, [token, metodo, "RCV"], function (err, esitoToken) {
                        if(err) throw err;
                        if (!esitoToken) callback( false );
                        else callback( token );
                    } )
                }
            } )
        }
    },

    verificaToken: function (token, callback) {
        let query = "SELECT * FROM transazione t, link_pagamento l WHERE t.token = l.token AND l.token = ?";

        pool.query(query, token, function (err, esito) {
            if(err) throw err;
            if(!esito.length) callback(false);
            else callback(esito);
        })

    },

    accettaToken: function (user, tipo, token, callback) {
        let query;
        that = this;
        if(tipo === "SEND") query = "UPDATE transazione t SET t.destinatario = ?, t.stato_transazione = ? WHERE t.token = ?";
        else if(tipo === "RCV") query = "UPDATE transazione t SET t.nick_mittente = ?, t.stato_transazione = ? WHERE t.token = ?";

        pool.query(query, [user, "eseguita", token], function (err, esito) {
            if(err) throw err;
            if(!esito) callback(false);
            else {
                that.recuperaInfoTransazione(null, token, function (transazione) {
                    var msgMitt = ("Una transazione è stata accettata con importo €" + transazione.importo.toFixed(2) +  " verso " + transazione.destinatario);
                    sendComunicazione(transazione.nick_mittente, encodeURI(msgMitt));
                    var msgDest = "Hai ricevuto € " + transazione.importo.toFixed(2) + " da parte di " + transazione.nick_mittente;
                    sendComunicazione(transazione.destinatario, encodeURI(msgDest));
                    callback(true);
                })
            }
        })
    },

    eliminaToken: function (token, callback) {
        let query = "DELETE FROM link_pagamento WHERE token = ?";

        pool.query(query, token, function (err, esito) {
            if(err) throw err;
            if(!esito) callback(false);
            else callback(true);
        })
    },

};



module.exports = Transazione;