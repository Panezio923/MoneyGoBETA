(function () {

    var mainview = {};
    var maincontrol = {
        user_nickname: null,
        metodo: null,
    };

    var destinatario_validato = false;
    var cifra_validata = false;

    const formatter = new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2
    });

    $("#gestCarte").on("click", function(){maincontrol.premutogestisciCarte()});
    $("#gestProfilo").on("click", function(){maincontrol.premutogestisciProfilo()});
    $("#inviaDenaro").on("click", function () {$("#modalInviaDenaro").modal('show')});
    $("#form_inviadenaro").on("submit", function (e) {maincontrol.inviaDenaro(e)});
    $("#aggiorna").on("click", function () {location.reload()});

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
              console.log(data);
              console.log(maincontrol.user_nickname);
          },
          error: function () {
              mainview.mostraAlert("Qualcosa è andato storto.");
          }

      })
    };

    maincontrol.controllaEsistenzaNick = function(nickname){
        maincontrol.verificaNick();
        if(nickname === maincontrol.user_nickname){
            destinatario_validato=false;
            mainview.mostraAlert("Impossibile inviare denaro a se stessi.");
            $("#destinatario").css("background-color", "#ff6962");

            $("#destinatario").on("click", function () {
                $("#destinatario").css("background-color", "");
            });
        }else {
            $.ajax({
                type: "POST",
                url: "/registrati/verificaNick",
                data: {nick: nickname},

                success: function (msg) {
                    console.log(msg);
                    if (msg === "NOTEXIST") {
                        destinatario_validato = false;
                        mainview.mostraAlert("Destinatario inesistente nel sistema.");
                        $("#destinatario").css("background-color", "#ff6962");

                        $("#destinatario").on("click", function () {
                            $("#destinatario").css("background-color", "");
                            mainview.ripulisciCampiErrati();

                        });
                    } else if (msg === "EXIST") {
                        $("#destinatario").css("background-color", "#66ff99");
                        destinatario_validato = true;
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
        if(destinatario_validato && cifra_validata) {
            maincontrol.getFontePagamento();

            var destinatario = $("#destinatario").val();
            /*
             * Formatter formatta la cifra con la virgola. Sostituisco la virgola con un punto
             * poichè su mysql i float sono identificati dal punto e non dalla virgola.
             */
            var importo = $("#importo").val().replace(/,/g, '.');
            var metodo = maincontrol.metodo;
            var causale = $("#causale").val();

            $.ajax({
                type: "POST",
                url: "/home/inviaDenaro",
                data: {destinatario: destinatario, importo: importo, metodo: metodo, causale: causale},

                beforeSend: function(){
                    $("#formModal").hide();
                    $("#loadingInvioDenaro").show();
                },

                success: function (msg) {
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

                }
            })
        }
    };

    mainview.mostraBarraLoading = function(){
      $("#loading").show();
    };

    mainview.nascondiBarraLoading = function(){
      $("#loading").hide();
    };

    mainview.mostraAlert = function(msg){
        $("#alert_text").text(msg);
        $("#alert").show("slow");
    };

    mainview.ripulisciCampiErrati = function(){
        $("#alert").hide("fast");
    };

    $(document).ready(function () {

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

        $("#destinatario").blur(function () {
            if ($("#destinatario").val() != "") {
                if (/^[a-zA-Z0-9]+$/.test($("#destinatario").val())) {
                    destinatario_validato = true;
                    $("#alert").hide();
                    maincontrol.controllaEsistenzaNick($("#destinatario").val());
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


        $("#importo").change(function () {
            var cifra = $("#importo").val();
            if(cifra != "") {
                $("#importo").val(formatter.format(cifra));
                cifra_validata = true;
                return;
            }else{
                cifra_validata = false;
            }
        });

        $("#importo").on('click',function () {
            $("#importo").val("");
        });

    });
})();