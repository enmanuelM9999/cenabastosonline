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
        var rowsLocalesComerciante = await pool.query("SELECT personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.idLocalEnCenabastos FROM personanatural INNER JOIN comerciante ON comerciante.fkIdPersonaNatural = personanatural.pkIdPersonaNatural INNER JOIN localcomercial ON localcomercial.fkIdComerciantePropietario = comerciante.pkIdComerciante WHERE personanatural.numeroDocumento = ?",[cedula]);
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

        for (let index = 0; index < rowsLocalesComerciante.length; index++) {
            var rowsVendidios = await pool.query("SELECT montoTotal FROM venta WHERE fkIdLocalComercial = ?",[rowsLocalesComerciante[index].pkIdLocalComercial]);
            var totalMostar = 0;
            for (let j = 0; j < rowsVendidios.length; j++) {
                totalMostar += rowsVendidios[j].montoTotal;
            }
            rowsLocalesComerciante[index].totalMostar = totalMostar;
            totalMostar = 0;
        }


        var html = '<h4 class="mt-2">Nombre del Propietario del Local o Locales:  '+rowsLocalesComerciante[0].nombresPersonaNatural+' '+rowsLocalesComerciante[0].apellidosPersonaNatural+'</h2>'; 

            html += '<div class="accordion shadow" id="listadoLocalesAcordion2">';

            for (let index = 0; index < rowsLocalesComerciante.length; index++) {

            html +=     '<div class="card">';
            html +=         '<div class="" id="listadoLocalesCabecera'+rowsLocalesComerciante[index].pkIdLocalComercial+'">';
            html +=             '<h4 class="mb-0">';
            html +=                 '<button class="btn btn-outline-light text-dark text-decoration-none btn-block text-left" type="button" data-toggle="collapse" data-target="#listadoLocalesCollapse'+rowsLocalesComerciante[index].pkIdLocalComercial+'" aria-expanded="false" aria-controls="listadoLocalesCollapse'+rowsLocalesComerciante[index].pkIdLocalComercial+'">';
            html +=                     '<h4><i class="fas fa-caret-down"></i> '+rowsLocalesComerciante[index].idLocalEnCenabastos+' - '+rowsLocalesComerciante[0].nombreLocal+'</h4>';
            html +=                  '</button>';
            html +=              '</h4>';
            html +=          '</div>';

            html +=         '<div id="listadoLocalesCollapse'+rowsLocalesComerciante[index].pkIdLocalComercial+'" class="collapse" aria-labelledby="listadoLocalesCabecera'+rowsLocalesComerciante[index].pkIdLocalComercial+'" data-parent="#listadoLocalesAcordion2"';
            html +=             '<div class="card-body">';
            html +=                 '<a href="/administrador/estadisticas/buscarFechas/'+rowsLocalesComerciante[index].pkIdLocalComercial+'" class="btn btn-success p-0 pr-2 pl-2" style="font-size: 20px;" data-toggle="tooltip" title="Ver Local">Buscar por Fechas <i class="fas fa-search-dollar"></i> </a>';
            html +=                 '<br><label>Total Vendido por el local: $'+rowsLocalesComerciante[index].totalMostar+'</label>';
            html +=             '</div>'
            html +=         '</div>';
            html +=     '</div>';
            
            }

            html += '</div>';
            
            
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