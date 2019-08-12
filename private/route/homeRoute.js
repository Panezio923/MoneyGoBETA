const express = require('express');
const router = express.Router();
const Metodi = require('../controller/metodi');
const Conto = require('../controller/conto');
const User = require('../controller/user');
const Transazione = require('../controller/transazione');

const user = new User();
const metodi = new Metodi();
const conto = new Conto();
const transazione = new Transazione();

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
});


/*
 *Questo route verifica che il limite spesa non venga superato. Se così è
 * restituisce il messaggio OVERLIMIT. Il parametro bypass verifica se l'utente vuole
 * continuare la transazione anche se supera il limite di spesa.
 */
router.use('/inviaDenaro', (req, res, next)=>{
    var importo = parseFloat(req.body.importo);
    var limite = req.session.conto.limite_spesa;
    var bypass = req.body.bypass;

    if (importo >= limite && limite != null && limite !== 0 && bypass === "off") {
        res.send("OVERLIMIT");
        res.end();
        return;
    }
    next('route');
});

/*
 * Questa route si occupa dell'invio di denaro eseguendo prima lo spostamento dei soldi
 * e successivamente crea la transazione. Inoltre aggiorna i valori della sessione del saldo
 * e delle transazioni.
 */
router.post('/inviaDenaro', (req, res, next)=>{
    var mittente = req.session.user.nickname;
    var destinatario = req.body.destinatario;
    var metodo = req.body.metodo;
    var importo = parseFloat(req.body.importo);
    var causale = req.body.causale;

    metodi.inviaDenaro(mittente, importo, destinatario, metodo, function (result) {
        if (result) {
            /*
             * Aggiorno il valore del conto nella sessione solo quando viene selezionato quello di MoneyGo
             * in quanto viene utilizzato nella home.
             */
            if (metodo === "MONEYGO") req.session.conto.saldo_conto = req.session.conto.saldo_conto - importo;

            transazione.newTransazione(causale, mittente, destinatario, importo, "eseguita", function (newT) {
                if (newT) {
                    //Aggiorno le transazioni nella sessione
                    transazione.recuperaTransazione(mittente, function (esito) {
                        if (esito) {
                            req.session.transazioni = esito;
                            res.send("DONE");
                            res.end();
                        } else if (!esito) {
                            res.send("FAULT");
                            res.end();
                        }
                    })
                } else if (!newT) {
                    res.send("TRANERR");
                    res.end();
                }
            })
        } else if (!result) {
            res.send("TOO");
            res.end();
        }
    })
});

router.post("/richiediDenaro", (req, res, next)=>{
   console.log("Creo la nuova transazione");
   var mittente = req.body.reqmittente;
   var destinatario = req.session.user.nickname;
   var importo = req.body.importo;
   var causale = req.body.causale;

   transazione.newTransazione(causale, mittente, destinatario, importo, "in attesa", function (esito) {
       if(esito) res.send("DONE");
       else res.send("FAULT");
       res.end();
   })
});

module.exports = router;
