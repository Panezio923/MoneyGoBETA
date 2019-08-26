(function () {

    var mainview = {};
    var maincontrol = {
        user_nickname: null,
        metodo: null,
    };

    var destinatario_validato = false;
    var cifra_validata = false;
    var reqmittente_validato = false; //Chi riceve la richiesta di denaro è il mittente della transazione


    const formatter = new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2
    });

    //commento
    $("#gestCarte").on("click", function(){maincontrol.premutogestisciCarte()});
    $("#gestProfilo").on("click", function(){maincontrol.premutogestisciProfilo()});
    $("#inviaDenaro").on("click", function () {$("#modalInviaDenaro").modal('show')});
    $("#richiediDenaro").on("click", function(){$("#modalRichiediDenaro").modal('show')});
    $("#form_inviadenaro").on("submit", function (e) {maincontrol.inviaDenaro(e)});
    $("#form_richiediDenaro").on("submit", function (e) {maincontrol.richiediDenaro(e)});
    $("#aggiorna").on("click", function () {location.reload()});
    $("#ricConto").on("click", function (){maincontrol.premutoRicaricaConto()});


    maincontrol.premutogestisciProfilo = function(){
        mainview.mostraBarraLoading();
        location.href = '/home/gestioneProfilo';
        mainview.nascondiBarraLoading();
        return false;
    };

    maincontrol.premutogestisciCarte = function(){
        mainview.mostraBarraLoading();
        location.href = '/home/adminCards';
        mainview.nascondiBarraLoading();
        return false;
    };

    maincontrol.verificaNick = function(){
      $.ajax({
          type: "GET",
          url: "/home/user_nickname",

          success: function (data) {
              maincontrol.user_nickname = data;
          },
          error: function () {
              mainview.mostraAlert("Qualcosa è andato storto.");
          }

      })
    };

    maincontrol.controllaEsistenzaNick = function(nickname, id, variabile_di_controllo){
        if(nickname.toLowerCase() === maincontrol.user_nickname.toLowerCase()){
            variabile_di_controllo=false;
            mainview.mostraAlert("Impossibile scambiare denaro con sé stessi.");
            $("#" + id).css("background-color", "#ff6962");

            $("#" + id).on("click", function () {
                $("#" + id).css("background-color", "");
            });
        }else {
            $.ajax({
                type: "POST",
                url: "/registrati/verificaNick",
                data: {nick: nickname},

                success: function (msg) {
                    if (msg === "NOTEXIST") {
                        variabile_di_controllo = false;
                        mainview.mostraAlert("Nickname inesistente nel sistema.");
                        $("#" + id).css("background-color", "#ff6962");

                        $("#" + id).on("click", function () {
                            $("#" + id).css("background-color", "");
                            mainview.ripulisciCampiErrati();

                        });
                    } else if (msg === "EXIST") {
                        $("#" + id).css("background-color", "#66ff99");
                        variabile_di_controllo = true;
                        mainview.ripulisciCampiErrati();
                    }
                }
            })
        }
    };

    maincontrol.getFontePagamento = function(){
      if($("#checkPredefinito").is(':checked'))
          maincontrol.metodo = "PREDEFINITO";
      else if($("#contoMG").is(':checked'))
          maincontrol.metodo = "MONEYGO";
      else
          maincontrol.metodo = $("#metodoPagamento option:selected").text();
    };

    maincontrol.inviaDenaro = function(e){
        e.preventDefault();
        console.log(destinatario_validato + " " + cifra_validata);
        if(destinatario_validato && cifra_validata) {
            maincontrol.getFontePagamento();

            var destinatario = $("#destinatario").val();
            /*
             * Formatter formatta la cifra con la virgola. Sostituisco la virgola con un punto
             * poichè su mysql i float sono identificati dal punto e non dalla virgola.
             */
            var importo = $(".importo").val().replace(/,/g, '.');
            var metodo = maincontrol.metodo;
            var causale = $(".causale").val();
            console.log(importo + " " + causale);

            $.ajax({
                type: "POST",
                url: "/home/inviaDenaro",
                data: {destinatario: destinatario, importo: importo, metodo: metodo, causale: causale},

                beforeSend: function(){
                    $("#formModal").hide();
                    $("#loadingInvioDenaro").show();
                },

                success: function (msg) {
                    console.log(msg);
                    if(msg === "DONE"){
                        $("#loadingInvioDenaro").hide();
                        $("#alertCheck").show();
                        $("#aggiorna").show();
                        $("#confermaInvioDenaro").hide();
                    }
                    else if(msg === "TRANERR"){
                        $("#loadingInvioDenaro").hide();
                        mainview.mostraAlert("Errore nella transazione. Per favore riprovare");
                        $("#aggiorna").show();
                        $("#confermaInvioDenaro").hide();
                    }
                    else if(msg === "FAULT"){
                        $("#loadingInvioDenaro").hide();
                        mainview.mostraAlert("Qualcosa è andato storto. Ci dispiace. Riprova.");
                        $("#aggiorna").show();
                        $("#confermaInvioDenaro").hide();
                    }
                    else if(msg === "TOO"){
                        $("#loadingInvioDenaro").hide();
                        mainview.mostraAlert("L'importo selezionato non è coperto dal metodo scelto.");
                        $("#aggiorna").show();
                        $("#confermaInvioDenaro").hide();
                    }

                },
                error: function () {
                    console.log("Error");
                }
            })
        }
    };

    maincontrol.premutoRicaricaConto = function(){
        mainview.mostraBarraLoading();
        location.href = '/home/ricaricaConto';
        mainview.nascondiBarraLoading();
        return false;
    };

    mainview.mostraBarraLoading = function(){
      $("#loading").show();
    };

    mainview.nascondiBarraLoading = function(){
      $("#loading").hide();
    };

    mainview.mostraAlert = function(msg){
        $(".testo_alert").text(msg);
        $(".alert").show("slow");
    };

    mainview.ripulisciCampiErrati = function(){
        $(".alert").hide();
    };


    $(document).ready(function () {

        //Quando carica la pagina recupero il nick dell'utente
        maincontrol.verificaNick();

        var checkboxes = $("#checkPredefinito, #contoMG");
        checkboxes.prop("checked", false);
        checkboxes.on('click',function () {
            checkboxes.prop("disabled", false);
            $("#items").prop("disabled", false);

            if($("#checkPredefinito").is(":checked")){
                $("#items").prop("disabled", true);
                $("#contoMG").prop("disabled", true);
            }
            else if($("#contoMG").is(":checked")){
                $("#items").prop("disabled", true);
                $("#checkPredefinito").prop("disabled", true);
            }
        });

        $("#destinatario").blur(function (e) {
            if ($("#destinatario").val() != "") {
                if (/^[a-zA-Z0-9]+$/.test($("#destinatario").val())) {
                    destinatario_validato = true;
                    $("#alert").hide();
                    maincontrol.controllaEsistenzaNick($("#destinatario").val(), "destinatario", destinatario_validato, e);
                    return;
                } else {
                    destinatario_validato = false;
                    mainview.campiErrati();
                    $("#destinatario").css("background-color", "#ff6152");

                    $("#destinatario").on("click", function () {
                        $("#destinatario").css("background-color", "");
                    });
                }
            }
            destinatario_validato = false;
        });


        $("#importoDUE, #importoUNO").change(function () {
            var cifraUNO = $("#importoUNO").val();
            var cifraDUE = $("#importoDUE").val();
            if(cifraUNO != "" || cifraDUE != "") {
                $("#importoUNO").val(formatter.format(cifraUNO));
                $("#importoDUE").val(formatter.format(cifraDUE));
                console.log(cifraUNO + " " + cifraDUE);
                cifra_validata = true;
                return;
            }else{
                cifra_validata = false;
            }
        });

        $(".importo").on('click',function () {
            $(".importo").val("");
        });

        $("#reqmittente").blur( function () {
            if ($("#reqmittente").val() != "") {
                if (/^[a-zA-Z0-9]+$/.test($("#reqmittente").val())) {
                    reqmittente_validato = true;
                    maincontrol.controllaEsistenzaNick($("#reqmittente").val(), "reqmittente", reqmittente_validato);
                    return;
                } else {
                    reqmittente_validato = false;
                    mainview.campiErrati();
                    $("#reqmittente").css("background-color", "#ff6152");

                    $("#reqmittente").on("click", function () {
                        $("#reqmittente").css("background-color", "");
                    });
                }
            }
            reqmittente_validato = false;
        });

        $("#modalInviaDenaro, #modalRichiediDenaro").on('hidden.bs.modal', function () {
            mainview.ripulisciCampiErrati();
            cifra_validata = false;
            destinatario_validato = false;
            reqmittente_validato = false;
        })


    });
})();