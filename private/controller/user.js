const pool = require('./connessionedb');
const bcrypt = require('bcrypt');
const mail = require('../mailer');
const bot = require('../bot');

function User() {}

User.prototype = {
    //cerco l'utente
    find: function (user = null, callback) {
        let sql = "SELECT * FROM utenti u WHERE u.nickname = ? OR u.email = ?";
        pool.query(sql, [user, user], function (err, result) {
            if (err) throw err;
            if (result.length) {
                callback(result[0]);
            } else {
                callback(null);
            }
        });
    },

    login: function (user, pass, callback) {
        this.find(user, function (result) {
            if (result) {
                if (bcrypt.compareSync(pass, result.password)) {
                    callback(result);
                    return;
                }
                callback(null);
            }

        });
    },

    createUser: function (body, callback) {
        let pwd = body.password;
        body.password = bcrypt.hashSync(pwd, 10);

        var bind = [];
        for (var i in body) {
            bind.push(i);
        }
        let sql = "INSERT INTO utenti (nome, cognome, cf, data_di_nascita, email, telefono, nickname, password) VALUES (?,?,?,?,?,?,?,?);";

        pool.query(sql, [body.nome, body.cognome, body.codicefiscale, body.nascita, body.email, body.telefono, body.nickname, body.password], function (err, result) {
            if (err) throw err;
            callback(result);
            //console.log(result);
        })
    },

    findEmail: function (email, callback) {
        let sql = "SELECT * FROM utenti u WHERE u.email = ?";
        pool.query(sql, email, function (err, result) {
            if (err) throw err;
            if (result) callback(result);
            else callback(null);
        });
    },

    findNick: function (nickname, callback) {
        let sql = "SELECT * FROM utenti u WHERE u.nickname = ?";
        pool.query(sql, nickname, function (err, result) {
            if (err) throw err;
            if (result) callback(result);
            else callback(null);
        })
    },

    updateEmail: function (email, nickname, callback) {
        let sql = "UPDATE utenti SET email = ? WHERE nickname = ?";
        pool.query(sql, [email, nickname], function (err, result) {
            if (err) throw err;
            console.log(result);
            if (result) callback(result);
            else callback(null);
        })
    },

    updateTelefono: function (telefono,nickname,callback) {
        let sql = "UPDATE utenti SET telefono = ? WHERE nickname = ?";
        pool.query(sql, [telefono, nickname], function (err, result) {
            if (err) throw err;
            if (result) callback(result);
            else callback(null);
        })
    },

    updateComunicazione: function (comunicazione,nickname,callback) {
        let sql = "UPDATE utenti SET comunicazione = ? WHERE nickname = ?";
        pool.query(sql,[comunicazione,nickname], function (err, result) {
            if(err) throw err;
            if(result) callback(result);
            else callback(null);
        })
    },

    generaPassword: function (callback) {
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        var result = Math.floor(Math.random() * 10);
        for (var i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        callback(result);
    },

    caricaNuovaPassword: function (nickname, email, password, callback) {
           var nuovaPassword = bcrypt.hashSync(password, 10);
           let sql ="UPDATE utenti SET password = ? WHERE (nickname = ? AND email = ?)";
           pool.query(sql, [nuovaPassword, nickname, email], function (err, esito) {
               if(err) throw err;
               if(esito) callback(esito);
               else callback(null);
           })
    },

    findPassword : function (password,nickname,callback) {
        let sql = "SELECT * FROM utenti u WHERE nickname = ? ";
        pool.query(sql,[nickname],function (err, result) {
            if (err) throw err;
            if(result) {
                bcrypt.compare(password,result[0].password,function (err,res) {
                    if(err) throw err;
                    if(res) callback(res);
                    else callback(null);
                })
            }
        })
    },

    findBotTelegram: function (user, callback) {
        let sql = "SELECT telegram FROM utenti WHERE nickname = ?";
        pool.query(sql, user, function (err, codice) {
            if(err) throw err;
            callback(codice);
        })
    },

    caricaCodiceTelegram : function (user, codice, callback) {
        let sql = "UPDATE utenti SET telegram = ? WHERE nickname = ?";
        pool.query(sql, [codice, user], function (err, esito) {
            if(err) throw err;
            if(!esito) callback(false);
            else callback(true);
        })
    },


    sendComunicazione: function(user, msg){
        try {
            this.find( user, function (esito) {
                if (esito.comunicazione === 0) {
                    mail.inizializza();
                    mail.inviaMailNotifica( esito.email, decodeURI( msg ) );
                } else if (esito.comunicazione === 2) {
                    bot.sendTextTg( "978219762:AAHaFe80I5p2Rlooe7dEN3KaGLJIxiyxReE", esito.telegram, msg );
                }
            } );
        }catch (e) {
            console.log(e);
        }
    },
};


module.exports = User;



