const express = require('express');
const router = express.Router();
const { esComerciante,esComercianteAprobado } = require('../../lib/auth');


router.post('/crearLocal', esComercianteAprobado, async (req, res) => {
    console.log(req.body);
    res.redirect('/comerciante/index');
});



module.exports = router;