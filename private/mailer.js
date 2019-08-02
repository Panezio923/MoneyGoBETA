"use strict";
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
let transporter;

exports.inizializza = function(){
    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "infoprenotazionesop@gmail.com",
            pass: "teamsop123"
        }
    });
};

exports.inviaMailRegistrazione = function(destinatario, utente, callback) {
    var html = '<body><h2>MoneyGO</h2><div>Ciao ' + utente + '! Benvenuto sul portale di MoneyGo.'
        + ' Entra e comincia subito a gestire il tuo denaro.';

    let esito = transporter.sendMail({
                    from: '"MoneyGO 💸" <moneygo@staff.com>',
                    to: destinatario,
                    subject: "Registrazione completata",
                    html: html,
                });
    callback(esito);
};

exports.inviaMailRecuperoPassword = function (destinatario, utente, password, callback) {
    var html = '<body><h2>Password Modificata</h2><div>Ciao ' + utente + '! Ecco la tua nuova password:'
        + '<h3>'+ password +'</h3>';

    let esito = transporter.sendMail({
        from: '"MoneyGO 💸" <moneygo@staff.com>',
        to: destinatario,
        subject: "Recupero Password",
        html: html,
    });
    callback(esito);

};

