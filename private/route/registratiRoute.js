const express = require('express');
const router = express.Router();
const User = require('../controller/user');
const Conto = require('../controller/conto');
const mailer = require('../mailer');

const conto = new Conto();
const user = new User();

mailer.inizializza();

function confermaRegistrazione(nomeUtente, email, callback){
    mailer.inviaMailDiConferma(nomeUtente, email, function (esito) {
        callback(esito);
    });
}

router.post('/verificaNick', (req,res,next)=>{
    let nickname = req.body.nick;
    user.findNick(nickname, function (result) {
        if(result.length){
            res.send("EXIST");
            res.end();
        }else{
            res.send("NOTEXIST");
            res.end();
        }
    })
});

router.post('/verificaEmailUnica', (req,res,next)=>{
    let email = req.body.email;
    user.findEmail(email, function (result) {
        if(result.length){
            res.send("EXIST");
            res.end();
        }else{
            res.send("NOTEXIST");
            res.end();
        }
    })
});

//RICHIESTA REGISTRAZIONE
router.post('/inviaRegistrazione', (req, res, next) =>{
    user.createUser(req.body, function (result) {
        if(result){
            conto.createConto(req.body.nickname, function (resConto) {
                if(resConto){
                   mailer.inviaMailRegistrazione( req.body.email, req.body.nickname, function (esito) {
                        if(esito)
                            res.send("ADDUSER");
                        else
                            res.send("ERRUSER");
                        res.end();
                    })
                }
            })
        }else{
            res.send("ERRUSER");
            res.end();
        }
    })
});


module.exports = router;