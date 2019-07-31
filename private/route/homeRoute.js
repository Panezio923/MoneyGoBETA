const express = require('express');
const router = express.Router();
const Metodi = require('../controller/metodi');
const Conto = require('../controller/conto');

const metodi = new Metodi();
const conto = new Conto();

/*Serve un metodo che riporta alla index quando il nick non è più valido */

router.get('/adminCards', (req,res,next) =>{
    let user = req.session.user;
    let nickname = user.nickname;
    metodi.recuperaMetodi(nickname, function (result) {
        if(result){
            req.session.metodi = result;
            metodi.recuperaDatiCarte(nickname, function (resCarte) {
                if(resCarte) {
                    req.session.carte = resCarte;
                    metodi.recuperaDatiBanca(nickname,function (resBanca) {
                        req.session.banca = resBanca;
                        res.render('gestione-carte', {metodi: req.session.metodi, carte: req.session.carte, banca: req.session.banca});
                    })
                }
            })
        }
        else console.log("Errore recupero metodi");
    })
});

router.get('/gestioneProfilo', (req,res,next) =>{
    var nickname = req.session.user.nickname;
    conto.recuperaLimiteSpesa(nickname, function (result) {
        if (result) {
            req.session.limite_spesa = result;
            res.render('gestioneprofilo', {title: "MoneyGo", user: req.session.user, limite: req.session.limite_spesa});
            console.log(req.session.limite_spesa);
        }
    });
});


module.exports = router;
