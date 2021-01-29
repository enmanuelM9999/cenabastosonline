const pool = require("../database");
let component = {};

const estados = [[1,2], [3], [3], [4], [5], [6], [7,8], [], [9,10], [7], [11,12], [7], [13], [14], [], [9,11],[14] ];
const conceptosEstados = [
    { cod: 0, concepto: "Carrito", descripcion: "El pedido se encuentra en el carrito y aún no se ha pagado" },
    { cod: 1, concepto: "Pago virtual", descripcion: "El cliente ha elegido pagar virtualmente" },
    { cod: 2, concepto: "Pago CE", descripcion: "El cliente ha elegido pagar contraentrega" },
    { cod: 3, concepto: "Empacado", descripcion: "Tu pedido está listo para ser enviado." },
    { cod: 4, concepto: "Enviado", descripcion: "Tu pedido está en camino." },
    { cod: 5, concepto: "Entregado", descripcion: "Has recibido el pedido." },
    { cod: 6, concepto: "Exitoso", descripcion: "El pago ha sido efectuado." },
    { cod: 7, concepto: "Reclamo abierto", descripcion: "Has abierto un reclamo:" }, //Añadir comentarios del cliente a la descripcion que se guarda en la BD
    { cod: 8, concepto: "Reclamo rechazado", descripcion: "" },
    { cod: 9, concepto: "Cancelado", descripcion: "La administración aceptó tu reclamo" },
    { cod: 10, concepto: "Devuelto", descripcion: "" },
    { cod: 11, concepto: "", descripcion: "" },
    { cod: 12, concepto: "", descripcion: "" },
    { cod: 13, concepto: "", descripcion: "" },
    { cod: 14, concepto: "", descripcion: "" },
    { cod: 15, concepto: "", descripcion: "" },
    { cod: 16, concepto: "", descripcion: "" }
];

component.setEstado = async (fkIdVenta, estadoActual, estadoMeta, descripcionExtra) => {
    try {
        const estadosPosibles = estados[estadoActual];

        //Verificar si es posible ir al estado meta
        const posicion = estadosPosibles.indexOf(estadoMeta);
        if (posicion == -1) {
            throw new Error("impDev-doDefault-El estado actual no tiene permitido ir al estado objetivo");
        }
        //Adjuntar acciones necesarias para estados meta específicos. Ejm: Cuando vaya al estado 6, notificar a wompi
        
        //Crear registro en bd
        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const newLog = {
            fkIdVenta,
            codEstado: estadoMeta,
            concepto: conceptosRutas[estadoMeta].concepto,
            descripcion: conceptosRutas[estadoMeta].descripcion+" "+descripcionExtra,
            fechaHoraLogVenta: moment
        };
        await pool.query("INSERT INTO logventa SET ?", [newLog]);
    } catch (error) {
        console.log(error);
    }
}

component.getUltimoEstado = async (idVenta) => {
    try {
        const rowsLog = await pool.query("SELECT pkIdLogVenta,concepto,fechaHoraLogVenta FROM logventa WHERE fkIdVenta=? ORDER BY pkIdLogVenta DESC ", [idVenta]);
        if (rowsLog.length <= 0) {
            throw new Error("No hay registros en el log");
        }
        return rowsLog[0].concepto;

    } catch (error) {

    }
}

component.getHtmlCard = async (idVenta) => {
    try {
        const rowsLog = await pool.query("SELECT pkIdLogVenta,concepto,fechaHoraLogVenta FROM logventa WHERE fkIdVenta=? ORDER BY pkIdLogVenta DESC ", [idVenta]);
        let moment = require("moment");

        //variables de la card
        let logs = ``;
        for (let index = 0; index < rowsLog.length; index++) {
            logs += `
            ${rowsLog[index].concepto}
            <br>
            <small>
                ${moment(rowsLog[0].fechaHoraLogVenta, "YYYY-MM-DD HH:mm:ss").format("LLLL")}
            </small>
            <br>`;
        }
        //la card
        let htmlComponent = `
    <div class="card p-3">
        <h4>Estado del pedido</h4>
        <br>
        <div class="card p-2 resumen">
            ${rowsLog[0].concepto}
            <br>
            <small>
                ${moment(rowsLog[0].fechaHoraLogVenta, "YYYY-MM-DD HH:mm:ss").format("LLLL")}
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

    }
}

module.exports = component;