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
    },
    
    nuovoPagamentoPeriodico: function (user, destinatario, importo, data_inizio, periodicita, metodo, callback) {
        let sql = "INSERT INTO pagamento_periodico(user, destinatario, importo, periodicita, data_inizio, stato, metodo) VALUES(?, ?, ?, ?, ?, ?, ?)";

        pool.query(sql, [user, destinatario, importo, periodicita, data_inizio, "attivo", metodo], function (err, esito) {
            if(err) throw err;
            if(!esito) callback(false);
            else callback(true);
        })
    }
    
};

module.exports = Periodico;