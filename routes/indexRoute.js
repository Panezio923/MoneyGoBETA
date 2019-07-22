const express = require('express');
const router = express.Router();
const User = require('../controllers/user');
const Conto = require('../controllers/conto');
const Transazione = require('../controllers/transazione');

const transazione = new Transazione();
const conto = new Conto();
const user = new User();

//Restituisce la pagina di index
router.get('/', (req, res, next) =>{
    let user = req.session.user;
    if(user) {
        res.redirect('/home');
        return;
    }
    res.render('index', {title: 'MoneyGO'});
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
                    conto.calcolaSaldo(req.body.user, function (resConto) {
                        req.session.conto = resConto;
                        transazione.recuperaTransazione(req.body.user, function (resTransazioni) {
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