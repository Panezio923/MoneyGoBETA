(function () {
   var mainview = {};
   var maincontrol = {};

   $("#loginLink").on('click', function (e) {maincontrol.premutoLogin(e)});
   $("#registrati").on('click', function () {location.href = '/registrati';});


   mainview.mostraAlert = function(msg){
      $(".testo_alert").text(msg);
      $(".alert").show("slow");
   };

   /*
    * Quando l'utente clicca sul login convalido i dati di accesso e creo
    * in sessione tutte le informazioni utili per l'utilizzo della piattaforma
    * successivamente richiamo maincontrol.eseguiTransazione per procedere con il trasferimento di
    * denaro.
    */
   maincontrol.premutoLogin = function (e) {
      e.preventDefault();
      console.log("Loginclicked");

      var username = $("#user").val();
      var password = $("#password").val();

      if(username === "" || password === ""){
         mainview.mostraAlert("Non sono ammessi campi vuoti");
      }else {
         $.ajax({
            type: "POST",
            url: "/login",
            data: {user: username, password: password},
            //dataType: dataType,

            beforeSend: function () {
               $("#form_login").hide();
               $("#loading").show();
            },

            success: function (msg) {
               console.log(msg);
               $("#loading").hide();
               $("#form_login").show();

               if (msg === "MATCH") {
                  maincontrol.eseguiTransazione();
               }
               else if(msg === "NOMATCH") {
                  mainview.mostraAlert("I dati inseriti non sono corretti. Riprovare")
               }
               else if(msg === "NOTEXIST"){
                  mainview.mostraAlert("Nickname non presente nel sistema");
               }
            }
         });
      }
   };


   maincontrol.eseguiTransazione = function(){

      var pathPagina = window.location.pathname;
      var url =  pathPagina + (pathPagina.charAt(pathPagina.length-1) === '/' ? "" : "/") + "eseguiTransazione";

      $.ajax({
         url: url,
         type: 'post',

         beforeSend: function(){
            $("#form_login").hide();
            $("#loading").show();
         },

         success: function (msg) {
            if(msg === "DONE"){
               location.href = '/home';
            }
            else if(msg === "TOO"){
               $("#form_login").show();
               $("#loading").hide();
               mainview.mostraAlert("Impossibile eseguire il pagamento con il saldo MoneyGO");
            }
            else if(msg === "ERR"){
               $("#form_login").show();
               $("#loading").hide();
               mainview.mostraAlert("Qualcosa è andato storto, ti invitiamo a riprovare");
            }
         }
      })

   };


   $(document).ready(function () {

   });
})();