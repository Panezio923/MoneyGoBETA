"use strict";
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
        + ' Entra e comincia subito a gestire il tuo denaro.'

    let esito = transporter.sendMail({
                    from: '"MoneyGO 💸" <moneygo@staff.com>',
                    to: destinatario,
                    subject: "Registrazione completata",
                    html: html,
                });
    callback(esito);
};
//hghff

