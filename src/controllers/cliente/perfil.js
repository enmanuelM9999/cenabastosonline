const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/editarPerfil', esCliente, async (req, res) => {
    try {
        //req.session.idCliente
        let rowDatos = await pool.query("SELECT cliente.direccionEsFueraDeCucuta,cliente.direccionCliente, personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, personanatural.telefonoPersonaNatural FROM cliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE cliente.pkIdCliente = ?",[req.session.idCliente]);
        let htmlOptions='';
        if (rowDatos[0].direccionEsFueraDeCucuta==0) {
            htmlOptions='<option value="0" selected >No</option><option value="1">Sí</option>';
        }
        else{
            htmlOptions='<option value="0">No</option><option value="1" selected>Sí</option>';
        }
        rowDatos[0].htmlOptions=htmlOptions;
        res.render("cliente/perfil/actualizarPerfil", {rowDatos:rowDatos[0]});
        
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/explorar/listadoLocalesMayoristas");
    }
});

router.post('/editarPerfil', esCliente, async (req, res) => {
    try {
        const {name, lastName, phone, direccion, direccionLejos} = req.body;

        const editPersonaNatural = {
            nombresPersonaNatural: name,
            apellidosPersonaNatural: lastName,
            telefonoPersonaNatural: phone
        }
        await pool.query("UPDATE personanatural SET ? WHERE pkIdPersonaNatural = ?",[editPersonaNatural, req.session.idPersonaNatural]);

        const editCliente = {
            direccionCliente: direccion,
            direccionEsFueraDeCucuta:direccionLejos
        }
        await pool.query("UPDATE cliente SET ? WHERE pkIdCliente = ?",[editCliente, req.session.idCliente]);

        res.redirect("/cliente/perfil/editarPerfil");
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/explorar/listadoLocalesMayoristas");
    }
});

router.post('/editarClave', esCliente, async (req, res) => {
    try {
        const {lastP, newP} = req.body;

        const rowContraseña = await pool.query("SELECT CAST(aes_decrypt(claveUsuario," + lastP + ")AS CHAR(200))claveUsuario FROM usuario WHERE pkIdUsuario = ?",[req.session.idUser]);

        if (rowContraseña[0].claveUsuario == lastP) {
            await pool.query('UPDATE usuario SET claveUsuario = (aes_encrypt("' +newP +'","' +newP +'")) WHERE pkIdUsuario = ?',[req.session.idUser]);
        }

        res.redirect("/cliente/perfil/editarPerfil");
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/explorar/listadoLocalesMayoristas");
    }
});

module.exports = router;
