const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/listadoBuzon', esCliente, async (req, res) => {
    try {
        const idCliente = req.session.idCliente;
        //Buscar todos los buzones de un cliente
        var moment = require("moment");
        moment.locale("es-us");
        var rowsUltimoMensaje = await pool.query("SELECT venta.fkIdLocalComercial FROM venta WHERE venta.fkIdCliente = ?", [idCliente]);
        for (let index = 0; index < rowsUltimoMensaje.length; index++) {
            var ultimoMensaje = await pool.query("SELECT venta.pkIdVenta,mensajebuzon.fechaHoraMensajeBuzon, mensajebuzon.mensajeBuzon, localcomercial.nombreLocal, imagen.rutaImagen FROM venta INNER JOIN buzon ON buzon.fkIdVenta = venta.pkIdVenta INNER JOIN mensajebuzon ON mensajebuzon.fkIdBuzon = buzon.pkIdBuzon INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE venta.fkIdCliente =? AND venta.fkIdLocalComercial = ? ORDER BY mensajebuzon.pkIdMensajeBuzon DESC LIMIT 1", [idCliente, rowsUltimoMensaje[index].fkIdLocalComercial]);
            const buzon = require("../../lib/buzon.component");
            for (let j = 0; j < ultimoMensaje.length; j++) {
                rowsUltimoMensaje[index].pkIdVenta = ultimoMensaje[j].pkIdVenta;
                rowsUltimoMensaje[index].fechaHoraMensajeBuzon = buzon.getFechaHoraChat(ultimoMensaje[j].fechaHoraMensajeBuzon).resumida;
                rowsUltimoMensaje[index].mensajeBuzon = ultimoMensaje[j].mensajeBuzon;
                rowsUltimoMensaje[index].nombreLocal = ultimoMensaje[j].nombreLocal;
                rowsUltimoMensaje[index].rutaImagen = ultimoMensaje[j].rutaImagen;
            }

        }


        //rowsHistorialPedidos[0].fechaHoraEntrega = moment(rowsHistorialPedidos[0].fechaHoraEntrega).format("LLLL");
        res.render("cliente/buzon/listadoBuzon", { rowsUltimoMensaje });
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/buzon/listadoBuzon");
    }
});

router.get('/contacto', esCliente, async (req, res) => {
    try {
        //const idCliente = req.session.idCliente;
        res.render("cliente/buzon/contacto");
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/buzon/listadoBuzon");
    }
});

module.exports = router;
