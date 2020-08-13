const express = require('express');
const router = express.Router();
//const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/buscarPorFechas', async (req, res) => {
    try {
        res.render("administrador/estadisticas/buscarLocales");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.post('/buscarLocal', async (req, res) => {
    try {
        
        const { cedula } = req.body;
        const rowsLocalesComerciante = await pool.query("SELECT personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.idLocalEnCenabastos FROM personanatural INNER JOIN comerciante ON comerciante.fkIdPersonaNatural = personanatural.pkIdPersonaNatural INNER JOIN localcomercial ON localcomercial.fkIdComerciantePropietario = comerciante.pkIdComerciante WHERE personanatural.numeroDocumento = ?",[cedula]);
        /*
        var html = '<div class="card "> <div class="table-responsive-lg" style="border-top: 0;"><table class="table b-0"><thead><tr><th scope="col">ID Local Cenabastos</th><th scope="col">Nombre Local</th><th scope="col">Dueño Local</th><th scope="col">Opciones</th></tr></thead><tbody>';

        for (let index = 0; index < rowsLocalesComerciante.length; index++) {
            html += '<tr> <th scope="row">'+  rowsLocalesComerciante[index].idLocalEnCenabastos +'</th>';
            html += '<td>'+  rowsLocalesComerciante[index].nombreLocal +'</td>';
            html += '<td>'+  rowsLocalesComerciante[index].nombresPersonaNatural+' '+rowsLocalesComerciante[index].apellidosPersonaNatural+'</td>';
            html += '<td><a href="/administrador/estadisticas/buscarFechas/'+rowsLocalesComerciante[index].pkIdLocalComercial+'" class="btn btn-success p-0 pr-2 pl-2" style="font-size: 20px;" data-toggle="tooltip" title="Ver Local"> <i class="fas fa-search-dollar"></i> </a> </td> </tr>';
        }

        html += '</tbody> </table> </div> </div>';
        */


        var html = '<div class="accordion shadow" id="listadoLocalesAcordion2">';

            html +=     '<div class="card">';
            html +=         '<div class="" id="listadoLocalesCabecera1">';
            html +=             '<h2 class="mb-0">';
            html +=                 '<button class="btn btn-outline-light text-dark text-decoration-none btn-block text-left" type="button" data-toggle="collapse" data-target="#listadoLocalesCollapse1" aria-expanded="true" aria-controls="listadoLocalesCollapse1">';
            html +=                     '<h4> Locales <i class="fas fa-caret-down"></i></h4>';
            html +=                  '</button>';
            html +=              '</h2>';
            html +=          '</div>';

            html +=         '<div id="listadoLocalesCollapse1" class="collapse show" aria-labelledby="listadoLocalesCabecera1" data-parent="#listadoLocalesAcordion1"';
            html +=             '<div class="card-body">';
            html +='';
            html +='';
            html +='';
            html +='';

        res.render("administrador/estadisticas/buscarLocales", {html});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.get('/buscarFechas/:id', async (req, res) => {
    try {
        res.render("administrador/estadisticas/buscarFechas");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

module.exports = router;