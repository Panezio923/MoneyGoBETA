const express = require('express');
const router = express.Router();
const User = require('../controller/user');
const Conto = require('../controller/conto');

const user = new User();
const conto = new Conto();

//funzione che aggiorna l'email quando l'utente vuole modificarla
router.post('/aggiornaEmail', (req,res,next)=>{

        let email = req.body.email;
        let nick = req.session.user.nickname;

        user.updateEmail(email,nick,function (result) {
            if(result){
                req.session.user.email=email;
                res.send("DONE");
            }
            else res.send("FAULT");
            res.end();
        })
});

//funzione che aggiorna il numero di telefono quando l'utente vuole modificarla
router.post('/aggiornaTelefono', (req,res,next)=> {

    let telefono = req.body.telefono;
    let nick = req.session.user.nickname;
    user.updateTelefono(telefono, nick, function (result) {
        if (result) {
            req.session.user.telefono = telefono;
            res.send("DONE");
        } else res.send("FAULT");
        res.end();
    })
});

//funzione che aggiorna il limite di spesa quando l'utente vuole modificarla
router.post('/aggiornaLimite', (req,res,next)=> {

    let limite = req.body.limite_spesa;
    let nick = req.session.user.nickname;
    conto.updateLimiteSpesa(limite, nick, function (result) {
        if (result) {
            req.session.conto.limite = limite;
            res.send("DONE");
        } else res.send("FAULT");
        res.end();
    })
});

//funzione che aggiorna il metodo di comunicazione quando l'utente vuole modificarla
router.post('/aggiornaComunicazione', (req,res,next)=> {

    let comunicazione = req.body.comunicazione;
    let nick = req.session.user.nickname;
    user.updateComunicazione(comunicazione, nick, function (result) {
        if (result) {
            req.session.user.comunicazione = comunicazione;
            res.send("DONE");
        } else res.send("FAULT");
        res.end();
    })
});

//funzione che controlla che, quando si desidera cambiare la password, viene inserita correttamente la vecchia password
router.post('/controllaPassword', (req,res,next)=> {

    let nick = req.session.user.nickname;
    let password = req.body.password;
    console.log(password);
    user.findPassword(password,nick,function(result) {
        if (result) {
            res.send("RIGHT");
        } else {
            res.send("WRONG");
        }
        res.end();
    })
});

//funzione che permette di cambiare la password
router.post('/ModificaPassword', (req,res,next)=> {

    let password = req.body.password;
    let nick = req.session.user.nickname;
    let email = req.session.user.email;
    user.caricaNuovaPassword(nick,email,password,function (result) {
        if (result) {
            req.session.user.password = password;
            res.send("DONE");
        } else res.send("FAULT");
        res.end();
    })
});

router.post('/getCodiceBot', (req, res)=>{
   user.findBotTelegram(req.session.user.nickname, function (codice) {
       if(!codice) res.send(null);
       else res.send(codice[0]);
   })
});

router.post('/caricaCodiceBot', (req, res)=>{
    user.caricaCodiceTelegram(req.session.user.nickname, req.body.codice, function (esito) {
        if(!esito) res.send("ERR");
        else res.send("DONE");
        res.end();
    })
});

module.exports = router;
