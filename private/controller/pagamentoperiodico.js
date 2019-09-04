const pool = require('./connessionedb');

function Periodico() {}

Periodico.prototype = {
  
    recuperaPagamentiPeriodici: function (user, callback) {
        let sql = "SELECT * FROM pagamento_periodico WHERE user = ?";

        pool.query(sql, user, function (err, pagamentiPeriodici) {
            if(err) throw err;
            if(!pagamentiPeriodici) callback(false);
            else callback(pagamentiPeriodici);
        })
    }
    
};

module.exports = Periodico;