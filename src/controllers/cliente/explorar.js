const express = require('express');
const router = express.Router();
//const { esComerciante, esComercianteAprobado } = require('../../lib/auth');
const pool = require("../../database");


router.get('/local',  async (req, res) => {
    try {
        res.render("cliente/explorar/local");
    } catch (error) {
        console.log(error);
        
    }
});

router.get('/listadoLocalesMayoristas',  async (req, res) => {
    try {
        //Buscar todos los locales mayoristas
        const rowsLocalesMayoristas = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.esMayorista = 1");
        res.render("cliente/explorar/listadoLocalesMayoristas", {rowsLocalesMayoristas});
    } catch (error) {
        console.log(error);
        
    }
});

router.get('/local/:idLocal',  async (req, res) => {
    try {
        //Buscar todos los locales mayoristas
        const rowsLocalesMayoristas = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.esMayorista = 1");
        res.render("cliente/explorar/listadoLocalesMayoristas", {rowsLocalesMayoristas});
    } catch (error) {
        console.log(error);
        
    }
});

module.exports = router;