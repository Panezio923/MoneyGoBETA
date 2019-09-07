(function () {

    var mainview = {};
    var maincontrol = {user_nickname: null};


    var destinatario_validato;
    var data_startvalidata;

    const formatter = new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2
    });

    $("#conferma").on('click', function(e){maincontrol.caricaNuovoPagamento(e)});

    mainview.mostraAlert = function(msg){
        $(".testo_alert").text(msg);
        $(".alert").show("slow");
    };

    maincontrol.controllaEsistenzaNick = function(nickname, id, variabile_di_controllo){
        if(nickname.toLowerCase() === maincontrol.user_nickname.toLowerCase()){
            variabile_di_controllo = false;
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

                        });
                    } else if (msg === "EXIST") {
                        $("#" + id).css("background-color", "#66ff99");
                        variabile_di_controllo = true;
                        console.log(variabile_di_controllo);
                    }
                }
            })
        }
    };

    maincontrol.aggiornaPagamentiPeriodici = function(){
        $.ajax({
            url: '/home/pagamentoPeriodico/aggiornaPagamentiPeriodici',
            type: 'POST',
            //nodata
            //nothingelse;
        })
    };
    var metodo = $("#listaMetodi option:selected").val();
    maincontrol.caricaNuovoPagamento = function(e){
        e.preventDefault();
        if(cifra_validata && metodo !== undefined && destinatario_validato && data_startvalidata){
            var periodicita = $("#periodicita option:selected").val();
            var importo = $("#importoPeriodico").val().replace(/\./g, '');
            importo = importo.replace(/,/g, '.');
            var destinatario = $("#dest").val();
            var datastart = $("#startPagamento").val();

            $.ajax({
                url: '/home/pagamentoPeriodico/nuovoPagamentoPeriodico',
                type: 'POST',
                data: {datainizio: datastart, metodo: metodo, destinatario: destinatario, periodicita: periodicita, importo: importo},

                beforeSend: function () {
                    $("#form_pagamentoperiodico").hide();
                    $(".loading").show();
                },
                success: function (msg) {
                    if(msg === "DONE"){
                        $("#form_pagamentoperiodico").find("input[type=text], input[type=date]").css("background-color", "").val("");
                        $(".loading").hide();
                        $("#alertCheck").show().delay(2000).fadeOut();
                        $("#form_pagamentoperiodico").delay(2000).show(0);
                        maincontrol.aggiornaPagamentiPeriodici();
                        $("#tablePagamentiPeriodici").load(location.href + " #tablePagamentiPeriodici");
                    }
                    else if(msg === "ERR"){
                        mainview.mostraAlert("Qualcosa non va, riprovare");
                    }
                }

            })
        }else mainview.mostraAlert("Qualcosa è andato storto, per favore riprova");
    };

    maincontrol.verificaNick = function() {
        $.ajax( {
            type: "GET",
            url: "/home/user_nickname",

            success: function (data) {
                maincontrol.user_nickname = data;
            },
            error: function () {
                mainview.mostraAlert( "Qualcosa è andato storto." );
            }

        } );
    };

    $(document).ready(function () {

        maincontrol.verificaNick();
        $("#form_pagamentoperiodico").find("input[type=text], input[type=date]").val("");

        $("#dest").blur(function () {
            if ($("#dest").val() != "") {
                if (/^[a-zA-Z0-9]+$/.test($("#dest").val())) {
                    destinatario_validato = true;
                    $("#alert").hide();
                    maincontrol.controllaEsistenzaNick($("#dest").val(), "dest", destinatario_validato);
                    console.log(destinatario_validato);
                    return;
                } else {
                    $("#dest").css("background-color", "#ff6152");
                    $("#dest").on("click", function () {
                        $("#dest").css("background-color", "");
                    });
                }
            }
            destinatario_validato = false;
        });

        $("#importoPeriodico").change(function () {
            let cifra;
            cifra = $("#importoPeriodico").val();
            if(cifra !== "" && !isNaN(cifra)) {
                $("#importoPeriodico").val(formatter.format(cifra));
                cifra_validata = true;
                return;
            }else{
                cifra_validata = false;
            }
        });

        $(".importo").on('click',function () {
            $(".importo").val("");
        });

        /* Controllo Data */
        $("#startPagamento").blur(function(){
            data_startvalidata = true;
            var start = $("#startPagamento").val();
            var d = new Date(); // Data corrente

            // Creo l'oggetto "data di nascita"
            start = new Date(start);
            /* Se il formato non è valido */
            if(start.toDateString() == "Invalid Date") {
                mainview.mostraAlert("Data inizio non valida");
            }
            /* Se viene è nel passato */
            else if(start <= d) {
                mainview.mostraAlert("Data già passata");
            }
            else{
                data_startvalidata = true;
                return;
            }
            data_startvalidata = false;
        });

    })

})();