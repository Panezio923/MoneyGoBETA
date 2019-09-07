const pool = require('./connessionedb');
const Metodi = require('./metodi');
const Transazione = require('./transazione');

const transazione = new Transazione();
const metodi = new Metodi();

function Periodico() {}

Periodico.prototype = {
  
    recuperaPagamentiPeriodici: function (user, callback) {
        let sql = "SELECT * FROM pagamento_periodico WHERE user = ?";
        pool.query(sql, user, function (err, pagamentiPeriodici) {
            if(err) throw err;
            if(!pagamentiPeriodici) callback(false);
            else {
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

    periodiciDaEffettuare: function () {
        var that = this;

        let sql = "SELECT * FROM pagamento_periodico WHERE stato = 'attivo'";
        pool.query(sql, function (err, pagamentiPeriodici) {
            if(err) throw err;
            if(!pagamentiPeriodici) {}
            else{
                for(let i = 0; i < pagamentiPeriodici.length; i++){
                    let periodico = pagamentiPeriodici[i];
                    let periodicita = periodico.periodicita;
                    var dataOdierna = new Date();

                    if (periodico.data_ultimo_pagamento === null) {
                        if (periodico.data_inizio.toLocaleDateString() === dataOdierna.toLocaleDateString()) {
                            that.effettuaPeriodico(periodico, function (esito) {
                                if(!esito) console.log("1 Errore pagamento Periodico");
                                else console.log("Pagamento periodico ID:" + periodico.id_pag_per + " riuscito");
                            });
                            continue;
                        }
                        continue;
                    }

                    var ultimoPagamento =  periodico.data_ultimo_pagamento;

                    switch (periodicita) {
                        case "settimana":
                            periodicita = 7;

                            if(Math.abs(dataOdierna.getDate() - ultimoPagamento.getDate())%periodicita === 0){
                                that.effettuaPeriodico(periodico, function (esito) {
                                   if(!esito) console.log("2 Errore pagamento Periodico");
                                   else console.log("Pagamento periodico ID:" + periodico.id_pag_per + " riuscito");
                                });
                            }

                            break;
                        case "mese":
                            periodicita = 30;
                            var diffTime = Math.abs(dataOdierna.getTime() - ultimoPagamento.getTime());
                            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if((diffDays%periodicita) >= 1 && dataOdierna.getDate() === ultimoPagamento.getDate()){
                                that.effettuaPeriodico(periodico, function (esito) {
                                    if(!esito) console.log("3 Errore pagamento Periodico");
                                    else console.log("Pagamento periodico ID:" + periodico.id_pag_per + " riuscito");
                                });
                           }

                            break;
                        case "anno":
                            periodicita = 365;
                            var diffTime = Math.abs(dataOdierna.getTime() - ultimoPagamento.getTime());
                            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                           if((diffDays%periodicita) === 0 || (diffDays%periodicita) === 1){
                               that.effettuaPeriodico(periodico, function (esito) {
                                   if(!esito) console.log("4 Errore pagamento Periodico");
                                   else console.log("Pagamento periodico ID:" + periodico.id_pag_per + " riuscito");
                               });
                           }

                            break;
                        default:
                            periodicita = 0;
                    }
                }
            }
        })
    },

    effettuaPeriodico : function (pagamentoPeriodico, callback) {
        metodi.inviaDenaro(pagamentoPeriodico.user, pagamentoPeriodico.importo, pagamentoPeriodico.destinatario, pagamentoPeriodico.metodo, function (esito) {
            if(!esito) callback(false);
            else{
                transazione.newTransazione("Pagamento Periodico", pagamentoPeriodico.user, pagamentoPeriodico.destinatario, pagamentoPeriodico.importo, "eseguita", pagamentoPeriodico.metodo, function (esitoTransazione) {
                    if(!esitoTransazione) callback(false);
                    else {
                        let sql = "UPDATE pagamento_periodico SET data_ultimo_pagamento = ? WHERE id_pag_per = ?";
                        pool.query(sql, [new Date(), pagamentoPeriodico.id_pag_per], function (err, updateData) {
                            if(err) throw err;
                            if(!updateData) callback(false);
                            else callback(true);
                        })
                    }
                })
            }
        })
    },

};

module.exports = Periodico;