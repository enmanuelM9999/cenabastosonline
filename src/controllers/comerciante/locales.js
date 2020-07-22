const express = require('express');
const router = express.Router();
const { esComerciante,esComercianteAprobado } = require('../../lib/auth');
const pool = require("../../database");


router.get('/crearLocal', esComercianteAprobado, async (req, res) => {
    const rowsProductos= await pool.query("SELECT pkIdProducto, nombreProducto FROM producto ORDER BY nombreProducto ASC");
    req.render("comerciante/locales/crearLocal",{rowsProductos});
});

router.post('/crearLocal', esComercianteAprobado, async (req, res) => {
   const {name,descripcion,tipoLocal,productos}=req.body;
    console.log(req.body);

    const resultPersonaJuridica = await pool.query("INSERT INTO personaJuridica VALUES ()");
    const idPersonaJuridica = resultPersonaJuridica.insertId;

    let newLocalComercial = {

    };
    res.redirect('/comerciante/index');
});



module.exports = router;

