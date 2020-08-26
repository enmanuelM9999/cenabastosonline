const express = require('express');
const router = express.Router();
const pool= require("../database");

router.get('/', async (req, res) => {
    try {
        let rowsAdmin= await pool.query("SELECT horaAperturaMayorista,horaCierreMayorista,horaAperturaMinorista,horaCierreMinorista FROM admin");
        let moment=require("moment");
        rowsAdmin[0].horaAperturaMayorista= moment(rowsAdmin[0].horaAperturaMayorista,"HH:mm").format("LT").toString();
        rowsAdmin[0].horaCierreMayorista= moment(rowsAdmin[0].horaCierreMayorista,"HH:mm").format("LT").toString();
        rowsAdmin[0].horaAperturaMinorista= moment(rowsAdmin[0].horaAperturaMinorista,"HH:mm").format("LT").toString();
        rowsAdmin[0].horaCierreMinorista= moment(rowsAdmin[0].horaCierreMinorista,"HH:mm").format("LT").toString();
        res.render('index',{rowsAdmin:rowsAdmin[0]});
    } catch (error) {
        console.log(error);
    }
});

router.get('/enlaces', async (req, res) => {
    res.render('enlaces');
});

module.exports = router;