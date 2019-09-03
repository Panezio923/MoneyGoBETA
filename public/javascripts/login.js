(function () {
    var mainview = {};
    var maincontrol = {};

    $("#recPass").on('click', function () {location.href='/recuperoPassword';});

    $("#buttonLogin").on('click',function(e){maincontrol.premutoLogin(e)});
    $("#password").on('keyup',function(e){
        if(e.keyCode === 13)
        maincontrol.premutoLogin(e)
    });
    $("#registrati").on("click", function(){maincontrol.premutoRegistrati()});


    maincontrol.premutoRegistrati = function () {
        mainview.mostraBarraLoading();
        location.href = '/registrati';
        mainview.nascondiBarraLoading();
    };

    mainview.mostraBarraLoading = function () {
        $("#body_card").hide();
        $("#loading").show();
    };

    mainview.nascondiBarraLoading = function () {
        $("#loading").hide();
        $("#body_card").show();
    };

    mainview.campiVuoti = function(){
        $(".card-title").hide();
        $("#alert_text").text("Per favore, inserire i dati richiesti");
        $("#alert").show("slow");
    };

    maincontrol.redirectHome = function() {
        location.href = '/home';
    };

    maincontrol.checkKey = function(e){
        if(e.keyCode === 13){
            maincontrol.premutoLogin();
        }else console.log("CACCA");
    };

    maincontrol.premutoLogin = function (e) {
        e.preventDefault();
        console.log("Loginclicked");

        var username = $("#user").val();
        var password = $("#password").val();


        if(username === "" || password === ""){
            mainview.campiVuoti();
        }else {
            $.ajax({
                type: "POST",
                url: "/login",
                data: {user: username, password: password},
                //dataType: dataType,

                beforeSend: function () {
                    $("#body_card").hide();
                    $("#loading").show();
                },

                success: function (msg) {
                    console.log(msg);
                    $("#loading").hide();
                    $("#body_card").show();

                    if (msg === "MATCH") {
                        maincontrol.redirectHome();
                    }
                    else if(msg === "NOMATCH") {
                        $(".card-title").hide();
                        $("#alert_text").text("Nickname o Password errata");
                        $("#alert").show("slow");
                    }
                    else if(msg === "NOTEXIST"){
                        $(".card-title").hide();
                        $("#alert_text").text("Nickname non esistente");
                        $("#alert").show("slow");
                    }
                }
            });
        }
    };
$(document).ready(function () {

});
})();

