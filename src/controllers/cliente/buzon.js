const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/nuevoReclamo', esCliente, async (req, res) => {
    try {
        //const idCliente = req.session.idCliente;
        const idCliente = 1;
        //Buscar el historial de pedidos de un cliente
        var rowsHistorialPedidos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.fechaHoraEntrega FROM venta WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdCliente = ?", [1, 1, 1, idCliente]);
        var moment = require("moment");
        moment.locale("es-us");
        rowsHistorialPedidos[0].fechaHoraEntrega = moment(rowsHistorialPedidos[0].fechaHoraEntrega).format("LLLL");
        res.render("cliente/reclamos/nuevoReclamo", { rowsHistorialPedidos });
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/reclamos/nuevoReclamo");
    }
});

module.exports = router;
