const express = require('express');
const router = express.Router();
const Metodi = require('../controller/metodi');
const Conto = require('../controller/conto');
const Pagamento = require('../controller/pagamentoperiodico');
const Transazione = require('../controller/transazione');

const pagamento = new Pagamento();
const metodi = new Metodi();
const conto = new Conto();
const transazione = new Transazione();

router.get('/aggiornaDati', (req, res, next)=>{
   if(!req.session.user.nickname){
       res.redirect('/');
   }else{
       conto.calcolaSaldo(req.session.user.nickname, function (nuovoSaldo) {
          if(nuovoSaldo) {
              req.session.conto = nuovoSaldo;
              metodi.recuperaMetodi(req.session.user.nickname, function (nuoviMetodi) {
                  if(nuoviMetodi){
                      req.session.metodi = nuoviMetodi;
                      res.json({"saldo":req.session.conto.saldo_conto});
                      res.end();
                  }
                  else
                      req.session.metodi = "err";
              })
          }
          else
              req.session.conto.saldo_conto = "err";
       });
   }
});


router.get('/adminCards', (req,res,next) =>{
    let user = req.session.user;
    if(!user){
        res.redirect('/');
        return
    }
    metodi.recuperaMetodi(user.nickname, function (result) {
        if (result) {
            req.session.metodi = result;
            metodi.recuperaDatiCarte(user.nickname, function (resCarte) {
                if (resCarte) {
                    req.session.carte = resCarte;
                    metodi.recuperaDatiBanca(user.nickname, function (resBanca) {
                        req.session.banca = resBanca;
                        res.render('gestione-carte', {
                            metodi: req.session.metodi,
                            carte: req.session.carte,
                            banca: req.session.banca
                        });
                    })
                }
            })
        } else console.log("Errore recupero metodi");
    })

});

router.get('/gestioneProfilo', (req,res,next) =>{
    if(!req.session.user){
        res.redirect('/');
        return
    }
    let nickname = req.session.user.nickname;
    conto.recuperaLimiteSpesa(nickname, function (result) {
        if (result) {
            req.session.limite_spesa = result;
            res.render('gestioneprofilo', {title: "MoneyGo", user: req.session.user, limite: req.session.limite_spesa});
        }
    });
});

router.get('/user_nickname', (req,res,next)=>{
    res.send(req.session.user.nickname);
    res.end();
});

/*
 *Questo route verifica che il limite spesa non venga superato. Se così è
 * restituisce il messaggio OVERLIMIT. Il parametro bypass verifica se l'utente vuole
 * continuare la transazione anche se supera il limite di spesa.
 */
router.use('/inviaDenaro', (req, res, next)=>{
    res.locals.importo = Number(req.body.importo);
    var limite = req.session.conto.limite_spesa;
    var bypass = req.body.bypass;
    res.locals.mittente = req.session.user.nickname;
    res.locals.metodo = req.body.metodo;
    res.locals.destinatario = req.body.destinatario;
    res.locals.causale = req.body.causale;


    if (res.locals.importo >= limite && limite != null && limite !== 0 && bypass === "off") {
        return res.send("OVERLIMIT");
    }
    next('route');
});

/*
 * Questa route si occupa dell'invio di denaro eseguendo prima lo spostamento dei soldi
 * e successivamente crea la transazione. Inoltre aggiorna i valori della sessione del saldo
 * e delle transazioni.
 */
router.post('/inviaDenaro', (req,res,next)=>{
    metodi.inviaDenaro(res.locals.mittente, res.locals.importo, res.locals.destinatario, res.locals.metodo, function (result) {
        if(!result) {
            res.send("TOO");
            res.end();
        } else {
            if (res.locals.metodo === "MONEYGO") req.session.conto.saldo_conto = (req.session.conto.saldo_conto - res.locals.importo).toFixed(2);
            next('route');
        }
    })
});

router.post('/inviaDenaro', (req, res, next) =>{
    transazione.newTransazione(res.locals.causale, res.locals.mittente, res.locals.destinatario, res.locals.importo, "eseguita", function (result) {
        if(!result) return res.send("TRANERR");
        else{
            next('route');
        }
    })
});

router.post('/inviaDenaro', (req, res)=>{
   transazione.recuperaTransazione(res.locals.mittente, function (result) {
       if(!result) return res.send("FAULT");
       else{
           req.session.transazioni = result;
           return res.send("DONE");
       }
   })
});

router.post("/richiediDenaro", (req, res, next)=>{
   console.log("Creo la nuova transazione");
   var mittente = req.body.reqmittente;
   var destinatario = req.session.user.nickname;
   var importo =  Number(req.body.importo);
   console.log(importo);
   var causale = req.body.causale;

   /*
    * In questa chiamata alla funzione inverto il mittente ed il destinatario
    * in quanto il mittente è colui che invia denaro e non chi effettua la richiesta.
    */
   transazione.newTransazione(causale, mittente, destinatario, importo, "in attesa", function (esito) {
       if(esito) res.send("DONE");
       else res.send("FAULT");
       res.end();
   })
});

/*
 * Questa route restituisce le transazioni in attesa per crearne una copia
 * sul front-end
 */
router.get("/ricavaNotifiche", (req, res)=>{
    //console.log(req.session.notifiche);
   transazione.recuperaTransazioniInAttesa(req.session.user.nickname, function (esito) {
       if(esito !== 0) {
           req.session.notifiche = esito;
           res.send(esito);
       }
       else res.send("NONE");

   })
});

router.post("/accettaTransazione", (req, res)=>{
    metodi.inviaDenaro(req.session.user.nickname, req.body.importo, req.body.destinatario, "MONEYGO", function (esito) {
        if(!esito) res.send("ERROR");
        else{
            //console.log(req.body.id);
            req.session.conto.saldo_conto = (req.session.conto.saldo_conto - req.body.importo).toFixed(2);
            transazione.accettaTransazione(req.session.user.nickname, req.body.id, function (esitoDUE) {
                if(!esitoDUE) res.send("ERROR");
                else{
                    res.send("DONE");
                }
                res.end();
            })
        }
    })
});

router.post("/rifiutaTransazione", (req,res) =>{
    transazione.rifiutaTransazione(req.session.user.nickname, req.body.id, function (esito) {
        if(!esito) res.send("ERROR");
        else res.send("DONE");
        res.end();
    })
});

router.get('/ricaricaConto',(req,res) => {
    if(!req.session.user){
        res.redirect('/');
    }
    else res.render('ricaricaconto',{title:"MoneyGo", metodi : req.session.metodi, saldo_metodo : req.session.saldo_metodo});
});

router.post('/creaToken', (req, res, next)=>{
    let user = req.session.user.nickname;
    let type = req.body.type;
    let causale = req.body.causale;
    let importo = req.body.importo;
    let metodo = req.body.metodo;

    transazione.creaToken(type, user, causale, importo, metodo, function (esitoToken) {
        if(!esitoToken) res.send("ERR");
        else res.send(esitoToken);
        res.end();

    })
});

router.get('/pagamentoPeriodico', (req, res)=>{

    if(!req.session.user){
       res.redirect('/');
       return;
   }
   else {
       pagamento.recuperaPagamentiPeriodici(req.session.user.nickname, function (pagamentiperiodici) {
           if(!pagamentiperiodici){
               console.log("Errore nel recupero pagamenti periodici");
               res.redirect('/');
           }else{
               req.session.pagamentiperiodici = pagamentiperiodici;
               res.render('GestioneConto/pagamentoperiodico', {title:"MoneyGo", metodi : req.session.metodi, pagamentiPeriodici: pagamentiperiodici});
           }
       });
    }
});

module.exports = router;
