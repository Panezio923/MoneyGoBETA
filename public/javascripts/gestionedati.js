(function () {
    var mainview = {};
    var maincontrol = {
        codiceBot: null
    };

    var salvaemail = false;
    var salvatelefono = false;
    var salvalimite = false;
    var password_validata = false;
    var conferma_password_validata = false;
    var vecchia_password = false;

    $("#ModificaEmail").on("click", function () {maincontrol.premutoModificaEmail()});
    $("#SalvaEmail").on("click", function () {maincontrol.premutoSalvaEmail()});
    $("#ModificaTelefono").on("click", function () {maincontrol.premutoModificaTelefono()});
    $("#SalvaTelefono").on("click", function () {maincontrol.premutoSalvaTelefono()});
    $("#ModificaLimite").on("click", function () {maincontrol.premutoModificaLimite()});
    $("#SalvaLimite").on("click", function () {maincontrol.premutoSalvaLimite()});
    $("#ModificaComunicazione").on("click", function () {maincontrol.premutoModificaComunicazione()});
    $("#SalvaComunicazione").on("click", function () {maincontrol.premutoSalvaComunicazione()});
    $("#form_cambia_password").submit(function (e) {maincontrol.premutoConferma(e)});
    $("#sendCodice").on("click", function (e) {maincontrol.caricaCodice( $("#codiceBot").val())});


    maincontrol.premutoModificaEmail = function () {
      $("#email").hide();
      $("#emailModifica").show();

      $("#ModificaEmail").hide();
      $("#SalvaEmail").show();
    };

    maincontrol.premutoSalvaEmail = function () {
        var email = $("#emailModifica").val();

        if(salvaemail) {
            $.ajax({
                type: "POST",
                url: "/home/gestioneDati/aggiornaEmail",
                data: {email: email},

                success: function (msg) {
                    if (msg == "DONE") {
                        location.reload();
                    } else if (msg == "FAULT") {
                        salvaemail = false;
                        mainview.mostraAlert("Impossibile aggiornare l'email, si prega di riprovare");
                    }
                }
            });
        }
    };
    maincontrol.controllaMailDuplicata = function(email){
        $.ajax({
            type: "POST",
            url: "/registrati/verificaEmailUnica",
            data: {email: email},

            success: function (msg) {
                if(msg === "EXIST"){
                    salvaemail=false;
                    mainview.emailDuplicata();
                    $("#emailModifica").css("borderColor", "red");

                    $("#emailModifica").on("click", function () {
                        $("#emailModifica").css("borderColor", "");
                    });
                }else if (msg === "NOTEXIST"){
                    salvaemail=true;
                    mainview.ripulisciCampiErrati();
                }
            }
        })
    };

    maincontrol.premutoModificaTelefono = function () {
        $("#telefono").hide();
        $("#telefonoModifica").show();

        $("#ModificaTelefono").hide();
        $("#SalvaTelefono").show();
    };

    maincontrol.premutoSalvaTelefono = function () {
        var telefono = $("#telefonoModifica").val();
        console.log(salvatelefono)
            if(salvatelefono){
                    $.ajax({
                        type: "POST",
                        url: "/home/gestioneDati/aggiornaTelefono",
                        data: {telefono: telefono},

                        success: function (msg) {
                            if (msg == "DONE") {
                                location.reload();
                            } else if (msg == "FAULT") {
                                salvatelefono = false;
                               mainview.mostraAlert("Impossibile caricare il numero di telefono, si prega di riprovare");
                            }
                        }
                    });
            }
    };

    maincontrol.premutoModificaLimite = function () {
        $("#limite").hide();
        $("#limiteModifica").show();

        $("#ModificaLimite").hide();
        $("#SalvaLimite").show();
    };

    maincontrol.premutoSalvaLimite = function () {
        var limite = $("#limiteModifica").val();
        if(salvalimite){
            $.ajax({
                type: "POST",
                url: "/home/gestioneDati/aggiornaLimite",
                data: {limite_spesa: limite},

                success: function (msg) {
                    if (msg == "DONE") {
                        location.reload();
                    } else if (msg == "FAULT") {
                        salvalimite = false;
                       mainview.mostraAlert("Impossibile caricare il limite di spesa, si prega di riprovare");
                    }
                }
            });
        }
    };

    maincontrol.premutoModificaComunicazione = function () {
        $("#comunicazione").hide();
        $("#comunicazioneModifica").show();

        $("#ModificaComunicazione").hide();
        $("#SalvaComunicazione").show();
    };

    maincontrol.premutoSalvaComunicazione = function() {
        var comunicazione = $("#comunicazioneModifica option:selected").text();
        if(comunicazione === "Email")  comunicazione = 0;
        else if(comunicazione === "Telegram") comunicazione = 2;

            $.ajax({
                type: "POST",
                url: "/home/gestioneDati/aggiornaComunicazione",
                data: {comunicazione: comunicazione},

                success: function (msg) {
                    if (msg == "DONE") {
                        location.reload();
                    } else if (msg == "FAULT") {
                       mainview.mostraAlert("Impossibile cambiare il tipo di comunicazione, si prega di riprovare");
                    }
                }
            });
    }

    maincontrol.verificaVecchiaPassword = function(){

            var password = $("#passwordVecchia").val();
            console.log(password);
            $.ajax({
                type: "POST",
                url: "/home/gestioneDati/controllaPassword",
                data: {password : password},
                success: function (msg) {
                    console.log(msg);
                    if (msg === "RIGHT") {
                        mainview.ripulisciCampiErrati($("#passwordVecchia"));
                        vecchia_password = true;
                    } else if (msg === "WRONG") {
                        console.log(msg);
                        mainview.mostraAlert("Password non corretta");
                        mainview.campiErrati($("#passwordVecchia"));
                        vecchia_password = false;
                    }
                }
            });
    }
   //cambio password
    maincontrol.premutoConferma = function(e) {
        e.preventDefault();
        if(vecchia_password && password_validata && conferma_password_validata){
            var password = $("#passwordNuova").val();
            $.ajax({
                type: "POST",
                url: "/home/gestioneDati/ModificaPassword",
                data: {password : password},

                success: function (msg) {
                    if (msg == "DONE") {
                        $("#successAlert").text("Password aggiornata con successo");
                        $("#successAlert").show();
                        $("#passwordVecchia").val("");
                        $("#passwordNuova").val("");
                        $("#passwordRipeti").val("");
                        $("#passwordVecchia").removeClass("is-valid");
                        $("#passwordRipeti").removeClass("is-valid");
                        $("#passwordNuova").css("background-color", "rgb(255,255,255)");
                        $("#grado_password").text("");

                    } else if (msg == "FAULT") {
                      mainview.mostraAlert("Qualcosa è andato storto, per favore riprovare")
                    }
                }
            });
        }
    };

    maincontrol.getCodiceBot = function(){
          $.ajax({
              url: '/home/gestioneDati/getCodiceBot',
              type: 'post',
              //no data,

              success: function (codice) {
                  console.log(codice.telegram);
                  if(codice.telegram !== null) {
                      maincontrol.codiceBot = codice.telegram;
                      $("#codiceBot").val(maincontrol.codiceBot).css("background-color", "#99ff99").prop("disabled", true);
                      $("#sendCodice").prop("disabled", true);
                  }
                  else {
                  }
              }
          })
    };

    maincontrol.caricaCodice = function(codice){
        var pattern = /\d{9}/;
        if(codice !== "" && codice.match(pattern)) {
            $.ajax( {
                url: '/home/gestioneDati/caricaCodiceBot',
                type: 'post',
                data: {codice: codice},

                success: function (msg) {
                    if (msg === "DONE") {
                        $( "#codiceBot" ).val( codice );
                        $( "#sendCodice" ).prop( "disabled", true );
                    } else if (msg === "ERR") {
                        mainview.campiErrati( $( "#codiceBot" ), "Qualcosa è andato storto, si prega di riprovare" );
                    }
                }
            } )
        }
    };


    mainview.mostraAlert = function(msg){
        $("#alert_text").text(msg);
        $("#alert").show("slow");
    };

    mainview.campiErrati = function (id, msg) {
        $("#alert_text").text(msg);
        $("#alert").show("slow");
        id.addClass("is-invalid");
        id.removeClass("is-valid");

    };
    mainview.emailDuplicata = function(){
        $("#alert_text").text("Email giù utilizzata");
        $("#alert").show("slow");
    };

    mainview.ripulisciCampiErrati = function(id){
        $("#alert").hide();
        id.removeClass("is-invalid");
        id.addClass("is-valid");
    };
    mainview.nascondiInfoPassword = function(){
        $("#alertCheck").hide();
    };
    mainview.mostraInfoPassword =  function(){
        $("#textCheck").text("La password deve contenere più di 8 caratteri di cui almeno una lettera Maiuscola, una minuscola ed un numero.");
        $("#alertCheck").show();
    };



    $(document).ready(function () {

        maincontrol.getCodiceBot();

        /*Controllo Email */
        $("#emailModifica").blur(function () {
            if ($("#emailModifica").val() != "") {
                if (/^[A-Z0-9a-z._-]{3,}@[A-Z0-9a-z.-]{2,}\.[A-Za-z0-9]{2,4}$/.test($("#emailModifica").val())) {
                    salvaemail = true;
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaMailDuplicata($("#emailModifica").val());
                    return;
                } else {
                    console.log("ciao");
                    salvaemail = false;
                    mainview.campiErrati();
                    $("#emailModifica").css("borderColor", "red");

                    $("#emailModifica").on("click", function () {
                        $("#emailModifica").css("borderColor", "");
                    });
                }
            } else {
                salvaemail = false;
                mainview.campiErrati();
                $("#emailModifica").css("borderColor", "red");

                $("#emailModifica").on("click", function () {
                    $("#emailModifica").css("borderColor", "");
                });
            }
            salvaemail = false;
        });

        //controllo Telefono
        $("#telefonoModifica").blur(function () {
            if ($("#telefonoModifica").val() != "") {
                if (/^[0-9]{10}$/.test($("#telefonoModifica").val())) {
                    salvatelefono = true;
                    mainview.ripulisciCampiErrati();
                    return;
                } else {
                    salvatelefono = false;
                    mainview.campiErrati();
                    $("#telefonoModifica").css("borderColor", "red");

                    $("#telefonoModifica").on("click", function () {
                        $("#telefonoModifica").css("borderColor", "");
                    });
                }
            }
            salvatelefono = false;
        });

        //controllo Limite Spesa
        $("#limiteModifica").blur(function () {
            if ($("#limiteModifica").val() != "") {
                if (/^[0-9]/.test($("#limiteModifica").val())) {
                    salvalimite = true;
                    mainview.ripulisciCampiErrati();
                    return;
                } else {
                    salvalimite = false;
                    mainview.campiErrati();
                    $("#limiteModifica").css("borderColor", "red");

                    $("#limiteModifica").on("click", function () {
                        $("#limiteModifica").css("borderColor", "");
                    });
                }
            }
            salvalimite = false;
        });

        //controllo che la vecchia password sia uguale alla password attuale
        $("#passwordVecchia").blur(function () {
            maincontrol.verificaVecchiaPassword();
        });


        /* Controllo dell'input per PASSWORD */
        $("#passwordNuova").focus(function () {
            $("#passwordNuova").css("background-color", "white");
            mainview.mostraInfoPassword();
            if ($("#passwordNuova").val() == "") {
                $("#difficolta_password").hide();
            }
            $("#password_errata").hide();
        });

        $("#passwordNuova").blur(function () {
            mainview.nascondiInfoPassword();
            if (($("#passwordNuova").val() != "") &&
                ($("#passwordNuova").val().length >= 8) &&
                (/[0-9]/.test($("#passwordNuova").val())) &&
                (/[a-z]/.test($("#passwordNuova").val())) &&
                (/[A-Z]/.test($("#passwordNuova").val()))) {
                password_validata = true;
            } else {
                password_validata = false;
                $("#password_errata").show();
            }
        });

        // Gestisco la visualizzazione della difficoltà della password
        $("#passwordNuova").keyup(function () {
            if (($("#passwordNuova").val() != "") &&
                ($("#passwordNuova").val().length >= 8) &&
                (/[0-9]/.test($("#passwordNuova").val())) &&
                (/[a-z]/.test($("#passwordNuova").val())) &&
                (/[A-Z]/.test($("#passwordNuova").val()))) {
                if (($("#passwordNuova").val().length >= 8) && ($("#passwordNuova").val().length < 12)) {
                    $("#passwordNuova").css("background-color", "rgb(255, 140, 0)"); // darkorange
                    $("#grado_password").text("Debole");
                } else if (($("#passwordNuova").val().length >= 12) && ($("#passwordNuova").val().length < 16)) {
                    $("#passwordNuova").css("background-color", "rgba(255,245,0,0.5)"); // gold
                    $("#grado_password").text("Media");
                } else if (($("#passwordNuova").val().length >= 16)) {
                    $("#passwordNuova").css("background-color", "rgba(21,205,2,0.5)"); // limegreen
                    $("#grado_password").text("Forte");
                }
            } else {
                $("#passwordNuova").css("background-color", "white"); // limegreen
                $("#grado_password").text("");
            }
        });

        /* Controllo dell'input per CONFERMA PASSWORD */
        $("#passwordRipeti").focus(function () {
            $("#conferma_errata").hide();
        });

        $("#passwordRipeti").blur(function () {
            if ($("#passwordNuova").val().length != 0) {
                if ($("#passwordRipeti").val() == $("#passwordNuova").val()) {
                    conferma_password_validata = true;
                    mainview.ripulisciCampiErrati($("#passwordRipeti"));
                } else {
                    conferma_password_validata = false;
                    $("#conferma_errata").show();
                    mainview.campiErrati($("#passwordRipeti"));
                }
            } else
                conferma_password_validata = false;
        });
        // Azzero il campo "conferma password" se modifico la password
        $("#passwordNuova").change(function () {
            conferma_password_validata = false;
            $("#passwordRipeti").val("");
            $("#conferma_errata").hide();
        });

    });
})();

