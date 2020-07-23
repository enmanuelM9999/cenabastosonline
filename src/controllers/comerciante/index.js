const express = require('express');
const router = express.Router();
const { esComerciante,esComercianteAprobado } = require('../../lib/auth');


router.get('/index', esComercianteAprobado, async (req, res) => {
    res.render('comerciante/index');
});

router.get('/noAprobado',esComerciante, async (req, res) => {
    res.render('comerciante/noAprobado');
});
//aaaaaaaaaaaaaaaaaaaaaaaaaaa
module.exports = router;