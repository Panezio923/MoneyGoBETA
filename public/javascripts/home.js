(function () {

    var mainview = {};
    var maincontrol = {
        user_nickname: null,
        metodo: null,
    };

    var destinatario_validato = false;


    $("#gestCarte").on("click", function(){maincontrol.premutogestisciCarte()});
    $("#gestProfilo").on("click", function(){maincontrol.premutogestisciProfilo()});
    $("#inviaDenaro").on("click", function () {$("#modalInviaDenaro").modal('show')});

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
      else{
          maincontrol.metodo = $("#comunicazioneModifica option:selected").text();
      }
    };

    maincontrol.inviaDenaro = function(e){
        e.preventDefault();
        //richiesta ajax per l'invio di denaro
    };

    mainview.mostraBarraLoading = function () {
        $("#loading").show();
    };

    mainview.nascondiBarraLoading = function () {
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

        $("#checkPredefinito").prop('checked', false);

        $("#destinatario").blur(function(){
            if($("#destinatario").val() != ""){
                if(/^[a-zA-Z0-9]+$/.test($("#destinatario").val())){
                    destinatario_validato = true;
                    $("#alert").hide();
                    maincontrol.controllaEsistenzaNick($("#destinatario").val());
                    return;
                }
                else{
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

        $("#checkPredefinito").on('click',function () {
            console.log($("#checkPredefinito").is(':checked'));
            if($("#checkPredefinito").is(':checked')) $("#items").prop('disabled', true);
            else $("#items").prop('disabled', false);

        })

    });
})();