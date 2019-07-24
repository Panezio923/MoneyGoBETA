(function () {

    var mainview = {};
    var maincontrol = {
        metodi: null,
        banche: null,
        carte: null,
        selected: null,
    };

    var numero_carta = false;

    $("#buttonONE").on('click', function(){mainview.mostraFormNuovoMetodo()});
    $("#buttonTWO").on('click', function(e){mainview.premutoRimuovi(e)});
    $("#buttonTHREE").on('click', function(e){maincontrol.impostaPredefinito(e)});
    $("#primaryButton").on('click', function() {mainview.ricaricaPagina()});
    $("#confermaButton").on('click', function() {maincontrol.rimuoviMetodo()});
    $("#otherButton").on('click', function(){mainview.resetModal()});
    $("#aggiungiMetodo").on('click', function () {maincontrol.aggiungiMetodo()});


    //Da completare
    mainview.mostraFormNuovoMetodo = function(){
        $("#carta-credito").prop('checked', true);
        mainview.selezionatoCarta();
        $("#modalForm").modal('show');

    };

    mainview.selezionatoCarta = function(){
        mainview.attivaCampi();
        $("#numConto").prop('disabled', true);
    };

    mainview.selezionatoConto = function(){
        mainview.attivaCampi();
        $("#cvv").prop('disabled', true);
        $("#scadenza").prop('disabled', true);
    };

    mainview.attivaCampi = function(){
        $("#aggiungi-metodo input").prop('disabled', false);
    };

    //Scorre i metodi di pagamento ed evidenzia quello predefinito
    mainview.evidenziaPredefinito = function(metodi){
        for( let i = 0; i < metodi.length; i++){
            if(metodi[i].predefinito == 1)
                $('#T'+i+'').css("background-color", "gold");
        }
    };

    mainview.ricaricaPagina = function(){
        $("#cambioPredefinito").hide();
        location.reload();
    };

    //Recupera l'id dell'elemento selezionato dalla listgroup
    maincontrol.getID = function(){
        let storeValue = null;
        $(".list-group a").on('click',function () {
          storeValue = ($(this).attr("id"));
            console.log(maincontrol.metodi[storeValue[1]].id_metodo);
           maincontrol.selected =  maincontrol.metodi[storeValue[1]].id_metodo;
        });

    };

    mainview.resetModal = function(){
        $("#otherButton").html("").hide();
        $("#primaryButton").html("").hide();
        $("#confermaButton").html("").hide();
        $("#modalCarte").modal('toggle');
    };

    mainview.modalError = function(){
        $(".modal-title").text("Attenzione");
        $("#primaryButton").hide();
        $("#otherButton").html("Chiudi").show();
        $("#modalText").text("Si prega di selezionare un metodo di pagamento.").show();
        $("#modalCarte").modal('show');
    };

    mainview.premutoRimuovi = function(e){
        e.preventDefault();
        var id = maincontrol.selected;
        console.log(id);
        if(id === null){
            mainview.modalError();
        } else {
            $(".modal-title").text("Confermare l'operazione");
            $("#primaryButton").hide();
            $("#confermaButton").html("Conferma").show();
            $("#otherButton").html("Annulla").show();
            $("#modalText").text("Sicuro di voler eliminare il metodo di pagamento selezionato?").show();
            $("#modalCarte").modal('show');
        }
    };

    mainview.messaggioEsitoOperazione = function(title, msg){
        $("#modalCarte").modal('show');
        $(".modal-title").text(title);
        $("#modalText").text(msg).show();
        $("#primaryButton").html("Aggiorna").show();
        $("#otherButton").hide();
        $("#confermaButton").hide();
    };

    //Invia la richiesta al server per modificare il valore del pagamento predefinito
    maincontrol.impostaPredefinito = function(e){
        e.preventDefault();
        var id = maincontrol.selected;

        if(id === null){
            mainview.modalError();
        }else {
            $.ajax({
                type: "POST",
                url: "/home/adminCards/impostaPredefinito",
                data: {id: id},

                beforeSend: function () {
                    $("#modalCarte").modal('show');
                    $("#loading").show();
                    $("#modalText").hide();
                },

                success: function (msg) {
                    if (msg === "DONE") {
                        $("#loading").hide();
                        $(".modal-title").text("Operazione effettuata");
                        $("#modalText").text("Il nuovo pagamento predefinito è stato impostato correttamente").show();
                        $("#primaryButton").html("Aggiorna").show();

                    } else if (msg === "ERROR") {
                        $("#loading").hide();
                        $(".modal-title").text("Operazione fallita");
                        $("#modalText").text("Ci dispiace, qualcosa è andato storto.").show();
                        $("#primaryButton").html("Aggiorna").show();

                    }
                },

                error: function () {
                    console.log("errore nella richiesta");
                }
            })
        }
    };

    maincontrol.getMetodi = function(){
        console.log("Richiesta dati metodi");
        $.ajax({
            type: "GET",
            url: "/home/adminCards/ricavaMetodi",
            //no data

            success: function (data) {
                maincontrol.metodi = data;
                mainview.evidenziaPredefinito(maincontrol.metodi);
            }
        })

    };

    //Invia la richiesta al server per rimuovere il metodo di pagamento selezionato
    maincontrol.rimuoviMetodo = function(){
        var id = maincontrol.selected;

            $.ajax({
                type: "POST",
                url: "/home/adminCards/rimuoviMetodo",
                data: {id: id},

                beforeSend: function () {
                    $("#modalCarte").modal('show');
                    $("#loading").show();
                    $("#modalText").hide();
                },

                success: function (msg) {
                    if (msg === "DONE") {
                        $("#loading").hide();
                        mainview.messaggioEsitoOperazione("Metodo di pagamento rimosso con successo.");
                    } else if (msg === "ERROR") {
                        $("#loading").hide();
                        $("#modalText").text("Ci dispiace, qualcosa è andato storto").show();
                    }
                },

                error: function () {
                    console.log("errore nella richiesta");
                }

            })

    };

    /*Le due maincontrol getCarte e getBanche richiedono al server
     *i dati rispettivamente di carte e banche relative ai metodi del cliente
     */
    maincontrol.getCarte = function(){
        console.log("Richiesta dati carte");
        $.ajax({
            type: "GET",
            url: "/home/adminCards/ricavaCarte",
            //no data

            success: function (data) {
                maincontrol.carta = data;
            }
        })
    };

    maincontrol.getBanche = function(){
        console.log("Richiesta dati Banche");
        $.ajax({
            type: "GET",
            url: "/home/adminCards/ricavaBanche",
            //no data

            success: function (data) {
                maincontrol.carta = data;
            }
        })
    };

    maincontrol.aggiungiMetodo = function(){
        if($("#carta-credito").prop("checked"))
            maincontrol.aggiungiCarta();
        else
            maincontrol.aggiungiBanca();
    };

    /*
    * La funzione aggiungiCarta verifica che non esista già un metodo
    * associato al numero di carta e successivamente invia la richiesta per
    * l'aggiunzione del nuovo metodo, mostrando i relativi messaggi di
    * conferma o errore.
    * */
    maincontrol.aggiungiCarta = function(){
        console.log("Invio richiesta ajax aggiunzione Carta");
        var numero = $("#numeroOiban").val();
        var cvv = $("#cvv").val();
        var scadenza = $("#scandeza").val();

        for(let i = 0; i < maincontrol.metodi.length; i++){
          if(!(maincontrol.metodi[i].numero_carta === numero)){
              numero_carta = true;
          }else{
              numero_carta = false;
              break;
          }
        }
        if(numero_carta) {
            $.ajax({
                type: "POST",
                url: "/home/adminCards/aggiungiMetodoCarta",
                data: {numero: numero, cvv: cvv},

                beforeSend: function () {
                    $("#modalForm").modal('hide');
                    $("#modalCarte").modal('show');
                    $("#loading").show();
                    $("#modalText").hide();
                },
                success: function (msg) {
                    if (msg === "DONE") {
                        $("#loading").hide();
                        mainview.messaggioEsitoOperazione("Operazione riuscita","Metodo di pagamento inserito con successo.");
                    } else if (msg === "FAULT") {
                        $("#loading").hide();
                        mainview.messaggioEsitoOperazione("Operazione fallita","Numero carta non riscontrato o CVV errato.");
                    }
                }
            })
        }else{
            $("#modalForm").modal('hide');
            mainview.messaggioEsitoOperazione("Operazione fallita","Errore nei dati inseriti o metodo già esistente.");
        }

    };

    maincontrol.aggiungiBanca = function(){
        console.log("Invio richiesta ajax aggiunta contoBancario");
        var iban = $("#numeroOiban").val();

    };

    mainview.campiErrati = function () {
        $("#alert_text").text("Per favore, ricontrollare i dati");
        $("#alert").show("slow");

    };

    mainview.ripulisciCampiErrati = function(){
        $("#alert").hide("fast");
        $("#numeroOiban").css("borderColor", "");
    };


    $(document).ready(function () {
        $('#listaMetodi a').on('click', function (e) {
            e.preventDefault();
            mainview.riepilogoDati();
            $(this).tab('show')

        });

        $("input[name='tipo']").click(function () {
            var radioValue = $("input[name='tipo']:checked").val();
            if (radioValue === "carta") mainview.selezionatoCarta();
            else if (radioValue === "conto") mainview.selezionatoConto();

        });

        if ($("#carta-credito").prop('checked')) {
            $("#numeroOiban").blur(function () {
                if ($("#numeroOiban").val() != "") {
                    if (/^[0-9]{8}$/.test($("#numeroOiban").val())) {
                        numero_carta = true;
                        mainview.ripulisciCampiErrati();
                        return;
                    } else {
                        numero_carta = false;
                        mainview.campiErrati();
                        $("#numeroOiban").css("borderColor", "red");

                        $("#numeroOiban").on("click", function () {
                            $("#numeroOiban").css("borderColor", "");

                        });
                    }
                }
                numero_carta = true;
            });
        }else{
            console.log("Ciao");
        }

        /*Due control, la prima "getMetodi" recupera e conserva tutte le informarzioni relative ai
            metodi di pagamento. La seconda "getID" salva nella variabile maincontrol.selected l'ID
            del metodo che è stato selezionato dalla listgroup.
         */
        maincontrol.getMetodi();
        maincontrol.getID();

    })
})();