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


module.exports = router;
