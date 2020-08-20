const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/listadoNotificaciones', esCliente, async (req, res) => {
    try {
        const rowNumeroNotificaciones = await pool.query("SELECT notificacionesSinLeer FROM cliente WHERE pkIdCliente = ?", [req.session.idCliente]);

        const rowsNotificaciones = await pool.query("SELECT notificacioncliente.titulo, notificacioncliente.descripcion, notificacioncliente.rutaRedireccionamiento, notificacioncliente.fechaHoraNotificacionCliente, imagen.rutaImagen FROM notificacioncliente INNER JOIN imagen ON imagen.pkIdImagen = notificacioncliente.fkIdImagen WHERE notificacioncliente.fkIdCliente = ? ORDER BY notificacioncliente.pkIdNotificacionCliente DESC", [req.session.idCliente]);

        res.render("cliente/notificaciones/listadoNotificacion", {rowNumeroNotificaciones:rowNumeroNotificaciones[0], rowsNotificaciones} );
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/explorar/listadoLocalesMinoristas");
    }
});

module.exports = router;