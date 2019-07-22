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

    //DA COMPLETARE!
    aggiungiMetodoCarta : function (dati, callback) {
        this.verificaCarta(dati, function (res) {
            if(res){
                let sql = "INSERT INTO metodi_pagamento(ref_nickname, tipo, saldo_metodo, numero_carta) VALUES(?, ?, ?, ?);"
                pool.query(sql, [res.ref_nickname, res.tipo_carta, res.saldo_carta, res.numero_carta], function (err, result) {
                    if(err) throw err;
                    callback(result);
                })
            }
        })
    },

    verificaCarta : function(dati, callback){
        let sql = "SELECT * FROM carta WHERE numero_carta = ? AND cvv = ? AND scadenza = ?";
        pool.query(sql, [dati.numero_carta, dati.cvv, dati.scadenza], function (err, result) {
            if(err) throw err;
            if(result)
                callback(result);
            else
                callback(null);
        })
    },

    verificaConto : function(user, callback){

    },




};

module.exports = Metodi;

