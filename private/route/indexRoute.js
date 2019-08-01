const express = require('express');
const router = express.Router();
const User = require('../controller/user');
const Conto = require('../controller/conto');
const Transazione = require('../controller/transazione');

const transazione = new Transazione();
const conto = new Conto();
const user = new User();

//Restituisce la pagina di index
router.all('/', (req, res, next) =>{
    let user = req.session.user;
    if(!user) {
        res.render('index', {title: 'MoneyGO'});
    }else{
        res.redirect('/home');
    }

});

router.get('/home', (req, res, next) =>{
    let user = req.session.user;
    if(user){
        res.render('home', {user:req.session.user, conto:req.session.conto, transazioni:req.session.transazioni});
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
                            req.session.transazioni = resTransazioni;
                            //console.log(resTransazioni);
                            res.send("MATCH");
                            res.end();
                        })
                    });
                }
                else if(!result){
                    console.log("no match: " + result);
                    res.send("NOMATCH");
                    res.end();
                }
            })
        }
    })

});

//Logout richiesta
router.get('/logout', (req,res, next)=>{
    if(req.session.user){
        req.session.destroy((function () {
            res.redirect('/');
        }));
    }
});

//Richiesta pagina registrazione
router.get('/registrati', (req,res,next) =>{
    res.render('registrati', {title:'Registrati su MoneyGO'});
});

router.get('/verificaaccesso', (req, res, next) =>{
   res.send("CIAO");
});

module.exports = router;