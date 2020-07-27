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

module.exports = router;