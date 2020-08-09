var buzon={};
//Funciones privadas
function getFechaHoraChat(stringFechaHora) {
    var moment = require('moment'); // require
    var momentNow = require('moment'); // require
    moment.locale("es-us");
    momentNow.locale("es-us");

    moment = moment(stringFechaHora, "YYYY-MM-DD HH:mm:ss");
    var stringMomentNow = momentNow.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
    momentNow = momentNow(stringMomentNow);

    const resumida = moment.from(momentNow);
    const detallada = moment.format("LLLL");
    fechaHora = { resumida, detallada };
    return fechaHora;
}

//Funciones a exportar
buzon.getMessageBubble=(message, stringFechaHora, isRight)=> {
    var date=getFechaHoraChat(stringFechaHora);
    var leftRightHtml = "mr-auto";
    var bubbleBgHtml="";
    if (isRight) {
        leftRightHtml = "ml-auto";
        bubbleBgHtml="background: rgb(212, 255, 228);";
    }
    var bubbleHtml = '<div class="mensaje w-100"><div style="'+bubbleBgHtml+'" class="burbuja m-2 col-7 card ' + leftRightHtml +'">' +
        message +
        '<br>'+
    '<small class="text-muted">'+
    '<div class="dropdown">'+
    '<a class="dropdown-toggle" type="button" id="dropdownMenuButton"'+
    'data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
    '' + date.resumida + ''+
    '</a>'+
    '<div class="dropdown-menu p-2" aria-labelledby="dropdownMenuButton">'+
    '' + date.detallada + ''+
    '</div>'+
    '</div>'+
    '</small>'+
    '</div> </div>'
    return bubbleHtml;
}

buzon.getFechaHoraChat=(stringFechaHora)=>{
    var moment = require('moment'); // require
    var momentNow = require('moment'); // require
    moment.locale("es-us");
    momentNow.locale("es-us");

    moment = moment(stringFechaHora, "YYYY-MM-DD HH:mm:ss");
    var stringMomentNow = momentNow.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
    momentNow = momentNow(stringMomentNow);

    const resumida = moment.from(momentNow);
    const detallada = moment.format("LLLL");
    fechaHora = { resumida, detallada };
    return fechaHora;
}

module.exports=buzon;