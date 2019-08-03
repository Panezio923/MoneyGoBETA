(function () {
    var mainview = {};
    var maincontrol = {};

    var salvaemail = false;
    var salvatelefono = false;
    var salvalimite = false;

    $("#ModificaEmail").on("click", function () {maincontrol.premutoModificaEmail()});
    $("#SalvaEmail").on("click", function () {maincontrol.premutoSalvaEmail()});
    $("#ModificaTelefono").on("click", function () {maincontrol.premutoModificaTelefono()});
    $("#SalvaTelefono").on("click", function () {maincontrol.premutoSalvaTelefono()});
    $("#ModificaLimite").on("click", function () {maincontrol.premutoModificaLimite()});
    $("#SalvaLimite").on("click", function () {maincontrol.premutoSalvaLimite()});
    $("#ModificaComunicazione").on("click", function () {maincontrol.premutoModificaComunicazione()});
    $("#SalvaComunicazione").on("click", function () {maincontrol.premutoSalvaComunicazione()});


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
                        $("#alert_text").text("Impossibile caricare l'email,si prega di riprovare");
                        $("#alert").show();
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
                                $("#alert_text").text("Impossibile caricare il numero di telefono,si prega di riprovare");
                                $("#alert").show();
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
                        $("#alert_text").text("Impossibile caricare il limite di spesa,si prega di riprovare");
                        $("#alert").show();
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
        else if(comunicazione === "SMS") comunicazione = 1;
        else if(comunicazione === "Telegram") comunicazione = 2;

            $.ajax({
                type: "POST",
                url: "/home/gestioneDati/aggiornaComunicazione",
                data: {comunicazione: comunicazione},

                success: function (msg) {
                    if (msg == "DONE") {
                        location.reload();
                    } else if (msg == "FAULT") {
                        $("#alert_text").text("Impossibile cambiare il tipo di comunicazione,si prega di riprovare");
                        $("#alert").show();
                    }
                }
            });
    }


    mainview.campiErrati = function () {
        $("#alert_text").text("Per favore, ricontrollare i dati");
        $("#alert").show("slow");

    };
    mainview.emailDuplicata = function(){
        $("#alert_text").text("Email giù utilizzata");
        $("#alert").show("slow");
    };

    mainview.ripulisciCampiErrati = function(){
        $("#alert").hide();
    };



    $(document).ready(function () {

        /*Controllo Email */
        $("#emailModifica").blur(function(){
            if($("#emailModifica").val() != ""){
                if(/^[A-Z0-9a-z._-]{3,}@[A-Z0-9a-z.-]{2,}\.[A-Za-z0-9]{2,4}$/.test($("#emailModifica").val())){
                    salvaemail = true;
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaMailDuplicata($("#emailModifica").val());
                    return;
                }
                else{
                    console.log("ciao");
                    salvaemail = false;
                    mainview.campiErrati();
                    $("#emailModifica").css("borderColor", "red");

                    $("#emailModifica").on("click", function () {
                        $("#emailModifica").css("borderColor", "");
                    });
                }
            }else{
                salvaemail=false;
                mainview.campiErrati();
                $("#emailModifica").css("borderColor", "red");

                $("#emailModifica").on("click", function () {
                    $("#emailModifica").css("borderColor", "");
                });
            }
            salvaemail = false;
        });
    });

    //controllo Telefono
    $("#telefonoModifica").blur(function(){
        if($("#telefonoModifica").val() != ""){
            if(/^[0-9]{10}$/.test($("#telefonoModifica").val())){
                salvatelefono = true;
                mainview.ripulisciCampiErrati();
                return;
            }
            else{
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
    $("#limiteModifica").blur(function(){
        if($("#limiteModifica").val() != ""){
            if(/^[0-9]/.test($("#limiteModifica").val())){
                salvalimite = true;
                mainview.ripulisciCampiErrati();
                return;
            }
            else{
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
})();

