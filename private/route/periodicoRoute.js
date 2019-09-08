const express = require('express');
const router = express.Router();
const Pagamento = require('../controller/pagamentoperiodico');

const pagamento = new Pagamento();

router.use('/nuovoPagamentoPeriodico', (req, res, next)=>{
    var user = req.session.user.nickname;
    var destinatario = req.body.destinatario;
    var importo = req.body.importo;
    var data = req.body.datainizio;
    var periodicita = req.body.periodicita;
    var metodo = req.body.metodo;

   pagamento.nuovoPagamentoPeriodico(user, destinatario, importo, data, periodicita, metodo, function (esito) {
       if (!esito) res.send( "ERR" );
       else next( 'route' );
   })
});

router.post('/nuovoPagamentoPeriodico', (req, res)=>{
    pagamento.recuperaPagamentiPeriodici(req.session.user.nickname, function (periodiciAggiornati) {
        if (!periodiciAggiornati) res.send( "ERRPER" );
        else {
            req.session.pagamentiperiodici = periodiciAggiornati;
            res.send( "DONE" );
            res.end();
        }
    });
});

router.use('/eliminaPagamentoPeriodico', (req, res, next)=>{
    let id = req.body.id;
    pagamento.eliminaPagamentoPeriodico(id, req.session.user.nickname, function (esito) {
        if(!esito) res.send("ERR");
        else next('route');
    })
});

router.post('/eliminaPagamentoPeriodico', (req, res)=>{
    pagamento.recuperaPagamentiPeriodici(req.session.user.nickname, function (periodiciAggiornati) {
        if(!periodiciAggiornati) res.send("ERRPER");
        else {
            req.session.pagamentiperiodici = periodiciAggiornati;
            res.send("DONE");
            res.end();
        }
    })
});

router.use('/fermaPagamentoPeriodico', (req, res, next)=>{
    let id = req.body.id;
    pagamento.interrompiPagamentoPeriodico(id, req.session.user.nickname, function (esito) {
        if(!esito) res.send("ERR");
        else next('route');
    })
});

router.post('/fermaPagamentoPeriodico', (req, res)=>{
    pagamento.recuperaPagamentiPeriodici(req.session.user.nickname, function (periodiciAggiornati) {
        if(!periodiciAggiornati) res.send("ERRPER");
        else {
            req.session.pagamentiperiodici = periodiciAggiornati;
            res.send("DONE");
            res.end();
        }
    })
});

router.use('/riprendiPagamentoPeriodico', (req, res, next)=>{
    let id = req.body.id;
    pagamento.riprendiPagamentoPeriodico(id, req.session.user.nickname, function (esito) {
        if(!esito) res.send("ERR");
        else next('route');
    })
});

router.post('/riprendiPagamentoPeriodico', (req, res)=>{
    pagamento.recuperaPagamentiPeriodici(req.session.user.nickname, function (periodiciAggiornati) {
        if(!periodiciAggiornati) res.send("ERRPER");
        else {
            req.session.pagamentiperiodici = periodiciAggiornati;
            res.send("DONE");
            res.end();
        }
    })
});


module.exports = router;