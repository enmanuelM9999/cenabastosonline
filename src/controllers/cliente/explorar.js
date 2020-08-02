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
        const {idLocal} = req.params;
        //Buscar todos los locales mayoristas
        var rowsLocalesMayoristas = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, localcomercial.estaAbierto, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.pkIdLocalComercial = ?", [idLocal]);
        if(rowsLocalesMayoristas[0].estaAbierto == 1){
            rowsLocalesMayoristas[0].textoEstaAbierto = "Abierto";
        }else{
            rowsLocalesMayoristas[0].textoEstaAbierto = "Cerrado";
        }

        const rowsProductoLocal = await pool.query("SELECT producto.pkIdProducto, producto.nombreProducto, producto.cssPropertiesBg, imagen.rutaImagen FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial = localcomercial.pkIdLocalComercial INNER JOIN producto ON producto.pkIdProducto = productolocal.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN presentacionproducto ON presentacionproducto.fkIdProductoLocal = productolocal.pkIdProductoLocal WHERE localcomercial.pkIdLocalComercial = ?", [idLocal]);
        
        res.render("cliente/explorar/local", {rowsLocalesMayoristas:rowsLocalesMayoristas[0], rowsProductoLocal });
    } catch (error) {
        console.log(error);
        
    }
});

module.exports = router;