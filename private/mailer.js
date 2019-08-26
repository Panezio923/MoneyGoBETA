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
    var html = "<head>\n" +
        "    <meta charset=\"utf-8\">\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
        "    <title>MoneyGo</title>\n" +
        "    <link rel=\"stylesheet\" href=\"../public/stylesheets/css/bootstrap.min.css\">\n" +
        "    <link rel=\"stylesheet\" href=\"../public/stylesheets/style.css\">\n" +
        "    <link rel=\"stylesheet\" href=\"../public/stylesheets/schermata.css\">\n" +
        "\n" +
        "    <!-- Font -->\n" +
        "    <link href='https://fonts.googleapis.com/css?family=Didact Gothic' rel='stylesheet'>\n" +
        "    <script src=\"https://kit.fontawesome.com/3bc88e1c04.js\"></script>\n" +
        "</head>\n" +
        "\n" +
        "\n" +
        "<body style=\"Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;\">\n" +
        "<center class=\"wrapper\" style=\"width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;\">\n" +
        "    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#f3f2f0;\" bgcolor=\"#f3f2f0;\">\n" +
        "        <tr>\n" +
        "            <td width=\"100%\"><div class=\"webkit\" style=\"max-width:800px;Margin:0 auto;\">\n" +
        "\n" +
        "                <!--[if (gte mso 9)|(IE)]>\n" +
        "\n" +
        "                <table width=\"800\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0\" >\n" +
        "                    <tr>\n" +
        "                        <td style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                <![endif]-->\n" +
        "\n" +
        "                <!-- ======= start main body ======= -->\n" +
        "                <table class=\"outer\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0;Margin:0 auto;width:100%;max-width:800px;\">\n" +
        "                    <tr>\n" +
        "                        <td style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\"><!-- ======= start header ======= -->\n" +
        "\n" +
        "                            <table border=\"0\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"  >\n" +
        "                                <tr>\n" +
        "                                    <td><table style=\"width:100%;\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
        "                                        <tbody>\n" +
        "                                        <tr>\n" +
        "                                            <td align=\"center\"><center>\n" +
        "                                                <table border=\"0\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"Margin: 0 auto;\">\n" +
        "                                                    <tbody>\n" +
        "                                                    <tr>\n" +
        "                                                        <td class=\"one-column\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-spacing:0\">\n" +
        "                                                            <tr>\n" +
        "                                                                <td>&nbsp;</td>\n" +
        "                                                            </tr>\n" +
        "                                                        </table></td>\n" +
        "                                                    </tr>\n" +
        "                                                    </tbody>\n" +
        "                                                </table>\n" +
        "                                            </center></td>\n" +
        "                                        </tr>\n" +
        "                                        </tbody>\n" +
        "                                    </table></td>\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "                            <table border=\"0\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"  >\n" +
        "                                <tr>\n" +
        "                                    <td><table style=\"width:100%;\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
        "                                        <tbody>\n" +
        "                                        <tr>\n" +
        "                                            <td align=\"center\"><center>\n" +
        "                                                <table border=\"0\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"Margin: 0 auto;\">\n" +
        "                                                    <tbody>\n" +
        "                                                    <tr>\n" +
        "                                                        <td class=\"one-column\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" bgcolor=\"#1e90ff\"><!-- ======= start header ======= -->\n" +
        "\n" +
        "                                                            <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-top:1px solid #e8e7e5\">\n" +
        "                                                                <tr>\n" +
        "                                                                    <td>&nbsp;</td>\n" +
        "                                                                </tr>\n" +
        "                                                                <tr>\n" +
        "                                                                    <td>&nbsp;</td>\n" +
        "                                                                </tr>\n" +
        "                                                                <tr>\n" +
        "                                                                    <td class=\"col-3\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;\" ><!--[if (gte mso 9)|(IE)]>\n" +
        "                                                                        <table width=\"100%\" style=\"border-spacing:0\" >\n" +
        "                                                                            <tr>\n" +
        "                                                                                <td width=\"50%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px;\" >\n" +
        "                                                                        <![endif]-->\n" +
        "\n" +
        "                                                                        <div class=\"column\" style=\"width:100%;display:inline-block;\">\n" +
        "                                                                            <table class=\"contents\" style=\"border-spacing:0; width:100%\"  >\n" +
        "                                                                                <tr>\n" +
        "                                                                                    <td style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px;\" align=\"center\"><p  style=\"font-size:3rem; color: white\">MoneyGO <i class=\"fas fa-comment-dollar\"></i> </p></td>\n" +
        "                                                                                </tr>\n" +
        "                                                                            </table>\n" +
        "                                                                        </div>\n" +
        "\n" +
        "                                                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                                                        </td><td width=\"80%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                                                                        <![endif]-->\n" +
        "\n" +
        "                                                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                                                        </td>\n" +
        "                                                                        </tr>\n" +
        "                                                                        </table>\n" +
        "                                                                        <![endif]--></td>\n" +
        "                                                                </tr>\n" +
        "                                                                <tr>\n" +
        "                                                                    <td height=\"30\">&nbsp;</td>\n" +
        "                                                                </tr>\n" +
        "                                                            </table></td>\n" +
        "                                                    </tr>\n" +
        "                                                    </tbody>\n" +
        "                                                </table>\n" +
        "                                            </center></td>\n" +
        "                                        </tr>\n" +
        "                                        </tbody>\n" +
        "                                    </table></td>\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "                            <!-- ======= end header ======= -->\n" +
        "\n" +
        "                            <!-- ======= start page ======= -->\n" +
        "\n" +
        "                            <table class=\"one-column\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5\" bgcolor=\"#FFFFFF\">\n" +
        "                                <tr>\n" +
        "                                    <td align=\"left\" style=\"padding:20px 40px 40px 40px\"><p style=\"color:#262626; font-size:32px; text-align:left\">Ciao \" + utente + \" </p>\n" +
        "                                        <p style=\"color:#000000; font-size:25px; text-align:left; line-height:22px \">\n" +
        "                                            Benvenuto su MoneyGo, entra nella piattaforma e comincia a gestire il tuo <pippo style=\"color: rgba(89,209,82,0.87);font-size:25px; text-align:left; line-height:22px\">denaro.</pippo></p></br>\n" +
        "                                        </td>\n" +
        "\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "\n" +
        "                            <!-- ======= end page ======= -->\n" +
        "\n" +
        "\n" +
        "                            <!-- ======= start footer ======= -->\n" +
        "\n" +
        "                            <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n" +
        "                                <tr>\n" +
        "                                    <td height=\"30\">&nbsp;</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"two-column\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;\"><!--[if (gte mso 9)|(IE)]>\n" +
        "                                        <table width=\"100%\" style=\"border-spacing:0\" >\n" +
        "                                            <tr>\n" +
        "                                                <td width=\"50%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                                        <![endif]-->\n" +
        "\n" +
        "                                        <div class=\"column\" style=\"width:100%;max-width:490px;display:inline-block;vertical-align:top;\">\n" +
        "                                            <table class=\"contents\" style=\"border-spacing:0; width:100%\">\n" +
        "                                                <tr>\n" +
        "                                                    <td width=\"100%\" align=\"left\" valign=\"middle\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\"><p style=\"color:#787777; font-size:13px; text-align:left;\">\n" +
        "                                                        Copyright &copy; Sito creato da Sergio Comella, Francesco Bondi e Valerio Gambino.\n" +
        "                                                    </p></td>\n" +
        "                                                </tr>\n" +
        "                                            </table>\n" +
        "                                        </div>\n" +
        "\n" +
        "                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                        </td><td width=\"50%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                                        <![endif]-->\n" +
        "\n" +
        "\n" +
        "                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                        </td>\n" +
        "                                        </tr>\n" +
        "                                        </table>\n" +
        "                                        <![endif]--></td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td height=\"30\">&nbsp;</td>\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "\n" +
        "                            <!-- ======= end footer ======= --></td>\n" +
        "                    </tr>\n" +
        "                </table>\n" +
        "                <!--[if (gte mso 9)|(IE)]>\n" +
        "                </td>\n" +
        "                </tr>\n" +
        "                </table>\n" +
        "                <![endif]-->\n" +
        "            </div></td>\n" +
        "        </tr>\n" +
        "    </table>\n" +
        "</center>\n" +
        "</body>\n" +
        "\n" ;

    let esito = transporter.sendMail({
                    from: '"MoneyGO 💸" <moneygo@staff.com>',
                    to: destinatario,
                    subject: "Registrazione completata",
                    html: html,
                });
    callback(esito);
};

exports.inviaMailRecuperoPassword = function (destinatario, utente, password, callback) {
    var html = "<head>\n" +
        "    <meta charset=\"utf-8\">\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
        "    <title>MoneyGo</title>\n" +
        "    <link rel=\"stylesheet\" href=\"../public/stylesheets/css/bootstrap.min.css\">\n" +
        "    <link rel=\"stylesheet\" href=\"../public/stylesheets/style.css\">\n" +
        "    <link rel=\"stylesheet\" href=\"../public/stylesheets/schermata.css\">\n" +
        "\n" +
        "    <!-- Font -->\n" +
        "    <link href='https://fonts.googleapis.com/css?family=Didact Gothic' rel='stylesheet'>\n" +
        "    <script src=\"https://kit.fontawesome.com/3bc88e1c04.js\"></script>\n" +
        "</head>\n" +
        "\n" +
        "\n" +
        "<body style=\"Margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f3f2f0;\">\n" +
        "<center class=\"wrapper\" style=\"width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f3f2f0;\">\n" +
        "    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#f3f2f0;\" bgcolor=\"#f3f2f0;\">\n" +
        "        <tr>\n" +
        "            <td width=\"100%\"><div class=\"webkit\" style=\"max-width:800px;Margin:0 auto;\">\n" +
        "\n" +
        "                <!--[if (gte mso 9)|(IE)]>\n" +
        "\n" +
        "                <table width=\"800\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0\" >\n" +
        "                    <tr>\n" +
        "                        <td style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                <![endif]-->\n" +
        "\n" +
        "                <!-- ======= start main body ======= -->\n" +
        "                <table class=\"outer\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0;Margin:0 auto;width:100%;max-width:800px;\">\n" +
        "                    <tr>\n" +
        "                        <td style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\"><!-- ======= start header ======= -->\n" +
        "\n" +
        "                            <table border=\"0\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"  >\n" +
        "                                <tr>\n" +
        "                                    <td><table style=\"width:100%;\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
        "                                        <tbody>\n" +
        "                                        <tr>\n" +
        "                                            <td align=\"center\"><center>\n" +
        "                                                <table border=\"0\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"Margin: 0 auto;\">\n" +
        "                                                    <tbody>\n" +
        "                                                    <tr>\n" +
        "                                                        <td class=\"one-column\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-spacing:0\">\n" +
        "                                                            <tr>\n" +
        "                                                                <td>&nbsp;</td>\n" +
        "                                                            </tr>\n" +
        "                                                        </table></td>\n" +
        "                                                    </tr>\n" +
        "                                                    </tbody>\n" +
        "                                                </table>\n" +
        "                                            </center></td>\n" +
        "                                        </tr>\n" +
        "                                        </tbody>\n" +
        "                                    </table></td>\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "                            <table border=\"0\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"  >\n" +
        "                                <tr>\n" +
        "                                    <td><table style=\"width:100%;\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
        "                                        <tbody>\n" +
        "                                        <tr>\n" +
        "                                            <td align=\"center\"><center>\n" +
        "                                                <table border=\"0\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"Margin: 0 auto;\">\n" +
        "                                                    <tbody>\n" +
        "                                                    <tr>\n" +
        "                                                        <td class=\"one-column\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" bgcolor=\"#1e90ff\"><!-- ======= start header ======= -->\n" +
        "\n" +
        "                                                            <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-top:1px solid #e8e7e5\">\n" +
        "                                                                <tr>\n" +
        "                                                                    <td>&nbsp;</td>\n" +
        "                                                                </tr>\n" +
        "                                                                <tr>\n" +
        "                                                                    <td>&nbsp;</td>\n" +
        "                                                                </tr>\n" +
        "                                                                <tr>\n" +
        "                                                                    <td class=\"col-3\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;\" ><!--[if (gte mso 9)|(IE)]>\n" +
        "                                                                        <table width=\"100%\" style=\"border-spacing:0\" >\n" +
        "                                                                            <tr>\n" +
        "                                                                                <td width=\"50%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px;\" >\n" +
        "                                                                        <![endif]-->\n" +
        "\n" +
        "                                                                        <div class=\"column\" style=\"width:100%;display:inline-block;\">\n" +
        "                                                                            <table class=\"contents\" style=\"border-spacing:0; width:100%\"  >\n" +
        "                                                                                <tr>\n" +
        "                                                                                    <td style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0px;\" align=\"center\"><p  style=\"font-size:3rem; color: white\">MoneyGO <i class=\"fas fa-comment-dollar\"></i> </p></td>\n" +
        "                                                                                </tr>\n" +
        "                                                                            </table>\n" +
        "                                                                        </div>\n" +
        "\n" +
        "                                                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                                                        </td><td width=\"80%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                                                                        <![endif]-->\n" +
        "\n" +
        "                                                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                                                        </td>\n" +
        "                                                                        </tr>\n" +
        "                                                                        </table>\n" +
        "                                                                        <![endif]--></td>\n" +
        "                                                                </tr>\n" +
        "                                                                <tr>\n" +
        "                                                                    <td height=\"30\">&nbsp;</td>\n" +
        "                                                                </tr>\n" +
        "                                                            </table></td>\n" +
        "                                                    </tr>\n" +
        "                                                    </tbody>\n" +
        "                                                </table>\n" +
        "                                            </center></td>\n" +
        "                                        </tr>\n" +
        "                                        </tbody>\n" +
        "                                    </table></td>\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "                            <!-- ======= end header ======= -->\n" +
        "\n" +
        "                            <!-- ======= start page ======= -->\n" +
        "\n" +
        "                            <table class=\"one-column\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-spacing:0; border-left:1px solid #e8e7e5; border-right:1px solid #e8e7e5; border-bottom:1px solid #e8e7e5\" bgcolor=\"#FFFFFF\">\n" +
        "                                <tr>\n" +
        "                                    <td align=\"left\" style=\"padding:20px 40px 40px 40px\"><p style=\"color:#262626; font-size:32px; text-align:left\">Ciao " + utente + "</p>\n" +
        "                                        <p style=\"color:#000000; font-size:16px; text-align:left; line-height:22px \">\n" +
        "                                            Ecco la nuova password generata automaticamente dal sistema. Ricorda che puoi cambiarla in qualsiasi momento dalla sezione gestione profilo di MoneyGO.</p></br>\n" +
        "\n" +
        "                                        <p style= \"color:#000000; font-size:30px; text-align: center; line-height:22px; \">\n" +
        "                                           "+ password + " </p> </br>\n" +
        "\n" +
        "\n" +
        "                                        </td>\n" +
        "\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "\n" +
        "                            <!-- ======= end page ======= -->\n" +
        "\n" +
        "\n" +
        "                            <!-- ======= start footer ======= -->\n" +
        "\n" +
        "                            <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n" +
        "                                <tr>\n" +
        "                                    <td height=\"30\">&nbsp;</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"two-column\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;text-align:center;font-size:0;\"><!--[if (gte mso 9)|(IE)]>\n" +
        "                                        <table width=\"100%\" style=\"border-spacing:0\" >\n" +
        "                                            <tr>\n" +
        "                                                <td width=\"50%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                                        <![endif]-->\n" +
        "\n" +
        "                                        <div class=\"column\" style=\"width:100%;max-width:490px;display:inline-block;vertical-align:top;\">\n" +
        "                                            <table class=\"contents\" style=\"border-spacing:0; width:100%\">\n" +
        "                                                <tr>\n" +
        "                                                    <td width=\"100%\" align=\"left\" valign=\"middle\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\"><p style=\"color:#787777; font-size:13px; text-align:left;\">\n" +
        "                                                        Copyright &copy; Sito creato da Sergio Comella, Francesco Bondi e Valerio Gambino.\n" +
        "                                                    </p></td>\n" +
        "                                                </tr>\n" +
        "                                            </table>\n" +
        "                                        </div>\n" +
        "\n" +
        "                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                        </td><td width=\"50%\" valign=\"top\" style=\"padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;\" >\n" +
        "                                        <![endif]-->\n" +
        "\n" +
        "\n" +
        "                                        <!--[if (gte mso 9)|(IE)]>\n" +
        "                                        </td>\n" +
        "                                        </tr>\n" +
        "                                        </table>\n" +
        "                                        <![endif]--></td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td height=\"30\">&nbsp;</td>\n" +
        "                                </tr>\n" +
        "                            </table>\n" +
        "\n" +
        "                            <!-- ======= end footer ======= --></td>\n" +
        "                    </tr>\n" +
        "                </table>\n" +
        "                <!--[if (gte mso 9)|(IE)]>\n" +
        "                </td>\n" +
        "                </tr>\n" +
        "                </table>\n" +
        "                <![endif]-->\n" +
        "            </div></td>\n" +
        "        </tr>\n" +
        "    </table>\n" +
        "</center>\n" +
        "</body>\n" +
        "\n";

    let esito = transporter.sendMail({
        from: '"MoneyGO 💸" <moneygo@staff.com>',
        to: destinatario,
        subject: "Recupero Password",
        html: html,
    });
    callback(esito);

};

