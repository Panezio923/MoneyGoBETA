(function () {

    var mainview = {};
    var maincontrol = {
        metodi: null,
        banche: null,
        carte: null,
        selected: null,
    };

    var numero_validato = false;
    var iban_validato = false;
    var cvv_validato = false;
    var radioValue;

    $("#buttonONE").on('click', function(){mainview.mostraFormNuovoMetodo()});
    $("#buttonTWO").on('click', function(e){mainview.premutoRimuovi(e)});
    $("#buttonTHREE").on('click', function(e){maincontrol.impostaPredefinito(e)});
    $("#primaryButton").on('click', function() {mainview.ricaricaPagina()});
    $("#confermaButton").on('click', function() {maincontrol.rimuoviMetodo()});
    $("#otherButton").on('click', function(){mainview.resetModal()});
    $("#aggiungiMetodo").on('click', function () {maincontrol.aggiungiMetodo()});

    mainview.mostraFormNuovoMetodo = function() {
        radioValue = "carta";
        $("#carta-credito").prop("checked", true);
        $("#modalForm").modal('show');
        mainview.gestisciForm();
        console.log(radioValue);
    };

    mainview.gestisciForm = function(){
        if(radioValue === "carta"){
            $("#iban").prop('disabled', true).val("");
            $("#cvv, #numero").prop('disabled', false);
        }
        else if(radioValue === "conto") {
            $("#cvv, #numero").prop('disabled', true);
            $("#iban").prop('disabled', false);
        }
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

    mainview.campiErrati = function () {
        $("#alert_text").text("Per favore, ricontrollare i dati");
        $("#alert").show("slow");
    };

    mainview.messaggioEsitoOperazione = function(title, msg, button){
        $("#modalCarte").modal('show');
        $(".modal-title").text(title);
        $("#modalText").text(msg).show();
        $("#primaryButton").html(button).show();
        $("#otherButton").hide();
        $("#confermaButton").hide();
    };

    mainview.resetModal = function(){
        $("#otherButton").html("").hide();
        $("#primaryButton").html("").hide();
        $("#confermaButton").html("").hide();
        $("#modalCarte").modal('toggle');
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
                    mainview.messaggioEsitoOperazione("Operazione effettuata","Metodo di pagamento rimosso con successo.", "Aggiorna");
                } else if (msg === "ERROR") {
                    $("#loading").hide();
                    mainview.messaggioEsitoOperazione("Operazione non riuscita","Ci dispiace ma qualcosa è andato storto.", "Chiudi");
                }
            },

            error: function () {
                console.log("errore nella richiesta");
            }

        })
    };

    maincontrol.aggiungiMetodo = function(){
      if(radioValue === "carta") maincontrol.aggiungiCarta();
      else if(radioValue === "conto") maincontrol.aggiungiBanca();
    };


    /*
    * La funzione aggiungiCarta verifica che non esista già un metodo
    * associato al numero di carta e successivamente invia la richiesta per
    * l'aggiunzione del nuovo metodo, mostrando i relativi messaggi di
    * conferma o errore.
    * */
    maincontrol.aggiungiCarta = function(){
        var numero = $("#numero").val();
        var cvv = $("#cvv").val();

        if(numero_validato) {
            for (let i = 0; i < maincontrol.metodi.length; i++) {
                if (!(maincontrol.metodi[i].numero_carta === numero)) {
                    numero_validato = true;
                } else {
                    numero_validato = false;
                    break;
                }
            }
        }
        if(numero_validato && cvv_validato) {
            console.log("Invio richiesta ajax aggiunzione Carta");
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
                        mainview.messaggioEsitoOperazione("Operazione riuscita","Metodo di pagamento inserito con successo.", "Aggiorna");
                    } else if (msg === "FAULT") {
                        $("#loading").hide();
                        mainview.messaggioEsitoOperazione("Operazione fallita","Numero carta non riscontrato o CVV errato.", "Chiudi");
                    }
                }
            })
        }else{
            $("#modalForm").modal('hide');
            mainview.messaggioEsitoOperazione("Operazione fallita","Errore nei dati inseriti o metodo già esistente.", "Chiudi");
        }
    };

    maincontrol.aggiungiBanca = function() {
        console.log("CIEO");
        var iban = $("#iban").val();
        console.log(iban_validato);
        if(iban_validato) {
            console.log("15");
            for (let i = 0; i < maincontrol.metodi.length; i++) {
                if (!(maincontrol.metodi[i].numero_iban === iban)) {
                    iban_validato = true;
                } else {
                    iban_validato = false;
                    break;
                }
            }
        }
        if (iban_validato) {
            console.log("Invio richiesta ajax aggiunta contoBancario");
            $.ajax({
                type: "POST",
                data: {iban: iban},
                url: "/home/adminCards/aggiungiMetodoConto",

                beforeSend: function () {
                    $("#modalForm").modal('hide');
                    $("#modalCarte").modal('show');
                    $("#loading").show();
                    $("#modalText").hide();
                    $("#primaryButton").hide();
                },
                success: function (msg) {
                    if (msg === "DONE") {
                        $("#loading").hide();
                        mainview.messaggioEsitoOperazione("Operazione riuscita", "Metodo di pagamento inserito con successo.", "Aggiorna");
                    } else if (msg === "FAULT") {
                        $("#loading").hide();
                        mainview.messaggioEsitoOperazione("Operazione fallita", "L'IBAN inserito non è valido.", "Chiudi");
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        } else {
            $("#modalForm").modal('hide');
            mainview.messaggioEsitoOperazione("Operazione fallita", "Errore nei dati inseriti o metodo già esistente.", "Chiudi");
        }
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

    $(document).ready(function () {
        $('#listaMetodi a').on('click', function (e) {
            e.preventDefault();
            $(this).tab('show')

        });

        $("input[name='tipo']").on('click', function () {
            radioValue = $(this).val();
            mainview.gestisciForm();
        });

        /*Ogni volta che il modal si chiude ricarico la pagina*/
        $('#modalForm').on('hidden.bs.modal', function () {
            $("#aggiungi-metodo")[0].reset();

            $("#alert").hide();
        });
        /*Due control, la prima "getMetodi" recupera e conserva tutte le informarzioni relative ai
            metodi di pagamento. La seconda "getID" salva nella variabile maincontrol.selected l'ID
            del metodo che è stato selezionato dalla listgroup.
         */
        maincontrol.getMetodi();
        maincontrol.getID();

            $("#cvv").blur(function () {
                if ($("#cvv").val() != "") {
                    if (/^[0-9]{3}$/.test($("#cvv").val())) {
                        cvv_validato = true;
                        $("#alert").hide("fast");
                        return;
                    } else {
                        cvv_validato = false;
                        mainview.campiErrati();

                        $("#cvv").css("borderColor", "red");

                        $("#cvv").on("click", function () {
                            $("#cvv").css("borderColor", "");
                        });
                    }
                }
                cvv_validato = false;
            });
            $("#numero").blur(function () {
                if ($("#numero").val() != "") {
                    if (/^[0-9]{8}$/.test($("#numero").val())) {
                        numero_validato = true;
                        $("#alert").hide("fast");
                        return;
                    } else {
                        numero_validato = false;
                        mainview.campiErrati();
                        $("#numero").css("borderColor", "red");

                        $("#numero").on("click", function () {
                            $("#numero").css("borderColor", "");

                        });
                    }
                }
                numero_validato = false;
            });

                $("#iban").blur(function () {
                    console.log("487");
                    if ($("#iban").val() != "") {
                        if (/^([A-Z]{2})\s*\t*[0-9]{24}$/.test($("#iban").val())) {
                            iban_validato = true;
                            $("#alert").hide("fast");
                            return;
                        } else {
                            iban_validato = false;
                            mainview.campiErrati();
                            $("#iban").css("borderColor", "red");

                            $("#iban").on("click", function () {
                                $("#iban").css("borderColor", "");

                            });
                        }
                    }
                    iban_validato = false;
                });
    })

})();