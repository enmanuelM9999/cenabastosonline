const express = require('express');
const router = express.Router();
//const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/buscarPorFechas', async (req, res) => {
    try {
        res.render("administrador/estadisticas/porFechas");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});



module.exports = router;