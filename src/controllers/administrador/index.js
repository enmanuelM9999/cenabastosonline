const express = require('express');
const router = express.Router();
//const { esCliente } = require('../../lib/auth');
const pool = require("../../database");


router.get('/', async (req, res) => {
    try {
        res.render("administrador/index");
    } catch (error) {
        console.log(error);
        res.redirect("administrador/sesion/login");
    }   
});


module.exports = router;