(function () {
    var mainview = {};
    var maincontrol = {};

    /* Variabili ausiliarie per la gestione dei controlli sugli input dell'utente. */
    var nome_validato = false;
    var cognome_validato = false;
    var codicefiscale_validato = false;
    var data_di_nascita_validata = false;
    var telefono_validato = false;
    var email_validata = false;
    var nickname_validato = false;
    var password_validata = false;
    var conferma_password_validata = false;

    $("#form_registrati").submit(function(e){maincontrol.premutoRegistrati(e)});
    $("#accessoButton").on('click', function(e){maincontrol.registrazioneCompletata(e)});

    maincontrol.premutoRegistrati = function (e) {
        e.preventDefault();

        var inputs = $('input[type=text],#password,#nascita,#email');
        var utente = {};

        for (let i = 0; i < inputs.length; i++) {
            utente[inputs[i].id] = inputs[i].value;
        }

        if(nome_validato && cognome_validato && codicefiscale_validato && data_di_nascita_validata &&
            numero_carta && email_validata && nickname_validato && password_validata && conferma_password_validata) {
            $.ajax({
                type: "POST",
                url: "/registrati/inviaRegistrazione",
                data: utente,

                success: function (msg) {
                    if (msg === "ADDUSER") {
                        mainview.showModal();
                        console.log("CIAO");
                        //maincontrol.registrazioneCompletata(utente.nickname, utente.password);
                    }
                },
                error: function (msg) {
                    console.log("ERRORE" + msg);
                }
            })
        }else{
            mainview.FaultRegistrati();
        }
    };

    maincontrol.redirectHome = function() {
        location.href = '/home';
    };

    maincontrol.registrazioneCompletata = function(e){
        var user = $("#nickname").val();
        var password = $("#password").val();
        e.preventDefault();
        //effettua il login
        $.ajax({
            type: "POST",
            url: "/login",
            data: {user: user, password: password},

            success: function(msg) {
                console.log("Accesso eseguito" + msg);
                maincontrol.redirectHome();
            }
        })
    };

    maincontrol.controllaMailDuplicata = function(email){
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

    maincontrol.controllaNicknameDuplicato = function(nickname){
        $.ajax({
            type: "POST",
            url: "/registrati/verificaNick",
            data: {nick: nickname},

            success: function (msg) {
                console.log(msg);
                if(msg === "EXIST"){
                    nickname_validato=false;
                    mainview.nicknameDuplicato();
                    $("#nickname").css("borderColor", "red");

                    $("#nickname").on("click", function () {
                        $("#nickname").css("borderColor", "");
                    });
                }else if (msg === "NOTEXIST"){
                    mainview.emailDuplicata();
                    nickname_validato=true;
                    mainview.ripulisciCampiErrati();
                }
            }
        })
    };


    mainview.showModal = function(){
        $("#modalSuccess").modal('show');
    };

    mainview.emailDuplicata = function(){
        $("#alert_text").text("Email giù utilizzata");
        $("#alert").show("slow");
    };

    mainview.nicknameDuplicato = function(){
        $("#alert_text").text("Nickname non disponibile");
        $("#alert").show("slow");
    };

    mainview.campiErrati = function () {
        $("#alert_text").text("Per favore, ricontrollare i dati");
        $("#alert").show("slow");

    };

    mainview.FaultRegistrati = function () {
        $("#alert_text").text("Qualcosa non va con i dati inseriti. Per favore, ricontrollare il form.");
        $("#alert").show("slow");
        $("html,body").animate({scrollTop : 0}, "slow");
        return false;

    };

    mainview.ripulisciCampiErrati = function(){
        $("#alert").hide();
    };

    mainview.mostraInfoPassword =  function(){
        $("#textCheck").text("La password deve contenere più di 8 caratteri di cui almeno una lettera Maiuscola, una minuscola ed un numero.");
        $("#alertCheck").show();
    };

    mainview.nascondiInfoPassword = function(){
        $("#alertCheck").hide();

    };

    $(document).ready(function () {
        /*Controllo Nome */
        $("#nome").blur(function(){
            if($("#nome").val() != ""){
                if(/^[A-Za-z]+$/.test($("#nome").val())){
                    nome_validato = true;
                    mainview.ripulisciCampiErrati();
                    return;
                }
                else {
                    email_validata = false;
                    mainview.campiErrati();
                    $("#nome").css("borderColor", "red");
                }
                    $("#nome").on("click", function () {
                        $("#nome").css("borderColor", "");
                    });
            }
            email_validata = false;
        });

        /*Controllo cognome*/
        $("#cognome").blur(function(){
            if($("#cognome").val() != ""){
                if(/^[A-Za-z]+$/.test($("#cognome").val())){
                    cognome_validato = true;
                    mainview.ripulisciCampiErrati();
                    return;
                }
                else {
                    cognome_validato = false;
                    mainview.campiErrati();
                    $("#cognome").css("borderColor", "red");
                }

            $("#cognome").on("click", function () {
                $("#cognome").css("borderColor", "");
            });
        }
            cognome_validato = false;
        });

        /* Controllo CF */
        $("#codicefiscale").blur(function(){
            if($("#codicefiscale").val() != ""){
                if(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i.test($("#codicefiscale").val())){
                    codicefiscale_validato = true;
                    mainview.ripulisciCampiErrati();
                    return;
                }
                else{
                    codicefiscale_validato = false;
                    mainview.campiErrati();
                    $("#codicefiscale").css("borderColor", "red");

                    $("#codicefiscale").on("click", function () {
                        $("#codicefiscale").css("borderColor", "");
                    });
                }
            }
            codicefiscale_validato = false;
        });

        /* Controllo Data di nascita */
        $("#nascita").change(function(){
            var nascita = $("#nascita").val();
            var d = new Date(); // Data corrente

            // Creo l'oggetto "data di nascita"
            nascita = new Date(nascita);
            /* Se il formato non è valido */
            if(nascita.toDateString() == "Invalid Date") {
                mainview.campiErrati();
                $("#nascita").css("borderColor", "red");

                $("#nascita").on("click", function () {
                    $("#nascita").css("borderColor", "");
                });
            }
            /* Se viene dal futuro */
            else if(nascita > d) {
                mainview.campiErrati();
                $("#nascita").css("borderColor", "red");

                $("#nascita").on("click", function () {
                    $("#nascita").css("borderColor", "");
                });
            }
            /* Controllo l'età */
            else{
                d.setYear(d.getFullYear() - 14);
                /* Se ha meno di 14 anni (dalla data di registrazione) */
                if (nascita > d){
                    mainview.campiErrati();
                    $("#nascita").css("borderColor", "red");

                    $("#nascita").on("click", function () {
                        $("#nascita").css("borderColor", "");
                    });
                }
                else {
                    data_di_nascita_validata = true;
                    mainview.ripulisciCampiErrati();
                    return;
                }
            }
            data_di_nascita_validata = false;
        });

        /*Controllo Email */
        $("#email").blur(function(){
            if($("#email").val() != ""){
                if(/^[A-Z0-9a-z._-]{3,}@[A-Z0-9a-z.-]{2,}\.[A-Za-z0-9]{2,4}$/.test($("#email").val())){
                    email_validata = true;
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaMailDuplicata($("#email").val());
                    return;
                }
                else{
                    email_validata = false;
                    mainview.campiErrati();
                    $("#email").css("borderColor", "red");

                    $("#email").on("click", function () {
                        $("#email").css("borderColor", "");
                    });
                }
            }
            email_validata = false;
        });

        /*Controllo numero di telefono */
        $("#telefono").blur(function(){
            if($("#telefono").val() != ""){
                if(/^[0-9]{10}$/.test($("#telefono").val())){
                    telefono_validato = true;
                    mainview.ripulisciCampiErrati();
                    return;
                }
                else{
                    telefono_validato = false;
                    mainview.campiErrati();
                    $("#telefono").css("borderColor", "red");

                    $("#telefono").on("click", function () {
                        $("#telefono").css("borderColor", "");
                    });
                }
            }
            telefono_validato = false;
        });
        /*Controllo nickname */

        $("#nickname").blur(function(){
            if($("#nickname").val() != ""){
                if(/^[a-zA-Z0-9]+$/.test($("#nickname").val())){
                    nickname_validato = true;
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaNicknameDuplicato($("#nickname").val());
                    return;
                }
                else{
                    nickname_validato = false;
                    mainview.campiErrati();
                    $("#nickname").css("borderColor", "red");

                    $("#nickname").on("click", function () {
                        $("#nickname").css("borderColor", "");
                    });
                }
            }
            nickname_validato = false;
        });



        /* Controllo dell'input per PASSWORD */
        $("#password").focus(function(){
            $("#password").css("background-color","white");
            mainview.mostraInfoPassword();
            if($("#password").val() == ""){
                $("#difficolta_password").hide();
            }
            $("#password_errata").hide();
        });

        $("#password").blur(function() {
            mainview.nascondiInfoPassword();
            if (($("#password").val() != "") &&
                ($("#password").val().length >= 8) &&
                (/[0-9]/.test($("#password").val())) &&
                (/[a-z]/.test($("#password").val())) &&
                (/[A-Z]/.test($("#password").val()))) {
                password_validata = true;
            } else {
                password_validata = false;
                $("#password_errata").show();
            }
        });

        // Gestisco la visualizzazione della difficoltà della password
        $("#password").keyup(function(){
            if (($("#password").val() != "") &&
                ($("#password").val().length >= 8) &&
                (/[0-9]/.test($("#password").val())) &&
                (/[a-z]/.test($("#password").val())) &&
                (/[A-Z]/.test($("#password").val())))
            {
                if(($("#password").val().length >= 8) && ($("#password").val().length < 12)){
                    $("#password").css("background-color","rgba(255,71,0,0.5)"); // darkorange
                }
                else if(($("#password").val().length >= 12) && ($("#password").val().length < 16)){
                    $("#password").css("background-color","rgba(255,245,0,0.5)"); // gold
                }
                else if(($("#password").val().length >= 16)){
                    $("#password").css("background-color","rgba(21,205,2,0.5)"); // limegreen
                }
            }
            else{
                $("#password").css("background-color","white"); // limegreen
            }
        });

        /* Controllo dell'input per CONFERMA PASSWORD */
        $("#conferma_password").focus(function(){
            $("#conferma_errata").hide();
        });

        $("#conferma_password").blur(function(){
            if($("#password").val().length != 0) {
                if ($("#conferma_password").val() == $("#password").val()) {
                    conferma_password_validata = true;
                }
                else {
                    conferma_password_validata = false;
                    $("#conferma_errata").show();
                }
            }
            else
                conferma_password_validata = false;
        });
        // Azzero il campo "conferma password" se modifico la password
        $("#password").change(function(){
            conferma_password_validata = false;
            $("#conferma_password").val("");
            $("#conferma_errata").hide();
        });

    });

})();