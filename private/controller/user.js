const pool = require('./connessionedb');
const bcrypt = require('bcrypt');

function User() {}

User.prototype = {
    //cerco l'utente
    find : function (user = null, callback) {
        let sql = "SELECT * FROM utenti u WHERE u.nickname = ? OR u.email = ?";
        pool.query(sql, [user,user], function (err, result) {
            if(err) throw err;
            if(result.length){
                callback(result[0]);
            }else{
                callback(null);
            }
        });
    },


    login : function (user, pass, callback) {
        this.find(user, function (result) {
            //console.log(bcrypt.hashSync(pass, 10));
            if (result) {
                if (bcrypt.compareSync(pass, result.password)) {
                    callback(result);
                    return;
                }
                callback(null);
            }

        });
    },

    createUser : function (body, callback) {
        let pwd = body.password;
        body.password = bcrypt.hashSync(pwd, 10);

        var bind = [];
        for(var i in body){
            bind.push(i);
        }
        let sql = "INSERT INTO utenti (nome, cognome, cf, data_di_nascita, email, telefono, nickname, password) VALUES (?,?,?,?,?,?,?,?);";

        pool.query(sql, [body.nome,body.cognome,body.codicefiscale,body.nascita, body.email,body.telefono, body.nickname, body.password], function (err, result) {
            if(err) throw err;
            callback(result);
            //console.log(result);
        })
    },

    findEmail : function (email, callback) {
        let sql = "SELECT * FROM utenti u WHERE u.email = ?";
        pool.query(sql, email, function (err, result) {
            if(err) throw err;
            if(result) callback(result);
            else callback(null);
        });
    },

    findNick : function (nickname, callback) {
        let sql = "SELECT * FROM utenti u WHERE u.nickname = ?";
        pool.query(sql, nickname, function (err, result) {
            if(err) throw err;
            if(result) callback(result);
            else callback(null);
        })
    },

    updateEmail: function (email,nickname,callback) {
        let sql = "UPDATE utenti SET email = ? WHERE nickname = ?";
        pool.query(sql,[email,nickname], function (err, result) {
            if(err) throw err;
            console.log(result);
            if(result) callback(result);
            else callback(null);
        })
    },

};

module.exports = User;



