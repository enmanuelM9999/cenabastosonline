const express = require('express');
const router = express.Router();
const { esAdmin } = require('../../lib/auth');
const pool = require("../../database");
const notificacionesManager = require('../../lib/notificaciones.manager');
const {defaultNotificationsImage}=require("../../environmentVars");

router.get('/listaReclamos', esAdmin, async (req, res) => {
    try {
        //@here usar los nuevos estados
        const rowsListaReclamos = await pool.query("SELECT venta.pkIdVenta, personanatural.nombresPersonaNatural, personanatural.apellidosPersonaNatural, localcomercial.nombreLocal FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial WHERE venta.fueEmpacado = ? AND venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueReclamado = ? AND venta.fueCancelado = 0 ORDER BY venta.pkIdVenta DESC",[1,1,1,1,0]);
        res.render("administrador/reclamos/listaReclamos",{rowsListaReclamos});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }   
});

router.get('/detallesPedido/:idPedido', esAdmin, async (req, res) => {
    try {
        var moment = require("moment");
        moment.locale("es-us");
        const { idPedido } = req.params;

        const rowDato = await pool.query("SELECT fkIdCliente FROM venta WHERE pkIdVenta = ?", [idPedido]);
        const idCliente  = rowDato[0].fkIdCliente;
        
        //Informacion de la venta
        var rowsItemVenta = await pool.query("SELECT itemventa.nombrePresentacionItemVenta, itemventa.precioUnitarioItem, itemventa.cantidadItem, producto.nombreProducto, imagen.rutaImagen FROM venta INNER JOIN itemventa ON itemventa.fkIdVenta = venta.pkIdVenta INNER JOIN producto ON producto.pkIdProducto = itemventa.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen WHERE itemventa.fkIdVenta = ? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        const tamanioRowsItemVenta = rowsItemVenta.length;

        for (let index = 0; index < tamanioRowsItemVenta; index++) {
            var totalItemVenta = 0;
            totalItemVenta = rowsItemVenta[index].precioUnitarioItem * rowsItemVenta[index].cantidadItem;
            rowsItemVenta[index].totalItemVenta = totalItemVenta;
        }

        //Datos adicionales
        var rowDatos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.precioDomicilioVenta, venta.fechaHoraVenta, venta.telefonoCliente, venta.direccionCliente, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural, usuario.correoUsuario, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personaNatural ON personaNatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personaNatural.fkIdUsuario INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial WHERE venta.pkIdVenta = ? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        rowDatos[0].fechaHoraVenta = moment(rowDatos[0].fechaHoraVenta).format("LLLL");


        

        //Estado del pedido
        let componentEstado = require("../../lib/estadoPedido.component");
        const htmlEstado = await componentEstado.getHtmlCard(idPedido);

        /*var rowEstadoPedido = await pool.query("SELECT venta.fechaHoraVenta, venta.fechaHoraEnvio, venta.fechaHoraEntrega, venta.fechaHoraEmpacado, venta.fueEnviado, venta.fueEntregado, venta.fueEmpacado FROM venta WHERE venta.pkIdVenta = ? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        rowEstadoPedido[0].fechaHoraVenta = moment(rowEstadoPedido[0].fechaHoraVenta).format("LLLL");
        rowEstadoPedido[0].fechaHoraEnvio = moment(rowEstadoPedido[0].fechaHoraEnvio).format("LLLL");
        rowEstadoPedido[0].fechaHoraEntrega = moment(rowEstadoPedido[0].fechaHoraEntrega).format("LLLL");
        rowEstadoPedido[0].fechaHoraEmpacado = moment(rowEstadoPedido[0].fechaHoraEmpacado).format("LLLL");*/

        //Buzon
        var rowsBuzon = await pool.query("SELECT venta.pkIdVenta,buzon.pkIdBuzon,buzon.buzonLeido FROM buzon INNER JOIN venta ON venta.pkIdVenta=buzon.fkIdVenta WHERE buzon.fkIdVenta=? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        if (rowsBuzon.length == 1) {
            var rowsMensajesBuzon = await pool.query("SELECT mensajebuzon.fechaHoraMensajeBuzon,mensajebuzon.esCliente,mensajebuzon.mensajeBuzon FROM mensajebuzon WHERE fkIdBuzon=?", [rowsBuzon[0].pkIdBuzon]);
            for (let index = 0; index < rowsMensajesBuzon.length; index++) {
                var leftRight = false;
                if (rowsMensajesBuzon[index].esCliente == 1) {
                    leftRight = true;
                }
                const buzon = require("../../lib/buzon.component");
                const msg = buzon.getMessageBubble(rowsMensajesBuzon[index].mensajeBuzon, rowsMensajesBuzon[index].fechaHoraMensajeBuzon, leftRight);
                rowsMensajesBuzon[index].htmlMsg = msg;
            }
            rowsBuzon[0].mensajes = rowsMensajesBuzon;
        }

        //Validar si la venta fue entregada para realizar un reclamo

        
    //    let htmlBotonReclamo = '';
        const rowFueEntregado = await pool.query("SELECT pkIdVenta, razonReclamo FROM venta WHERE fueEmpacado = ? AND fueEnviado = ? AND fueEntregado = ? AND pkIdVenta = ?",[1, 1, 1, idPedido]);

    /*    if (rowFueEntregado.length > 0) {
            htmlBotonReclamo = '<div class="card mt-3 p-3"><div class="form-group"><label for="newReclamo">Razon Reclamo</label><textarea disabled name="newReclamo" id="newReclamo" class="form-control" form="form" cols="1">'+rowFueEntregado[0].razonReclamo+'</textarea></div></div>';
        }*/

        //Renderizar vista
        res.render("administrador/reclamos/detallesPedido", {rowsItemVenta, rowDatos: rowDatos[0], rowsBuzon, rowFueEntregado, htmlEstado });
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});


router.get('/cancelarPedido/:idVenta', esAdmin, async (req, res) => {
    try {
        const {idVenta} = req.params;

        res.render("administrador/reclamos/nuevoCancelado",{idVenta});
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});


router.post('/cancelarPedido', esAdmin, async (req, res) => {
    try {
        const { idVenta, newCancelado } = req.body

        const updateEstado = {
            fueCancelado : 1,
            razonCancelado : newCancelado
        };
        
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ?", [updateEstado, idVenta]);

        //Enviar Notificacion de cancelado a cliente y comerciante

        var moment = require("moment");
        moment = moment.utc().subtract(5, "hours").format("YYYY-MM-DD HH:mm:ss").toString();

        const rowDatosCliente = await pool.query("SELECT venta.fkIdCliente, usuario.correoUsuario FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE venta.pkIdVenta = ?",[idVenta]);
        notificacionesManager.notificarCliente(rowDatosCliente[0].fkIdCliente,"Cancelacion Nueva","Tiene una cancelacion nueva, por favor revisar el apartado de notificaciones", defaultNotificationsImage, "cliente/pedidos/detallesPedido/"+idVenta, moment, rowDatosCliente[0].correoUsuario);

        const rowDatosComerciante = await pool.query("SELECT localcomercial.fkIdComerciantePropietario, usuario.correoUsuario FROM venta INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial INNER JOIN comerciante ON comerciante.pkIdComerciante = localcomercial.fkIdComerciantePropietario INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = comerciante.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE venta.pkIdVenta = ?",[idVenta]);
        notificacionesManager.notificarComerciante(rowDatosComerciante[0].fkIdComerciantePropietario,"Cancelacion Nueva","Tiene una cancelacion nueva, por favor revisar el apartado de notificaciones", defaultNotificationsImage, "comerciante/locales/pedido/"+idVenta, moment, rowDatosComerciante[0].correoUsuario, 1);


        //Espacio publicitario para devolver el dinero



        //Renderizar vista
        res.redirect("/administrador/reclamos/listaReclamos");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/rechazarReclamo/:idVenta', esAdmin, async (req, res) => {
    try {
        const {idVenta} = req.params;

        //Actualizar estado reclamo
        const rechazarReclamo = {
            fueReclamado : 0
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ?", [rechazarReclamo, idVenta]);

        //Enviar Notificacion
        var moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();

        const rowDatosCliente = await pool.query("SELECT venta.fkIdCliente, usuario.correoUsuario FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE venta.pkIdVenta = ?",[idVenta]);
        notificacionesManager.notificarCliente(rowDatosCliente[0].fkIdCliente,"Reclamo Rechazado","Tiene un reclamo rechazado, por favor revisar el apartado de notificaciones", 97, "cliente/pedidos/detallesPedido/"+idVenta, moment, rowDatosCliente[0].correoUsuario);

        const rowDatosComerciante = await pool.query("SELECT localcomercial.fkIdComerciantePropietario, usuario.correoUsuario FROM venta INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial INNER JOIN comerciante ON comerciante.pkIdComerciante = localcomercial.fkIdComerciantePropietario INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = comerciante.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE venta.pkIdVenta = ?",[idVenta]);
        notificacionesManager.notificarComerciante(rowDatosComerciante[0].fkIdComerciantePropietario,"Reclamo Rechazado","Tiene un reclamo rechazado, por favor revisar el apartado de notificaciones", 97, "comerciante/locales/pedido/"+idVenta, moment, rowDatosComerciante[0].correoUsuario, 1);

        res.redirect("/administrador/reclamos/listaReclamos");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

module.exports = router;