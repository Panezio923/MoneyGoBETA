const express = require('express');
const router = express.Router();
const User = require('../controllers/user');
const Conto = require('../controllers/conto');

const conto = new Conto();
const user = new User();

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
                    res.send("ADDUSER");
                    res.end();
                }
            })
        }else{
            res.send("ERRUSER");
            res.end();
        }
    })
});

module.exports = router;