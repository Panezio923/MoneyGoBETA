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
        let sql = "SELECT saldo_conto FROM conto_moneygo c, utenti u WHERE c.ref_nickname = u.nickname AND u.nickname = ?";

        pool.query(sql, user, function (err, result) {
            if(err) throw err;
            if(result) {
                callback(result[0]);
            }
        })
    },

};

module.exports = Conto;