const pool = require('./connessionedb');

function Conto() {}

Conto.prototype = {

    createConto : function (user, callback) {
        let sql = "INSERT INTO conto_moneygo(ref_nickname,saldo_conto) VALUES (?,0)";
        pool.query(sql, user, function (err, result) {
            if(err) throw err;
            callback(result);
        })
    },

    calcolaSaldo : function (user, callback) {
        let sql = "SELECT * FROM conto_moneygo c, utenti u WHERE c.ref_nickname = u.nickname AND u.nickname = ?";

        pool.query(sql, user, function (err, result) {
            if(err) throw err;
            if(result) {
                callback(result[0]);
            }
        })
    },

    recuperaLimiteSpesa : function(nickname, callback) {
        let sql = "SELECT limite_spesa FROM conto_moneygo c  WHERE ref_nickname = ?";

        pool.query(sql,nickname,function (err,result) {
            if(err) throw err;
            if(result) {
                callback(result[0]);
            }
        })
    },

    updateLimiteSpesa : function(limite,nickname,callback) {
        let sql = "UPDATE conto_moneygo SET limite_spesa = ? WHERE ref_nickname = ?";
        pool.query(sql, [limite, nickname], function (err, result) {
            if (err) throw err;
            if (result) callback(result);
            else callback(null);
        })
    },


};

module.exports = Conto;