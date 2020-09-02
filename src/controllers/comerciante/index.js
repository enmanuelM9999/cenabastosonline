const express = require('express');
const router = express.Router();
const { esComerciante} = require('../../lib/auth');

router.get('/noAprobado',esComerciante, async (req, res) => {
    res.render('comerciante/noAprobado');
});

module.exports = router;