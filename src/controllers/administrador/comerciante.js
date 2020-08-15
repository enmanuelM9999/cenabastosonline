const express = require('express');
const router = express.Router();
const { esAdmin } = require('../../lib/auth');
const pool = require("../../database");


router.get('/comercianteListado', esAdmin, async (req, res) => {
    try {
        const rowsListadoComerciantesAprobar = await pool.query("SELECT comerciante.pkIdComerciante, personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, personanatural.numeroDocumento, usuario.correoUsuario FROM comerciante INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = comerciante.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE comerciante.estaAprobado = ?",[0]);
        res.render("administrador/comerciante/listadoAprobar",{rowsListadoComerciantesAprobar});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.get('/aceptarComerciante/:id', esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE comerciante SET estaAprobado = ? WHERE pkIdComerciante = ?", [1,id]);
        res.redirect("/administrador/comerciante/comercianteListado");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.get('/rechazarComerciante/:id', esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const rowDatosComerciante = await pool.query("SELECT personanatural.pkIdPersonaNatural, personanatural.fkIdUsuario FROM comerciante INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = comerciante.fkIdPersonaNatural WHERE comerciante.pkIdComerciante = ?", [id]);
        await pool.query("DELETE FROM comerciante WHERE pkIdComerciante = ?", [id]);
        await pool.query("DELETE FROM personanatural WHERE pkIdPersonanatural = ?", [rowDatosComerciante[0].pkIdPersonaNatural]);
        await pool.query("DELETE FROM usuario WHERE pkIdUsuario = ?", [rowDatosComerciante[0].fkIdUsuario]);
        res.redirect("/administrador/comerciante/comercianteListado");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.get('/buscarLocal', esAdmin, async (req, res) => {
    try {
        res.render("administrador/comerciante/buscarLocales");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});


router.post('/buscarLocal', esAdmin, async (req, res) => {
    try {
        
        const { cedula } = req.body;
        const rowsLocalesComerciante = await pool.query("SELECT personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.idLocalEnCenabastos FROM personanatural INNER JOIN comerciante ON comerciante.fkIdPersonaNatural = personanatural.pkIdPersonaNatural INNER JOIN localcomercial ON localcomercial.fkIdComerciantePropietario = comerciante.pkIdComerciante WHERE personanatural.numeroDocumento = ?",[cedula]);

        var html = '<div class="card "> <div class="table-responsive-lg" style="border-top: 0;"><table class="table b-0"><thead><tr><th scope="col">ID Local Cenabastos</th><th scope="col">Nombre Local</th><th scope="col">Dueño Local</th><th scope="col">Opciones</th></tr></thead><tbody>';

        for (let index = 0; index < rowsLocalesComerciante.length; index++) {
            html += '<tr> <th scope="row">'+  rowsLocalesComerciante[index].idLocalEnCenabastos +'</th>';
            html += '<td>'+  rowsLocalesComerciante[index].nombreLocal +'</td>';
            html += '<td>'+  rowsLocalesComerciante[index].nombresPersonaNatural+' '+rowsLocalesComerciante[index].apellidosPersonaNatural+'</td>';
            html += '<td><a href="/administrador/comerciante/editarInformacionLocal/'+rowsLocalesComerciante[index].pkIdLocalComercial+'" class="btn btn-success p-0 pr-2 pl-2" style="font-size: 20px;" data-toggle="tooltip" title="Ver Local"> <i class="fas fa-eye"></i> </a> </td> </tr>';
        }

        html += '</tbody> </table> </div> </div>';

        res.render("administrador/comerciante/buscarLocales", {html});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.get('/editarInformacionLocal/:id', esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        var rowDatosLocal = await pool.query("SELECT pkIdLocalComercial, nombreLocal, descripcionLocal, precioDomicilio, idLocalEnCenabastos, estaAbierto, esMayorista FROM localcomercial WHERE pkIdLocalComercial = ?",[id]);
       // const rowDatosLocal = await pool.query("SELECT localcomercial.nombreLocal, localcomercial.descripcionLocal, localcomercial.precioDomicilio, localcomercial.idLocalEnCenabastos, localcomercial.estaAbierto, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.pkIdLocalComercial = ?",[id]);
        if(rowDatosLocal[0].esMayorista == 0){
            rowDatosLocal[0].html='<option selected value="0">Minorista</option> <option value="1">Mayorista</option>';
        } else if(rowDatosLocal[0].esMayorista == 1){
            rowDatosLocal[0].html='<option value="0">Minorista</option><option selected value="1">Mayorista</option>';
        }

        if(rowDatosLocal[0].estaAbierto == 0){
            rowDatosLocal[0].htmlEstado='<option selected value="0">Cerrado</option> <option value="1">Abierto</option>';
        } else if(rowDatosLocal[0].estaAbierto == 1){
            rowDatosLocal[0].htmlEstado='<option value="0">Cerrado</option><option selected value="1">Abierto</option>';
        }
        res.render("administrador/comerciante/editarInformacionLocal", {rowDatosLocal:rowDatosLocal[0]});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.post('/editarInformacionLocal', esAdmin, async (req, res) => {
    try {
        const { id, idLocal, nameLocal, descripcion, precioDom, tipoLocal, estadoLocal } = req.body;
        const updateLocal = {
            nombreLocal:nameLocal,
            descripcionLocal:descripcion,
            precioDomicilio:precioDom,
            idLocalEnCenabastos:idLocal,
            estaAbierto: estadoLocal,
            esMayorista: tipoLocal
        };
        await pool.query("UPDATE localcomercial SET ? WHERE pkIdLocalComercial = ?",[updateLocal,id]);

        res.redirect("/administrador/comerciante/buscarLocal");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

module.exports = router;