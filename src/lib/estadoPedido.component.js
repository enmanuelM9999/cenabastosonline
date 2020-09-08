const pool = require("../database");
let component = {};

component.getEstadoDelPedido = async (idVenta) => {
    const rowsLog = await pool.query("SELECT pkIdLogVenta,concepto,fechaHoraLogVenta FROM logventa WHERE fkIdVenta=? ORDER BY pkIdLogVenta DESC ", [idVenta]);

    let htmlComponent = `
    <div class="card shadow">
        <div class="card resumen">
            ${rowsLog[0].concepto}
            <br>
            <small>
                ${rowsLog[0].fechaHoraLogVenta}
            </small>

        </div>
        <br>
        <div class="card log">`;

    for (let index = 0; index < rowsLog.length; index++) {
        htmlComponent += `
        ${rowsLog[index].concepto}
        <br>
        <small>
            ${rowsLog[index].fechaHoraLogVenta}
        </small>
        <br>
        `;
    }
    htmlComponent += `
        </div>

    </div>
    `;

    return htmlComponent;

}

module.exports = component;