const { json } = require("body-parser");
const pool = require("../database");
let component = {};

const estados = [
    [],
    [2],
    [3],
    [4, 8, 9],
    [5, 8, 9],
    [6, 8, 9],
    [7, 8, 9],
    [8, 9],
    [10],
    [11],
    [],
    [],
    [8, 9],
    [8, 9],
    [4],
    [16],
    []
];
const conceptosEstados = [
    {},
    { cod: 1, concepto: "Carrito", descripcion: "El pedido se encuentra en el carrito y aún no se ha pagado" },
    { cod: 2, concepto: "Decide pago virtual ", descripcion: "El cliente ha elegido pagar virtualmente" },
    { cod: 3, concepto: "Pago virtual aceptado", descripcion: "El proveedor de pagos virtuales ha aceptado el dinero" },
    { cod: 4, concepto: "Nuevo pedido", descripcion: "El pedido ha sido recibido por el comerciante" },
    { cod: 5, concepto: "Pedido empacado ", descripcion: "El pedido ha sido empacado" },
    { cod: 6, concepto: "Pedido enviado", descripcion: "El pedido está en camino" },
    { cod: 7, concepto: "Pedido recibido", descripcion: "El cliente ha recibido los productos" },
    { cod: 8, concepto: "Ayuda pedida al comerciante", descripcion: "El cliente ha solicitado ayuda al comerciante" }, //Añadir comentarios del cliente a la descripcion que se guarda en la BD
    { cod: 9, concepto: "Ayuda a Megaplaza", descripcion: "El cliente ha solicitado ayuda a Megaplaza" },
    { cod: 10, concepto: "Ayuda resuelta", descripcion: "" },
    { cod: 11, concepto: "Ayuda resuelta", descripcion: "" },
    { cod: 12, concepto: "Pedido reembolsado", descripcion: "" },
    { cod: 13, concepto: "Pedido cambiado", descripcion: "El comerciante accedió a cambiarle al cliente uno o más productos" },
    { cod: 14, concepto: "Decide pago contra entrega", descripcion: "" },
    { cod: 15, concepto: "Ayuda pedida a Megaplaza", descripcion: "El comerciante pide ayuda a Megaplaza" },
    { cod: 16, concepto: "Ayuda resuelta", descripcion: "" }
];

component.getEstadoNuevaVenta = async() => {
    try {
        let jsonEstados = {
            estadoActual: 1,
            historial: [
                {}
            ]
        };

        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();

        let itemHistorial = {
            codEstado: 1,
            concepto: conceptosEstados[1].concepto,
            descripcion: conceptosEstados[1].descripcion,
            fechaHoraLogVenta: moment
        };

        jsonEstados.historial.push(itemHistorial);
        return jsonEstados;

    } catch (error) {

    }
}

component.setEstado = async(idVenta, estadoMeta, descripcionExtra, tipoUsuarioSolicitante) => {
    try {
        //Obtener los estados de la BD
        let jsonEstados = await getJsonEstados(idVenta);
        // Obtener el estado actual
        let estadoActual = jsonEstados.estadoActual;
        // Obtener los estados meta posibles
        let estadosPosibles = estados[estadoActual];
        //Verificar si es posible ir al estado meta
        const posicion = estadosPosibles.indexOf(estadoMeta); //indexOf  busca la primera posicion en donde se encuentre una variable en el array
        if (posicion == -1) {
            throw new Error("impDev-doDefault-El estado actual no tiene permitido ir al estado objetivo");
        }

        if (estadoMeta == 8 && tipoUsuarioSolicitante != 3) {
            throw new Error("impDev-doDefault-El estado actual no tiene permitido ir al estado objetivo");
        }
        if (estadoMeta == 15 && tipoUsuarioSolicitante != 2) {
            throw new Error("impDev-doDefault-El estado actual no tiene permitido ir al estado objetivo");
        }
        if (estadoMeta == 9 && tipoUsuarioSolicitante != 3) {
            throw new Error("impDev-doDefault-El estado actual no tiene permitido ir al estado objetivo");
        }
        if (estadoMeta == 9) {
            let resultado = jsonEstados.historial.find(estado => estado.codEstado === 10);
            if (resultado == undefined) {
                throw new Error("impDev-doDefault-El estado actual no tiene permitido ir al estado objetivo");
            }
        }

        //Actualizar json
        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const newLog = {
            codEstado: estadoMeta,
            concepto: conceptosEstados[estadoMeta].concepto,
            descripcion: conceptosEstados[estadoMeta].descripcion + " \n" + descripcionExtra,
            fechaHoraLogVenta: moment
        };
        jsonEstados.estadoActual = estadoMeta;
        jsonEstados.historial.push(newLog);
        //Si se cerró una ayuda, se debe ir al estado en el que estaba
        if (jsonEstados.estadoActual == 10 || jsonEstados.estadoActual == 11 || jsonEstados.estadoActual == 16) {
            jsonEstados = cerrarEstadoAyuda(jsonEstados);
        }
        //Crear registro en bd
        let jsonString = JSON.stringify(jsonEstados);
        await pool.query("UPDATE venta SET jsonEstados=? WHERE pkIdVenta=?", [jsonString, idVenta]);
    } catch (error) {
        console.log(error);
    }
}

//Recibe un json, lo modifica para cerrar la ayuda, y devuelve el json para ser usado en setEstado()
let cerrarEstadoAyuda = async(jsonEstados) => {
    try {

        //Validar si es estado 10,11 0 16
        if (jsonEstados.estadoActual != 10 || jsonEstados.estadoActual != 11 || jsonEstados.estadoActual != 16) {
            throw new Error("cerrarAyuda solo es para los estados 10,11 y 16");
        }
        //Adjuntar acciones necesarias para estados meta específicos. Ejm: Cuando vaya al estado 6, notificar a wompi
        // Obtener el nuevo estado actual
        let estadoActual = jsonEstados.historial[jsonEstados.historial.length - 2]; //Es el ultimo menos 2 posiciones
        //Actualizar json
        jsonEstados.estadoActual = estadoActual;
        //Devolver json modificado
        return jsonEstados;

    } catch (error) {
        console.log(error);
    }
}

let getJsonEstados = async(idVenta) => {
    try {
        const rowsJson = await pool.query("SELECT jsonEstados FROM venta WHERE pkIdVenta=?", [idVenta]);
        if (rowsJson.length != 1) {
            throw new Error("No hay registros o hay más de 1 registro");
        }
        let jsonEstados = JSON.parse(rowsJson[0]);
        return jsonEstados;

    } catch (error) {
        console.log(error);
    }
}

component.getHtmlCard = async(idVenta) => {
    try {
        const rowsLog = await pool.query("SELECT jsonEstados FROM venta WHERE pkIdVenta=?", [idVenta]);
        let stringJson = rowsLog[0].jsonEstados;
        let jsonEstados = JSON.parse(stringJson);
        let historial = jsonEstados.historial;
        let estadoActual = jsonEstados.estadoActual;
        let moment = require("moment");

        //variables de la card
        let logs = ``;
        for (let index = 0; index < historial.length; index++) {
            logs += `
            ${historial[index].concepto}
            <br>
            <small>
                ${moment(historial[0].fechaHoraLogVenta, "YYYY-MM-DD HH:mm:ss").format("LLLL")}
            </small>
            <br>`;
        }
        //la card
        let htmlComponent = `
    <div class="card p-3">
        <h4>Estado del pedido</h4>
        <br>
        <div class="card p-2 resumen">
            ${estadoActual[0].concepto}
            <br>
            <small>
                ${moment(estadoActual[0].fechaHoraLogVenta, "YYYY-MM-DD HH:mm:ss").format("LLLL")}
            </small>
        </div>
        <br>
        <div class="card p-2 log" style="max-height:400px; overflow-y:auto">
            ${logs}
        </div>

    </div>
    `;

        return htmlComponent;

    } catch (error) {
        console.log(error);
    }
}

module.exports = component;