(function () {
    var mainview = {};
    var maincontrol = {};

    maincontrol.ImportoCarta = function (){
        var carta = $("#ListaCarte option:selected").text();
        $.ajax({
            type: "POST",
            url: "/home/gestioneDati/aggiornaComunicazione",
            data: {carta: carta},

            success: function () {
                $("#importocorrente").val();
            }
        });

    }

});

$(document).ready(function () {
    $('#listaCarte a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show')

    });
});
