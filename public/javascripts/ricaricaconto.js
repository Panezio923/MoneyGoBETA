(function () {
    var mainview = {};
    var maincontrol = {};
    var cifra_validata = false;

    const formatter = new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2
    });
    $("#RicaricaConto").on("click", function (){maincontrol.premutoRicarica()});

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

    maincontrol.premutoRicarica = function(){
        if(cifra_validata) {
            var destinatario = maincontrol.user_nickname;
            var importo = $("#importoRic").val().replace(/\./g, '');
            importo = importo.replace(/,/g, '.');
            var metodo = $("#listaCarte option:selected").val()
            console.log(importo);
            $.ajax({
                type: "POST",
                url: "/home/inviaDenaro",
                data: {destinatario: destinatario, importo: importo, metodo: metodo, causale: "ricarica conto", bypass: "on"},

                success: function (msg) {
                    if(msg === "DONE"){
                        maincontrol.aggiornaDati();
                        $("#alert_text_success").text("Ricarica eseguita con successo");
                        $( "#successAlert" ).show();
                        $("#successAlert").delay(3000).slideUp(200, function() {
                            $(this).alert('close');
                            location.reload();
                        });
                    }
                    else if(msg === "TRANERR"){
                        $("#alert").show();
                        $("#alert_text").text("Ricarica fallita, riprova")
                    }
                    else if(msg === "FAULT"){
                        $("#alert").show();
                        $("#alert_text").text("Ricarica fallita, riprova")
                    }
                    else if(msg === "TOO"){
                        $("#alert").show();
                        $("#alert_text").text("L'importo selezionato non è coperto dal metodo scelto")
                    }
                },
                error: function () {
                    console.log("fallito");
                }
            });
        }
    };

    maincontrol.aggiornaDati = function(){
      $.ajax({
          type: "GET",
          url: "/home/aggiornaDati",


          success: function () {
              console.log("Fatto");
          },
          error: function () {
              console.log("errore");
          }
      })
    };

    $(document).ready(function () {
        maincontrol.verificaNick();

        $("#importoRic").change(function () {
            let cifra;
            cifra = $("#importoRic").val();
            if(cifra !== "" && !isNaN(cifra)) {
                $("#importoRic").val(formatter.format(cifra));
                cifra_validata = true;
                return;
            }else{
                cifra_validata = false;
            }
        });
    });

})();