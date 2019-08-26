const pool = require('./connessionedb');

function Metodi() {}

Metodi.prototype = {

    /*
     * Funzione utilizzata per recuperare le informazioni di tutti i metodi di pagamento di un utente.
     * @param {string} user - Il nickname dell'utente.
     * @param {function} callback - La funzione da eseguire una volta terminate le operazioni, e che restituirà
     *                              i metodi dell'utente.
     */
    recuperaMetodi : function (user, callback) {
        let sql = "SELECT * FROM metodi_pagamento mp WHERE mp.ref_nickname = ? ORDER BY mp.numero_iban";
        pool.query(sql, user, function (err, result) {
            if(err) throw err;
            callback(result);
        })
    },

    recuperaDatiCarte : function(user, callback){
      let sql = "SELECT c.numero_carta, c.saldo_carta, c.tipo_carta " +
                "FROM carta c, metodi_pagamento mp " +
                "WHERE c.ref_nickname = ? AND mp.ref_nickname = c.ref_nickname AND mp.numero_carta = c.numero_carta";
      pool.query(sql, user, function (err, result) {
          if(err) throw err;
          callback(result);
      })
    },

    recuperaDatiBanca : function(user, callback){
        let sql = "SELECT c.numero_conto, c.banca, c.saldo_banca " +
                    "FROM conto_bancario c, metodi_pagamento mp " +
                    "WHERE c.ref_nickname = ? AND mp.ref_nickname = c.ref_nickname AND mp.numero_iban = c.IBAN";
        pool.query(sql, user, function (err, result) {
            if(err) throw err;
            callback(result);
        })

    },

    impostaPredefinito : function(id, callback){

        let sql = "UPDATE metodi_pagamento SET predefinito = '0' WHERE predefinito = '1'";
        let sqlTWO = "UPDATE metodi_pagamento SET predefinito = '1' WHERE id_metodo = ?";


        pool.query(sql, function (err, result) {
            if(err) throw err;
            pool.query(sqlTWO,id,(function (err,result) {
                if(err) throw err;
                callback(result);
            }))
        })

    },

    rimuoviMetodo : function(id, callback){
      let sql = "DELETE FROM metodi_pagamento WHERE id_metodo = ?";

      pool.query(sql, id, function (err, result) {
          if(err) throw err;
          callback(result);
      })
    },

    aggiungiMetodoCarta : function (dati, callback) {
        this.verificaCarta(dati, function (res) {
            //console.log(res);
            if(res){
                let sql = "INSERT INTO metodi_pagamento(ref_nickname, tipo, saldo_metodo, numero_carta) VALUES(?, ?, ?, ?)";
                pool.query(sql, [res[0].ref_nickname, '1', res[0].saldo_carta, res[0].numero_carta], function (err, result) {
                    if(err) throw err;
                    callback(result);
                })
            }else
                callback(null);
        })
    },

    verificaCarta : function(dati, callback){
        let sql = "SELECT * FROM carta WHERE numero_carta = ? AND cvv = ?";
        pool.query(sql, [dati.numero, dati.cvv] , function (err, result) {
            if(err) throw err;
            if(result.length > 0)
                callback(result);
            else
                callback(null);
        })
    },

    aggiungiMetodoConto : function(dati, callback){
        this.verificaConto(dati, function (res) {
            //console.log(res);
            if(res){
                let sql = "INSERT INTO metodi_pagamento(ref_nickname, saldo_metodo, numero_iban, tipo) VALUES(?,?,?,?)";
                pool.query(sql, [res[0].ref_nickname, res[0].saldo_banca, res[0].IBAN, '0'], function (err, result) {
                    if(err) throw err;
                    callback(result);
                })
            }
        })
    },

    verificaConto : function(iban, callback){
        let sql = "SELECT * FROM conto_bancario WHERE iban = ?";
        pool.query(sql, iban, function (err, result) {
            if(err) throw err;
            if(result.length > 0)
                callback(result);
            else
                callback(null);
        })
    },

    /*Funzione che permette di effettuare l'invio di denaro tramite il conto personale di MG.
     *Per non ledere il database viene effettuata una transazione. Se qualcosa non va a buon fine
     * in una qualunque query durante la transazione allora viene effettuato un rollback riportando il
     * db allo stato in cui si trovava in precedenza.
     * @param {string} mittente - Il nickname di colui che invia denaro.
     * @param {string} importo - La cifra da trasmettere.
     * @param {string} destinatario - IL nickname di colui che riceve denaro.
     * @param {function} callback - La funzione da eseguire una volta terminate le operazioni.
     */
    avviaInvioContoMG: function(mittente, importo, destinatario, callback) {
      let sql_1 = "UPDATE conto_moneygo SET saldo_conto = (saldo_conto - ?) WHERE ref_nickname = ? ";
      let sql_2 = "UPDATE conto_moneygo SET saldo_conto = (saldo_conto + ?) WHERE ref_nickname = ? ";

        /**
         * Richiedo al pool una connessione, in modo da poter iniziare una transazione.
         */
      pool.getConnection(function (err, connection) {
          if(err){
              console.log(err);
              callback(undefined, "CONNERR");
          }
          else {
              connection.beginTransaction(function (err) {
                  if (err) {
                      console.log(err);
                      callback("CONNERR");
                      connection.rollback();
                      connection.release();
                  } else {
                      pool.query(sql_1, [importo, mittente], function (err, esitoUNO) {
                          //console.log(!esitoUNO);
                          if (!esitoUNO) {
                              callback(esitoUNO);
                              connection.rollback();
                              connection.release();
                          } else {
                              /*
                               * Se la prima query viene eseguita allora procedo con il trasferimento di denaro
                               */
                              pool.query(sql_2, [importo, destinatario], function (err, esitoDUE) {
                                 // console.log(esitoDUE);
                                  if (!esitoDUE) {
                                      callback(esitoDUE);
                                      connection.rollback();
                                      connection.release();
                                  } else {
                                      /*
                                       *Se le due query sono andate a buon fine effettuo il commit per rendere
                                       * le modifiche permanenti nel db.
                                       */
                                      callback(esitoDUE);
                                      connection.commit();
                                      connection.release();
                                  }
                              })
                          }
                      })
                  }
              })
          }
      })

    },

    avviaInvio: function(mittente, importo, destinatario, metodo, callback) {

        let sql_1 = "UPDATE metodi_pagamento SET saldo_metodo = (saldo_metodo - ?) WHERE (numero_carta = ? OR numero_iban = ?) AND ref_nickname = ? ";
        let sql_2 =  "UPDATE carta SET saldo_carta = (saldo_carta - ?) WHERE numero_carta = ? " ;
        let sql_3 =   "UPDATE conto_bancario SET saldo_banca = (saldo_banca - ?) WHERE IBAN = ? ";
        let sql_4 =   "UPDATE conto_moneygo SET saldo_conto = (saldo_conto + ?) WHERE ref_nickname = ? ";

        pool.getConnection(function (err, connection) {
            if(err){
                console.log(err);
                callback(undefined, "CONNERR");
            }else{
                connection.beginTransaction(function (err) {
                    if(err){
                        callback("CONNERR");
                        connection.rollback();
                        connection.release();
                    }else{
                        pool.query(sql_1, [importo, metodo, metodo, mittente], function (err, esitoUNO) {
                            if(err) throw err;
                            if(!esitoUNO){
                                callback(undefined, esitoUNO);
                                connection.rollback();
                                connection.release();
                            }else{
                                pool.query(sql_2, [importo, metodo], function (err, esitoDUE) {
                                    if(err) throw err;
                                    if(!esitoDUE){
                                        callback(undefined, esitoDUE);
                                        connection.rollback();
                                        connection.release();
                                    }else{
                                        pool.query(sql_3, [importo, metodo], function (err, esitoTRE) {
                                            if(err) throw err;
                                            if(!esitoTRE){
                                                callback(undefined, esitoTRE);
                                                connection.rollback();
                                                connection.release();
                                            }else{
                                                pool.query(sql_4, [importo, destinatario], function (err, esitoTRE) {
                                                    if(err) throw err;
                                                    if(!esitoTRE){
                                                        callback(undefined, esitoTRE);
                                                        connection.rollback();
                                                        connection.release();
                                                    }else{
                                                        callback(esitoTRE);
                                                        connection.commit();
                                                        connection.release();
                                                    }
                                                    
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })

    },

    verificaCopertura: function(mittente, importo, metodo, callback){
        let sql = "SELECT saldo_metodo FROM metodi_pagamento WHERE ref_nickname = ? AND (numero_carta = ? OR numero_iban = ?)";
        pool.query(sql, [mittente, metodo, metodo], function (err, result) {
            if(err) throw err;
            if(result[0] - importo < 0) callback(false);
            else callback(true);
        });
    },

    verificaCoperturaContoMG: function(mittente, importo, callback){
        let sql = "SELECT saldo_conto FROM conto_moneygo WHERE ref_nickname = ?";
        pool.query(sql, [mittente], function (err, result) {
            if(err) throw err;
            if(result[0].saldo_conto - importo < 0) callback(false);
            else callback(true);
        });
    },

    ricavaPredefinito: function(nickname, callback){
        let sql = "SELECT * FROM metodi_pagamento WHERE ref_nickname = ? AND predefinito = 1";
        pool.query(sql, nickname, function (err, result) {
          if(err) throw err;
          if(result.length){
              if (result[0].numero_carta != null) metodo = result[0].numero_carta;
              else if (result[0].numero_iban != null) metodo = result[0].numero_iban;
          }else callback(null);

        })
    },

    inviaDenaro : function (mittente, importo, destinatario, metodo, callback) {
        var that = this;

        if(metodo === "PREDEFINITO"){
         that.ricavaPredefinito(mittente, function (result) {
              if(result !== null)
              {
                  metodo = result;
                  that.verificaCopertura(mittente, importo, metodo, function (copertura) {
                      if(copertura) {
                          that.avviaInvio(mittente, importo, destinatario, metodo, function (confermaInvio) {
                              if(confermaInvio) callback(confermaInvio);
                              else callback(null);
                          })
                      }else callback(false);
                  });
              }
              else callback(false);
          });
        }
        else if(metodo === "MONEYGO"){
            that.verificaCoperturaContoMG(mittente, importo, function (copertura) {
                if(copertura){
                    that.avviaInvioContoMG(mittente, importo, destinatario, function (result) {
                        if(result) callback(result);
                        else callback(null);
                    })
                }else callback(false);
            })
        }
        else{
            that.verificaCopertura(mittente, importo, metodo, function (copertura) {
                if(copertura){
                    that.avviaInvio(mittente, importo, destinatario, metodo, function (result) {
                        if(result) callback(result);
                        else callback(null);
                    })
                }else callback(false);
            })
        }
    },

};

module.exports = Metodi;

