const express = require('express');
const router = express.Router();
const User = require('../controller/user');
const Conto = require('../controller/conto');
const Transazione = require('../controller/transazione');
const Metodi = require('../controller/metodi');

const transazione = new Transazione();
const conto = new Conto();
const user = new User();
const metodi = new Metodi();


//Restituisce la pagina di index
router.all('/', (req, res, next) =>{
    let user = req.session.user;
    if(!user) {
        req.session.dataPeriodico = new Date();
        res.render('index', {title: 'MoneyGO'});
    }else{
        res.redirect('/home');
    }

});

router.get('/home', (req, res, next) =>{
    let user = req.session.user;
    if(user){
        res.render('home', {user:req.session.user, conto:req.session.conto, transazioni:req.session.transazioni, metodi:req.session.metodi, notifiche: req.session.notifiche});
        return;
    }
    res.redirect('/');

});

//Richiesta Login
router.post('/login', (req,res,next)=>{
    user.find(req.body.user, function (resFind) {
        if(resFind == null){
            res.send("NOTEXIST");
            res.end();
        }else{
            user.login(req.body.user, req.body.password, function(result){
                if(result){
                    //console.log(" match: " + result);
                    req.session.user = result;
                    conto.calcolaSaldo(req.session.user.nickname, function (resConto) {
                        req.session.conto = resConto;
                        transazione.recuperaTransazione(req.session.user.nickname, function (resTransazioni) {
                            if(resTransazioni) {
                                req.session.transazioni = resTransazioni;
                                metodi.recuperaMetodi(req.session.user.nickname, function (resMetodi) {
                                    if(resMetodi){
                                        req.session.metodi = resMetodi;
                                        transazione.recuperaTransazioniInAttesa(req.session.user.nickname, function (resNotifiche) {
                                            req.session.notifiche = resNotifiche;
                                            res.send("MATCH");
                                            res.end();
                                        })
                                    }
                                })

                            }
                        })
                    });
                }
                else if(!result){
                    res.send("NOMATCH");
                    res.end();
                }
            })
        }
    })

});

//Logout richiesta
router.get('/logout', (req,res)=>{
    if(req.session.user){
        req.session.destroy((function () {
            res.redirect('/');
        }));
    }
});

//Richiesta pagina registrazione
router.get('/registrati', (req,res) =>{
    res.render('registrati', {title:'Registrati su MoneyGO'});
});

router.get('/recuperoPassword', (req, res, next)=>{
    res.render('recuperoPassword', {title: 'Recupera la tua password'});
});

router.get('/token/:token', (req, res)=>{
    let token = req.params.token;
    transazione.verificaToken(token, function (esito) {
        if(!esito) res.render('index');
        else{
            let user;
            if(esito[0].nick_mittente === "null") user = esito[0].destinatario;
            else user = esito[0].nick_mittente;

            res.render('GestioneConto/linkpagamento', {title: "MoneyGO", importo: esito[0].importo.toFixed(2), user: user});
            res.end();
        }
    })
});

router.post('/token/:token/eseguiTransazione', (req, res)=>{
   let token = req.params.token;
    let mittente;
    let destinatario;

    transazione.verificaToken(token, function (dati) {
        if(!dati) res.send("ERR");
        else{
           // inviaDenaro : function (mittente, importo, destinatario, metodo, callback)
            if(dati[0].tipo === "SEND") {
                mittente = dati[0].nick_mittente;
                destinatario = req.session.user.nickname;
            }
            else if(dati[0].tipo === "RCV"){
                destinatario = dati[0].destinatario;
                mittente = req.session.user.nickname;
            }
            let importo = dati[0].importo;
            let metodo = dati[0].metodo;

            metodi.inviaDenaro(mittente, importo, destinatario, metodo, function (esitoInvio) {
                if(!esitoInvio) res.send("TOO");
                else{
                    transazione.accettaToken(req.session.user.nickname, dati[0].tipo, token, function (esitoAccetta) {
                        if(!esitoAccetta) res.send("ERR");
                        else{
                            transazione.eliminaToken(token, function (esitoElimina) {
                                if(!esitoElimina) res.send("ERR");
                                else res.send("DONE");
                            })
                        }
                    })
                }
            })

        }
    })
});






module.exports = router;