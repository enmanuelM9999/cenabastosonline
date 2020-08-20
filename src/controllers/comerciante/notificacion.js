const express = require('express');
const router = express.Router();
const { esComerciante, esComercianteAprobado } = require('../../lib/auth');
const pool = require("../../database");

router.get('/listadoNotificaciones', esComercianteAprobado, async (req, res) => {
    try {
        const rowNumeroNotificaciones = await pool.query("SELECT notificacionesSinLeer FROM comerciante WHERE pkIdComerciante = ?", [req.session.idComerciante]);

        const rowsNotificaciones = await pool.query("SELECT notificacioncomerciante.titulo, notificacioncomerciante.descripcion, notificacioncomerciante.rutaRedireccionamiento, notificacioncomerciante.fechaHoraNotificacionComerciante, imagen.rutaImagen FROM notificacioncomerciante INNER JOIN imagen ON imagen.pkIdImagen = notificacioncomerciante.fkIdImagen WHERE notificacioncomerciante.fkIdComerciante = ? ORDER BY notificacioncomerciante.pkIdNotificacionComerciante DESC", [req.session.idComerciante]);

        res.render("comerciante/notificaciones/listadoNotificacion", {rowNumeroNotificaciones:rowNumeroNotificaciones[0], rowsNotificaciones} );
    } catch (error) {
        console.log(error);
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

module.exports = router;