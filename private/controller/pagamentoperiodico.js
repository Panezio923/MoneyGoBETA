const pool = require('./connessionedb');

function Periodico() {}

Periodico.prototype = {
  
    recuperaPagamentiPeriodici: function (user, callback) {
        var that = this;
        let sql = "SELECT * FROM pagamento_periodico WHERE user = ?";
        pool.query(sql, user, function (err, pagamentiPeriodici) {
            if(err) throw err;
            if(!pagamentiPeriodici) callback(false);
            else {
                that.periodiciDaEffettuare(pagamentiPeriodici);
                callback( pagamentiPeriodici );
            }
        })
    },
    
    nuovoPagamentoPeriodico: function (user, destinatario, importo, data_inizio, periodicita, metodo, callback) {
        let sql = "INSERT INTO pagamento_periodico(user, destinatario, importo, periodicita, data_inizio, stato, metodo) VALUES(?, ?, ?, ?, ?, ?, ?)";

        pool.query(sql, [user, destinatario, importo, periodicita, data_inizio, "attivo", metodo], function (err, esito) {
            if(err) throw err;
            if(!esito) callback(false);
            else callback(true);
        })
    },

    periodiciDaEffettuare: function (callback) {
        let periodici;
        let sql = "SELECT * FROM pagamento_periodico";
        pool.query(sql, function (err, pagamentiPeriodici) {
            if(err) throw err;
            if(!pagamentiPeriodici) callback(false);
            else{
                for(let i = 0; i < pagamentiPeriodici.length; i++){
                    let periodico = pagamentiPeriodici[i];
                    let perdiodicita = periodico.periodicita;
                    switch (perdiodicita) {
                        case "settimana":
                            perdiodicita = 7;
                            break;
                        case "mese":
                            periodicita = 30;
                            break;
                        case "anno":
                            periodicita = 365;
                            break;
                        default:
                            periodicita = 0;
                    }
                    console.log(periodico.data_inizio.toLocaleDateString());
                    var d = new Date();
                    console.log(d.toLocaleDateString());
                }
            }
        })

    }
    
};

module.exports = Periodico;