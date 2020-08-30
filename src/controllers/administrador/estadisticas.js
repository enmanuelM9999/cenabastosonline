const express = require('express');
const router = express.Router();
const { esAdmin } = require('../../lib/auth');
const pool = require("../../database");

router.get('/buscarPorFechas', esAdmin, async (req, res) => {
    try {
        res.render("administrador/estadisticas/buscarLocales");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/buscarLocal', esAdmin, async (req, res) => {
    try {
        const { cedula } = req.body;
        var rowsLocalesComerciante = await pool.query("SELECT personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.idLocalEnCenabastos, localcomercial.totalVendido FROM personanatural INNER JOIN comerciante ON comerciante.fkIdPersonaNatural = personanatural.pkIdPersonaNatural INNER JOIN localcomercial ON localcomercial.fkIdComerciantePropietario = comerciante.pkIdComerciante WHERE personanatural.numeroDocumento = ?", [cedula]);
        const nombrePropietario = rowsLocalesComerciante[0].nombresPersonaNatural + ' ' + rowsLocalesComerciante[0].apellidosPersonaNatural;

        /*for (let index = 0; index < rowsLocalesComerciante.length; index++) {
            var rowsVendidios = await pool.query("SELECT montoTotal FROM venta WHERE fkIdLocalComercial = ?", [rowsLocalesComerciante[index].pkIdLocalComercial]);
            var totalMostar = 0;
            for (let j = 0; j < rowsVendidios.length; j++) {
                totalMostar += rowsVendidios[j].montoTotal;
            }
            rowsLocalesComerciante[index].totalMostar = totalMostar;
            totalMostar = 0;
        }*/
        res.render("administrador/estadisticas/buscarLocales", { nombrePropietario, rowsLocalesComerciante });
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/buscarFechas/:id', esAdmin, async (req, res) => {
    try {
        const {id} = req.params;
        const totalMostar=0;
        const rowNombreLocal = await pool.query("SELECT nombreLocal, idLocalEnCenabastos FROM localcomercial WHERE pkIdLocalComercial = ?",[id]);
        res.render("administrador/estadisticas/buscarFechas",{id, rowNombreLocal:rowNombreLocal[0], totalMostar});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/buscarVendidoPorFechas', esAdmin, async (req, res) => {
    try {
        const {idLocal, dateInicio, dateFin} = req.body;
        req.check("dateInicio", "Ingrese Fecha Inicio de Busqueda").notEmpty();
        req.check("dateFin", "Ingrese Fecha Fin de Busqueda").notEmpty();
        const id = idLocal;

        const newDateInicio = dateInicio+' 00:00:00';
        const newDateFin = dateFin+' 23:59:59';

        let totalMostar = 0;
        const rowsVendidios = await pool.query("SELECT montoTotal FROM venta WHERE fkIdLocalComercial = ? AND fueEntregado = ? AND fueEmpacado = ? AND fueEnviado = ? AND fechaHoraEntrega BETWEEN ? AND ?", [idLocal, 1, 1, 1, newDateInicio, newDateFin]);
        for (let j = 0; j < rowsVendidios.length; j++) {
            totalMostar += rowsVendidios[j].montoTotal;
        }
        const rowNombreLocal = await pool.query("SELECT idLocalEnCenabastos, nombreLocal FROM localcomercial WHERE pkIdLocalComercial = ?",[idLocal]);

        const rangoBuscado = '<div class="mt-3"> El rango de fechas a buscar fue entre <i class="fas fa-calendar-day"></i> '+ newDateInicio +' - <i class="fas fa-calendar-day"></i> '+newDateFin+' </div>';


        res.render("administrador/estadisticas/buscarFechas", {totalMostar, rowNombreLocal:rowNombreLocal[0], rangoBuscado, id});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/buscarTodosLocales', esAdmin, async (req, res) => {
    try {
        let totalVendido = 0;
        const rowsVendidios = await pool.query("SELECT totalVendido FROM localcomercial");
        for (let j = 0; j < rowsVendidios.length; j++) {
            totalVendido += rowsVendidios[j].totalVendido;
        }
        res.render("administrador/estadisticas/todasVentas", {totalVendido});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/totalVendidoFechas', esAdmin, async (req, res) => {
    try {
        res.render("administrador/estadisticas/ventasLocalesFechas");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/totalVendidoFechas', esAdmin, async (req, res) => {
    try {
        const { dateInicio, dateFin } = req.body;
        req.check("dateInicio", "Ingrese Fecha Inicio de Busqueda").notEmpty();
        req.check("dateFin", "Ingrese Fecha Fin de Busqueda").notEmpty();

        const newDateInicio = dateInicio+' 00:00:00';
        const newDateFin = dateFin+' 23:59:59';

        const rangoBuscado = '<div class="mt-3"> El rango de fechas a buscar fue entre <i class="fas fa-calendar-day"></i> '+ newDateInicio +' - <i class="fas fa-calendar-day"></i> '+newDateFin+' </div>';

        let rowsLocalesComerciante = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.idLocalEnCenabastos, personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural FROM localcomercial INNER JOIN comerciante ON comerciante.pkIdComerciante = localcomercial.fkIdComerciantePropietario INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = comerciante.fkIdPersonaNatural ORDER BY localcomercial.idLocalEnCenabastos");

        for (let index = 0; index < rowsLocalesComerciante.length; index++) {
            
            let rowsVendidios = await pool.query("SELECT montoTotal FROM venta WHERE fkIdLocalComercial = ? AND fueEntregado = ? AND fueEmpacado = ? AND fueEnviado = ? AND fechaHoraEntrega BETWEEN ? AND ? ", [rowsLocalesComerciante[index].pkIdLocalComercial, 1, 1, 1, newDateInicio, newDateFin]);
            
            let totalMostar = 0;
            for (let j = 0; j < rowsVendidios.length; j++) {
                totalMostar += rowsVendidios[j].montoTotal;
            }
            rowsLocalesComerciante[index].totalMostar = totalMostar;
            totalMostar = 0;
        }
        res.render("administrador/estadisticas/ventasLocalesFechas", { rowsLocalesComerciante , rangoBuscado });
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

module.exports = router;