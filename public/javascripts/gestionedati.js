(function () {
    var mainview = {};
    var maincontrol = {};

    var salvaemail=false;

    $("#ModificaEmail").on("click", function () {maincontrol.premutoModificaEmail()});
    $("#SalvaEmail").on("click", function () {maincontrol.premutoSalvaEmail()});
    $("#ModificaTelefono").on("click", function () {maincontrol.premutoModificaTelefono()});
    $("#ModificaLimite").on("click", function () {maincontrol.premutoModificaLimite()});
    $("#ModificaComunicazione").on("click", function () {maincontrol.premutoModificaComunicazione()});


    maincontrol.premutoModificaEmail = function () {
        $("#email").hide();
        $("#emailModifica").show();

        $("#ModificaEmail").hide();
        $("#SalvaEmail").show();
    };

    maincontrol.premutoSalvaEmail = function () {
        var email = $("#emailModifica").val();
        console.log(email);

        $.ajax({
            type: "POST",
            url : "/home/gestioneDati/aggiornaEmail",
            data: {email:email},

            success : function(msg) {
                console.log("ciao3");
                if(msg == "DONE") {
                    location.reload();
                }
                else if( msg == "FAULT"){
                    salvaemail = false;
                    $("#alert_text").text("Impossibile caricare l'email,si prega di riprovare");
                    $("#alert").show();
                }
            }
        });
    };
    /* maincontrol.controllaMailDuplicata = function(email){
         $.ajax({
             type: "POST",
             url: "/registrati/verificaEmailUnica",
             data: {email: email},

             success: function (msg) {
                 if(msg === "EXIST"){
                     email_validata=false;
                     mainview.emailDuplicata();
                     $("#email").css("borderColor", "red");

                     $("#email").on("click", function () {
                         $("#email").css("borderColor", "");
                     });
                 }else if (msg === "NOTEXIST"){
                     email_validata=true;
                     mainview.ripulisciCampiErrati();
                 }
             }
         })
     };
  */

    maincontrol.premutoModificaTelefono = function () {
        $("#telefono").hide();
        $("#telefonoModifica").show();

        $("#ModificaTelefono").hide();
        $("#SalvaTelefono").show();
    };

    maincontrol.premutoModificaLimite = function () {
        $("#limite").hide();
        $("#limiteModifica").show();

        $("#ModificaLimite").hide();
        $("#SalvaLimite").show();
    };

    maincontrol.premutoModificaComunicazione = function () {
        $("#comunicazione").hide();
        $("#comunicazioneModifica").show();

        $("#ModificaComunicazione").hide();
        $("#SalvaComunicazione").show();
    };


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
                    maincontrol.controllaMailDuplicata($("#ModificaEmail").val());
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
            }
            salvaemail = false;
        });
    });

})();

