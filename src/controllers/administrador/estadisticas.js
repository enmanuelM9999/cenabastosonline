const express = require('express');
const router = express.Router();
//const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/buscarPorFechas', async (req, res) => {
    try {
        res.render("administrador/estadisticas/buscarLocales");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/buscarLocal', async (req, res) => {
    try {
        const { cedula } = req.body;
        var rowsLocalesComerciante = await pool.query("SELECT personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.idLocalEnCenabastos FROM personanatural INNER JOIN comerciante ON comerciante.fkIdPersonaNatural = personanatural.pkIdPersonaNatural INNER JOIN localcomercial ON localcomercial.fkIdComerciantePropietario = comerciante.pkIdComerciante WHERE personanatural.numeroDocumento = ?", [cedula]);
        const nombrePropietario = rowsLocalesComerciante[0].nombresPersonaNatural + ' ' + rowsLocalesComerciante[0].apellidosPersonaNatural;

        for (let index = 0; index < rowsLocalesComerciante.length; index++) {
            var rowsVendidios = await pool.query("SELECT montoTotal FROM venta WHERE fkIdLocalComercial = ?", [rowsLocalesComerciante[index].pkIdLocalComercial]);
            var totalMostar = 0;
            for (let j = 0; j < rowsVendidios.length; j++) {
                totalMostar += rowsVendidios[j].montoTotal;
            }
            rowsLocalesComerciante[index].totalMostar = totalMostar;
            totalMostar = 0;
        }
        res.render("administrador/estadisticas/buscarLocales", { nombrePropietario, rowsLocalesComerciante });
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/buscarFechas/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const rowNombreLocal = await pool.query("SELECT nombreLocal, idLocalEnCenabastos FROM localcomercial WHERE pkIdLocalComercial = ?",[id]);
        res.render("administrador/estadisticas/buscarFechas",{id, rowNombreLocal:rowNombreLocal[0]});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/editarInformacionLocal', async (req, res) => {
    try {
        const {idLocal, dateInicio, dateFin} = req.body;
        req.check("dateInicio", "Ingrese Fecha Inicio de Busqueda").notEmpty();
        req.check("passwdateFinord", "Ingrese Fecha Fin de Busqueda").notEmpty();

        const newDateInicio = dateInicio+' 00:00:00';
        const newDateFin = dateFin+' 23:59:59';
        //console.log(newDateInicio);
        var totalMostar = 0;
        const rowsVendidios = await pool.query("SELECT montoTotal FROM venta WHERE fkIdLocalComercial = ? AND fueEntregado = ? AND fueEmpacado = ? AND fueEnviado = ? AND fechaHoraEntrega BETWEEN  ? AND   ? ", [idLocal, 1, 1, 1, newDateInicio, newDateFin]);
        for (let j = 0; j < rowsVendidios.length; j++) {
            totalMostar += rowsVendidios[j].montoTotal;
        }
        res.render("administrador/estadisticas/buscarFechas", {totalMostar});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/buscarTodosLocales', async (req, res) => {
    try {
        totalVendido = 0;
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


module.exports = router;