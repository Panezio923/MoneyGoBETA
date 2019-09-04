(function () {

    var mainview = {};
    var maincontrol = {
        user_nickname: null,
        metodo: null,
        importo: null,
        causale: null,
        destinatario: null,
        bypass: "off",
        notifiche: null,
    };

    var destinatario_validato = false;
    var cifra_validata = false;
    var reqmittente_validato = false; //Chi riceve la richiesta di denaro è il mittente della transazione
    let storeValue = null;

    const formatter = new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2
    });

    $("#gestCarte").on("click", function(){maincontrol.premutogestisciCarte()});
    $("#gestProfilo").on("click", function(){maincontrol.premutogestisciProfilo()});
    $("#creaLink").on("click", function(){maincontrol.premutocreaLink()});
    $("#inviaDenaro").on("click", function () {$("#modalInviaDenaro").modal('show')});
    $("#richiediDenaro").on("click", function(){$("#modalRichiediDenaro").modal('show')});
    $("#form_inviadenaro").on("submit", function (e) {maincontrol.inviaDenaro(e)});
    $("#form_richiediDenaro").on("submit", function (e) {maincontrol.richiediDenaro(e)});
    $("#byPassLimite").on("click", function(e){maincontrol.byPassLimite(e)});
    $(".aggiorna").on("click", function () {location.reload()});
    $("#ricConto").on("click", function(){maincontrol.premutoRicaricaConto()});
    $("#aggiornaSaldo").on("click", function () {maincontrol.aggiornaDati()});
    $("#pagPeriodico").on("click", function () {maincontrol.premutoPagamentoPeriodico()});

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

    maincontrol.premutoRicaricaConto = function(){
      mainview.mostraBarraLoading();
      location.href = '/home/ricaricaConto';
      mainview.nascondiBarraLoading();
      return false;
    };

    maincontrol.premutocreaLink = function(){
        mainview.mostraBarraLoading();
        location.href = '/home/creaLink';
        mainview.nascondiBarraLoading();
        return false;
    };

    maincontrol.premutoPagamentoPeriodico = function(){
        mainview.mostraBarraLoading();
        location.href = '/home/pagamentoPeriodico';
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

    maincontrol.richiediDenaro = function(e){
      e.preventDefault();

      if(reqmittente_validato && cifra_validata){
          var reqmittente = $("#reqmittente").val();
          var importo = $(".importo").val().replace(/\./g, '');
          importo = importo.replace(/,/g, '.');
          var causale = $("#causaleRichiesta").val();

          $.ajax({
              type:"POST",
              url: "/home/richiediDenaro",
              data: {reqmittente: reqmittente, importo: importo, causale: causale},

              beforeSend: function () {
                  $("#formModalDUE").hide();
                  $("#loadingRichiediDenaro").show();
              },
              success: function (msg) {
                  if(msg === "DONE"){
                      $("#loadingRichiediDenaro").hide();
                      $(".alert-check").show();
                      $(".aggiorna").show();
                      $("#confermaRichiestaDenaro").hide();
                      mainview.ripulisciCampiErrati();
                  }
                  else if(msg === "FAULT"){
                      $("#loadingRichiediDenaro").hide();
                      mainview.mostraAlert("Qualcosa è andato storto. Ci dispiace. Riprova.");
                      $(".aggiorna").show();
                      $("#confermaRichiestaDenaro").hide();
                  }
              }

          })
      }
      else mainview.mostraAlert("Qualcosa non va con i campi inseriti.");

    };

    maincontrol.byPassLimite = function(e){
        maincontrol.bypass = "on";
        maincontrol.inviaDenaro(e);
    };

    maincontrol.inviaDenaro = function(e){
        e.preventDefault();
        console.log(destinatario_validato)
        if(destinatario_validato && cifra_validata) {
            maincontrol.getFontePagamento();

            var destinatario = $("#destinatario").val();
            /*
             * Formatter formatta la cifra con la virgola. Sostituisco la virgola con un punto
             * poichè su mysql i float sono identificati dal punto e non dalla virgola.
             */
            var importo = $(".importo").val().replace(/\./g, '');
                importo = importo.replace(/,/g, '.');
            var metodo = maincontrol.metodo;
            var causale = $("#causaleInvia").val();

            //Salvo i valori all'interno della maincontrol
            maincontrol.destinatario = destinatario;
            maincontrol.importo = importo;
            maincontrol.causale = causale;

            $.ajax({
                type: "POST",
                url: "/home/inviaDenaro",
                data: {destinatario: destinatario, importo: importo, metodo: metodo, causale: causale, bypass: maincontrol.bypass},

                beforeSend: function(){
                    $("#formModal").hide();
                    $("#loadingInvioDenaro").show();
                },

                success: function (msg) {
                    console.log(msg);
                    if(msg === "DONE"){
                        $(".alert").hide();
                        $(".loading").hide();
                        $(".alert-check").show();
                        $(".aggiorna").html("Aggiorna").show();
                        $("#confermaInvioDenaro").hide();
                        $("#byPassLimite").hide();
                    }
                    else if(msg === "TRANERR"){
                        $(".loading").hide();
                        mainview.mostraAlert("Errore nella transazione. Per favore riprovare");
                        $(".aggiorna").show();
                        $("#confermaInvioDenaro").hide();
                    }
                    else if(msg === "FAULT"){
                        $(".loading").hide();
                        mainview.mostraAlert("Qualcosa è andato storto. Ci dispiace. Riprova.");
                        $(".aggiorna").show();
                        $("#confermaInvioDenaro").hide();
                    }
                    else if(msg === "TOO"){
                        $(".loading").hide();
                        $(".alert").removeClass("alert-warning").addClass("alert-danger");
                        mainview.mostraAlert("L'importo selezionato non è coperto dal metodo scelto.");
                        $(".aggiorna").html("Chiudi").show();
                        $("#confermaInvioDenaro").hide();
                        $("#byPassLimite").hide();
                    }
                    else if(msg === "OVERLIMIT"){
                        $(".loading").hide();
                        $(".alert").removeClass("alert-danger").addClass("alert-warning");
                        mainview.mostraAlert("La transazione supera il limite spesa impostato nel sistema. Continuare?");
                        $(".aggiorna").html("Annulla").show();
                        $("#byPassLimite").show();
                        $("#confermaInvioDenaro").hide();
                    }

                },
                error: function () {
                    console.log("Error");
                }
            })
        }
    };

    maincontrol.ricavaNotifiche = function(){
        $.ajax({
            type: "get",
            url: "/home/ricavaNotifiche",

            success: function (data) {
                maincontrol.notifiche = data;
            },
            error: function () {
                console.log("errore recupero notifiche");
            }
        })
    };

    //Recupera l'id dell'elemento selezionato dalla listgroup
    maincontrol.getID = function(){
        $(".list-group-item button").on('click',function () {
            storeValue = ($(this).attr("id"));
            let id_transazione = maincontrol.notifiche[storeValue[1]].id_transazione;
            if(storeValue[0] === "A"){
                maincontrol.accettaTransazione(id_transazione);
            }
            else if(storeValue[1] === "R"){
                maincontrol.rifiutaTransazione(id_transazione);
            }
        });
    };

    maincontrol.accettaTransazione = function(id){


        $.ajax({
            type: "POST",
            url: "/home/accettaTransazione",
            data: {destinatario: maincontrol.notifiche[storeValue[1]].destinatario, importo: maincontrol.notifiche[storeValue[1]].importo, id: id },

            success : function (msg) {
                if(msg === "DONE"){
                    maincontrol.ricavaNotifiche();
                    $("#notifiche").load(location.href + ' #notifiche');
                    $("#saldo").load(location.href + ' #saldo');

                }
                else if(msg === "ERROR"){
                    console.log("errore nell'accettamento della transazione");
                }
            }
        })
    };

    maincontrol.rifiutaTransazione = function(id){

        $.ajax({
            type: "POST",
            url: "/home/rifiutaTransazione",
            data: {id: id },

            success : function (msg) {
                maincontrol.ricavaNotifiche();
                $("#notifiche").load(location.href + ' #notifiche');
            }
        })

    };

    maincontrol.rimuoviNotifica = function(id){
      return maincontrol.notifiche.filter(function (ele) {
          return ele = id;
      })
    };

    maincontrol.creaLinkPagamento = function(tipo){
        var importo = $(".importo").val().replace(/\./g, '');
        importo = importo.replace(/,/g, '.');
        console.log(maincontrol.metodo);
        $.ajax({
            type: "POST",
            url: "/home/creaToken",
            data: {importo: importo, metodo: maincontrol.metodo, causale: $(".causale").val(), type: tipo},

            beforeSend: function () {
                //mainview.mostraBarraLoading();
            },
            success: function (msg) {
                console.log(msg);
                if(!msg){
                    mainview.mostraAlert("Qualcosa è andato storto nella generazione del link");
                }else{
                    if(tipo === "SEND") {
                        $( '#linkInvio span' ).text( "http://localhost:443/token/" + msg );
                        $( '#linkInvio' ).attr( "value", ("http://localhost:443/token/" + msg) );
                    }
                    else if(tipo === "RCV"){
                        $( '#linkRcv span' ).text( "http://localhost:443/token/" + msg );
                        $( '#linkRcv' ).attr( "value", ("http://localhost:443/token/" + msg) );
                    }
                }
            }
        })
    };

    maincontrol.aggiornaDati = function(){
        $.ajax({
            type: "GET",
            url: "/home/aggiornaDati",

            success: function (saldo) {
                $("#saldo").val(saldo.saldo_conto);
                $("#saldo").load(location.href + ' #saldo');
            },
            error: function () {
                console.log("errore");
            }
        })
    };

    mainview.mostraLinkPagamento = function(){
        $(".linkpagamento").show();
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

    $( document ).ready(function () {

        //Quando carica la pagina recupero il nick dell'utente
        maincontrol.verificaNick();

        maincontrol.ricavaNotifiche();

        maincontrol.getID();

        $('[data-toggle="tooltip"]').tooltip();

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
                    $("#alert").hide();
                    maincontrol.controllaEsistenzaNick($("#destinatario").val(), "destinatario", destinatario_validato, e);
                    console.log(destinatario_validato);
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

        $("#importoUNO, #importoDUE").val("");
        $("#importoUNO, #importoDUE").change(function () {
          var cifra = 0;
          if($("#importoUNO").val() === "" ) cifra = $("#importoDUE").val();
          else cifra = $("#importoUNO").val();
            if(cifra !== "" && !isNaN(cifra)) {
                $("#importoUNO , #importoDUE").val(formatter.format(cifra));
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
        });

        $("#checkCreaLink").prop("checked", false);
        $("#checkCreaLink").on('click', function () {
            if($("#checkCreaLink").is(":checked")){
                if(cifra_validata) {
                    maincontrol.getFontePagamento();
                    console.log(maincontrol.metodo);
                    if(maincontrol.metodo !== null) {
                        maincontrol.creaLinkPagamento("SEND");
                        mainview.mostraLinkPagamento();
                    }else mainview.mostraAlert("Selezionare il metodo di pagamento");
                }else mainview.mostraAlert("Importo inserito non valido");
            }
            else{
                mainview.ripulisciCampiErrati();
                $(".linkpagamento").hide();
            }
        });

        $("#checkCreaLinkRcv").prop("checked", false);
        $("#checkCreaLinkRcv").on('click', function () {
            if($("#checkCreaLinkRcv").is(":checked")){
                if(cifra_validata){
                    maincontrol.metodo = "MONEYGO";
                    maincontrol.creaLinkPagamento("RCV");
                    mainview.mostraLinkPagamento();
                }else mainview.mostraAlert("Importo inserito non valido");
            }else{
                mainview.ripulisciCampiErrati();
                $(".linkpagamento").hide();
            }
        })

    });
})();