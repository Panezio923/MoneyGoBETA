(function () {

    var mainview = {};
    var maincontrol = {};


    $("#gestCarte").on("click", function(){maincontrol.premutogestisciCarte()});
    $("#gestProfilo").on("click", function(){maincontrol.premutogestisciProfilo()});

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

    mainview.mostraBarraLoading = function () {
        $("#loading").show();
    };

    mainview.nascondiBarraLoading = function () {
        $("#loading").hide();
    };

    $(document).ready(function () {

    });
})();