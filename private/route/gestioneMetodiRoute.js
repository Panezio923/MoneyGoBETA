const express = require('express');
const router = express.Router();
const Metodi = require('../controller/metodi');

const metodi = new Metodi();

//Restituisce la pagina di index
router.get('/home/?', (req, res, next) =>{
    let user = req.session.user;
    if(user.nickname === undefined) {
        res.render('index', {title: 'MoneyGO'});
    }
});

router.get('/ricavaMetodi', (req,res,next)=>{
    let user = req.session.user;
    let nickname = user.nickname;
    metodi.recuperaMetodi(nickname, function (result) {
        if(result){
            req.session.metodi = result;
            res.send(req.session.metodi);
        }
        else console.log("Errore recupero metodi");
    })
});

router.get('/ricavaCarte', (req,res,next)=>{
    let user = req.session.user;
    let nickname = user.nickname;
    metodi.recuperaDatiCarte(nickname, function (result) {
        if(result){
            req.session.metodi = result;
            res.send(req.session.metodi);
        }
        else console.log("Errore recupero carte");
    })
});

router.get('ricavaBanche', (req,res,next)=>{
    let user = req.session.user;
    let nickname = user.nickname;
    metodi.recuperaDatiBanca(nickname, function (result) {
        if(result){
            req.session.metodi = result;
            res.send(req.session.metodi);
        }
        else console.log("Errore recupero carte");
    })
});

router.post('/impostaPredefinito', (req,res,next)=>{
    let id = req.body.id;
    metodi.impostaPredefinito(id, function (result) {
        if(result) res.send("DONE");
        else res.send("ERROR");
    })
});

router.post('/rimuoviMetodo', (req,res,next)=>{
    let id = req.body.id;
    metodi.rimuoviMetodo(id, function (result) {
        if(result) res.send("DONE");
        else res.send("ERROR");
    })
});

router.post('/aggiungiMetodoCarta', (req, res, next) =>{
   let dati = req.body;
   metodi.aggiungiMetodoCarta(dati, function (result) {
       console.log(result);
       if(result){
           res.send("DONE");
           res.end;
       }else{
           res.send("FAULT");
           res.end;
       }
   })
});

router.post('/aggiungiMetodoConto', (req, res, next) =>{
    let iban = req.body.iban;
    metodi.aggiungiMetodoConto(iban, function (result) {
        if(result){
            res.send("DONE");
            res.end;
        }else{
            res.send("FAULT");
            res.end;
        }
    })
});

module.exports = router;