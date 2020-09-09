const pool = require("../database");
let component = {};

component.getUltimoEstado = async (idVenta) => {
    try {
        const rowsLog = await pool.query("SELECT pkIdLogVenta,concepto,fechaHoraLogVenta FROM logventa WHERE fkIdVenta=? ORDER BY pkIdLogVenta DESC ", [idVenta]);
        if (rowsLog.length<=0) {
            throw new Error("No hay registros en el log");
        }
        return rowsLog[0].concepto;

    } catch (error) {

    }
}

component.getHtmlCard = async (idVenta) => {
    try {
        const rowsLog = await pool.query("SELECT pkIdLogVenta,concepto,fechaHoraLogVenta FROM logventa WHERE fkIdVenta=? ORDER BY pkIdLogVenta DESC ", [idVenta]);
        let moment= require("moment");
        let htmlComponent = `
    <div class="card p-3">
        <h4>Estado del pedido</h4>
        <br>
        <div class="card p-2 resumen">
            ${rowsLog[0].concepto}
            <br>
            <small>
                ${moment(rowsLog[0].fechaHoraLogVenta,"YYYY-MM-DD HH:mm:ss").format("LLLL")}
            </small>
        </div>
        <br>
        <div class="card p-2 log" style="max-height:400px; overflow-y:auto">`;

        for (let index = 0; index < rowsLog.length; index++) {
            htmlComponent += `
        ${rowsLog[index].concepto}
        <br>
        <small>
            ${moment(rowsLog[0].fechaHoraLogVenta,"YYYY-MM-DD HH:mm:ss").format("LLLL")}
        </small>
        <br>
        `;
        }
        htmlComponent += `
        </div>

    </div>
    `;

        return htmlComponent;

    } catch (error) {

    }
}

module.exports = component;