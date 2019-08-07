const pool = require('./connessionedb');

function Metodi() {}

Metodi.prototype = {

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
            console.log(res);
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
            console.log(res);
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


    inviaDenaro : function (mittente, destinatario, importo, metodo, callback) {
        if(metodo === "PREDEFINITO"){
            //prendo il predefinito
            let metodo_predef = null;
            let get_pred = "SELECT * FROM metodi_pagamento WHERE ref_nickname = ? AND predefinito = 1";
            pool.query(get_pred,mittente, function (err, result) {
                if(err) throw err;
                if(result[0].numero_carta != null) metodo_predef = result[0].numero_carta;
                else if(result[0].numero_iban != null) metodo_predef = result[0].numero_iban;
            });
            //verifico la copertura
            this.verificaCopertura(mittente, metodo_predef, importo, function (copertura) {
                if(copertura) {
                    this.avviaInvio(metodo_predef, mittente, destinatario, importo, causale, function (result) {
                        if(result)
                            callback(result);
                        else
                            callback(null);
                    })
                }
            });
        }
        else if(metodo === "MONEYGO"){
            this.verificaCoperturaContoMG(importo, mittente, function (esito) {
                if(esito){
                    this.avviaInvioContoMG(mittente, destinatario, importo, function (result) {
                        if(result) callback(result);
                        else callback(null);
                    })
                }
            })
        }
        else{
            this.verificaCopertura(metodo, mittente, importo, function (esito) {
                if(esito){
                    this.avviaInvio(metodo, mittente, destinatario, importo, function (result) {
                        if(result) callback(result);
                        else callback(null);
                    })
                }
            })
        }
    },

    verificaCopertura: function(metodo, mittente, importo, callback){
        let sql = "SELECT saldo_metodo FROM metodi_pagamento WHERE ref_nickname = ? AND (numero_carta = ? OR numero_iban = ?)";
        pool.query(sql, [mittente, metodo, metodo], function (err, result) {
            if(err) throw err;
            if(result[0] - importo < 0) callback(false);
            else callback(true);
        });
    },

    verificaCoperturaContoMG: function(importo, mittente, callback){
        let sql = "SELECT saldo_conto FROM conto_moneygo WHERE ref_nickname = ?";
        pool.query(sql, [mittente], function (err, result) {
            if(err) throw err;
            if(result[0] - importo < 0) callback(false);
            else callback(true);
        });
    },

    avviaInvio: function (metodo, mittente, destinatario, importo, callback) {

        let sql = "BEGIN TRAN " +
            "UPDATE metodi_pagamento SET saldo_metodo = (saldo_metodo - ?) WHERE (numero_carta = ? OR numero_iban = ?) AND ref_nickname = ? " +
            "UPDATE carta SET saldo_carta = (saldo_carta - ?) WHERE numero_carta = ? " +
            "UPDATE conto_bancario SET saldo_banca = (saldo_banca - ?) WHERE IBAN = ? " +
            "UPDATE conto_moneygo SET saldo_conto = (saldo_conto + ?) WHERE ref_nickname = ? " +
            "COMMIT TRAN ";

        pool.query(sql, [importo, metodo, metodo, mittente, importo, metodo, importo, metodo, importo, destinatario], function (err, result) {
            if(err) throw err;
            if(result.length) callback(result);
            else callback(null);
        })
    }, 
    
    avviaInvioContoMG: function (mittente, destinatario, importo, callback) {

        let sql = "BEGIN TRAN " +
            "UPDATE conto_moneygo SET saldo_conto = (saldo_conto - ?) WHERE ref_nickname = ? " +
            "UPDATE conto_moneygo SET saldo_conto = (saldo_conto + ?) WHERE ref_nickname = ? " +
            "COMMIT TRAN ";

        pool.query(sql, [importo, mittente, importo, destinatario], function (err, result) {
            if(err) throw err;
            if(result.length) callback(result);
            else callback(null);
        })
    }



};

module.exports = Metodi;

