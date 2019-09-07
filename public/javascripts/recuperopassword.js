(function () {
    var mainview = {};
    var maincontrol = {};

    var email_validata = false;
    var nickname_validato = false;

    $("#form_recupero").submit(function (e) {maincontrol.modificaPassword(e)});
    $("#getHome").on("click", function(){location.href = "/"});

    mainview.mostraAlert = function(msg){
        $("#alert_text").text(msg);
        $(".alert").show("slow");
    };

    mainview.ripulisciCampiErrati = function(){
        $(".alert").hide("fast");
        $("#mail").css("background-color", "");
        $("#nick").css("background-color", "");
    };

    maincontrol.controllaEsistenzaMail = function(email){
        $.ajax({
            type: "POST",
            url: "/registrati/verificaEmailUnica",
            data: {email: email},

            success: function (msg) {
                if(msg === "NOTEXIST"){
                    email_validata=false;
                    mainview.mostraAlert("Email non presente nel sistema");
                    $("#mail").css("background-color", "#ff6962");

                    $("#mail").on("click", function () {
                        $("#mail").css("background-color", "");
                    });
                }else if (msg === "EXIST"){
                    email_validata=true;
                    $("#mail").css("background-color", "#66ff99");
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaCoincidenza();
                }
            }
        })
    };

    maincontrol.controllaEsistenzaNick = function(nickname){
        $.ajax({
            type: "POST",
            url: "/registrati/verificaNick",
            data: {nick: nickname},

            success: function (msg) {
                console.log(msg);
                if(msg === "NOTEXIST"){
                    nickname_validato=false;
                    mainview.mostraAlert("Nickname non presente nel sistema");
                    $("#nick").css("background-color", "#ff6962");

                    $("#nick").on("click", function () {
                        $("#nick").css("background-color", "");

                    });
                }else if (msg === "EXIST"){
                    $("#nick").css("background-color", "#66ff99");
                    nickname_validato=true;
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaCoincidenza();
                }
            }
        })
    };

    maincontrol.controllaCoincidenza = function(){
      var email = $("#mail").val();
      var nickname = $("#nick").val();

      if(email != "" && nickname != "") {
          $.ajax({
              type: "POST",
              url: "/registrati/verificaCoincidenza",
              data: {nickname: nickname, email: email},

              success: function (msg) {
                  if (msg === "CHECK") {
                      email_validata = true;
                      nickname_validato = true;
                      $("#nick").css("background-color", "#66ff99");
                      $("#mail").css("background-color", "#66ff99");
                  } else if (msg === "UNCHECK") {
                      email_validata = false;
                      nickname_validato = false;
                      mainview.mostraAlert("I dati inseriti non appartengono allo stesso account.");
                      $("#nick").css("background-color", "#fff291");
                      $("#mail").css("background-color", "#fff291");

                  }
              }
          })
      }
    };

    maincontrol.modificaPassword = function(e){
        e.preventDefault();
        var email = $("#mail").val();
        var nickname = $("#nick").val();

        if(email_validata && nickname_validato) {
            $.ajax({
                type: "POST",
                data: {email: email, nickname: nickname},
                url: "/registrati/inviaNuovaPassword",

                success: function (msg) {
                    if (msg === "DONE") {
                       $("#form_recupero").css("display", "none");
                       $("#alertCheck").show();
                    } else if (msg === "FAULT") {
                        console.log("ERR");
                    }
                }
            })
        }else console.log("ciao errore");
    };

    $(document).ready(function () {

    /*Controllo Email */
        $("#mail").blur(function(){
            if($("#mail").val() != ""){
                if(/^[A-Z0-9a-z._-]{3,}@[A-Z0-9a-z.-]{2,}\.[A-Za-z0-9]{2,4}$/.test($("#mail").val())){
                    email_validata = true;
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaEsistenzaMail($("#mail").val());

                    return;
                }
                else{
                    email_validata = false;
                    mainview.mostraAlert("Dati inseriti non validi");
                    $("#mail").css("borderColor", "red");

                    $("#mail").on("click", function () {
                        $("#mail").css("borderColor", "");
                        $("#nick").css("background-color", "");
                    });
                }
            }
            email_validata = false;
        });

        $("#nick").blur(function(){
            if($("#nick").val() != ""){
                if(/^[a-zA-Z0-9]+$/.test($("#nick").val())){
                    nickname_validato = true;
                    mainview.ripulisciCampiErrati();
                    maincontrol.controllaEsistenzaNick($("#nick").val());

                    return;
                }
                else{
                    nickname_validato = false;
                    mainview.campiErrati();
                    $("#nick").css("borderColor", "red");

                    $("#nick").on("click", function () {
                        $("#nick").css("borderColor", "");
                        $("#mail").css("background-color", "");
                    });
                }
            }
            nickname_validato = false;
        });

    });
})();