const express = require('express');
const router = express.Router();
const User = require('../controller/user');

const user = new User();

//funzione che aggiorna l'email quando l'utente vuole modificarla
router.post('/aggiornaEmail', (req,res,next)=>{

    let email = req.body.email;
    let nick = req.session.user.nickname;
    console.log(email +" " + nick);

    user.updateEmail(email,nick,function (result) {
        if(result){
            req.session.user.email=email;
            res.send("DONE");
        }
        else res.send("FAULT");
        res.end();
    })
});

module.exports = router;
