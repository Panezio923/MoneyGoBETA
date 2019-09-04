const express = require('express');
const router = express.Router();
const Pagamento = require('../controller/pagamentoperiodico');

const pagamento = new Pagamento();

router.post('/nuovoPagamentoPeriodico', (req, res, next)=>{
    var user = req.session.user.nickname;
    var destinatario = req.body.destinatario;
    var importo = req.body.importo;
    var data = req.body.datainizio;
    var periodicita = req.body.periodicita;
    var metodo = req.body.metodo;

   pagamento.nuovoPagamentoPeriodico(user, destinatario, importo, data, periodicita, metodo, function (esito) {
       if(!esito) res.send("ERR");
       else {
           pagamento.recuperaPagamentiPeriodici(req.session.user.nickname, function (periodiciAggiornati) {
               if(!periodiciAggiornati) res.send("ERR");
               else {
                   req.session.pagamentiperiodici = periodiciAggiornati;
                   res.send("DONE");
                   res.end();
               }

           })
       }
   });
});

router.post('/eliminaPagamentoPeriodico', (req, res)=>{

});

module.exports = router;