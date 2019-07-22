const express = require('express');
const router = express.Router();
const Metodi = require('../controllers/metodi');

const metodi = new Metodi();

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

module.exports = router;
