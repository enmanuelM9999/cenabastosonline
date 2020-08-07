const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/historial', esCliente, async (req, res) => {
    try {
        //const idCliente = req.session.idCliente;
        const idCliente = 1;
        //Buscar el historial de pedidos de un cliente
        var rowsHistorialPedidos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.fechaHoraEntrega FROM venta WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdCliente = ?", [1, 1, 1, idCliente]);
        var moment = require("moment");
        moment.locale("es-us");
        rowsHistorialPedidos[0].fechaHoraEntrega = moment(rowsHistorialPedidos[0].fechaHoraEntrega).format("LLLL");
        res.render("cliente/pedidos/historial", { rowsHistorialPedidos });
    } catch (error) {
        console.log(error);

    }
});

router.get('/detallesPedido/:idPedido', esCliente, async (req, res) => {
    try {
        var moment = require("moment");
        moment.locale("es-us");
        const { idPedido } = req.params;

        //Informacion de la venta
        var rowsItemVenta = await pool.query("SELECT itemventa.nombrePresentacionItemVenta, itemventa.precioUnitarioItem, itemventa.cantidadItem, producto.nombreProducto, imagen.rutaImagen FROM venta INNER JOIN itemventa ON itemventa.fkIdVenta = venta.pkIdVenta INNER JOIN producto ON producto.pkIdProducto = itemventa.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen WHERE itemventa.fkIdVenta = ?", [idPedido]);
        const tamanioRowsItemVenta = rowsItemVenta.length;

        for (let index = 0; index < tamanioRowsItemVenta; index++) {
            var totalItemVenta = 0;
            totalItemVenta = rowsItemVenta[index].precioUnitarioItem * rowsItemVenta[index].cantidadItem;
            rowsItemVenta[index].totalItemVenta = totalItemVenta;
        }

        //Datos adicionales
        var rowDatos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.precioDomicilioVenta, venta.fechaHoraVenta, venta.telefonoCliente, venta.direccionCliente, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural, usuario.correoUsuario, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personaNatural ON personaNatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personaNatural.fkIdUsuario INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial WHERE venta.pkIdVenta = ?", [idPedido]);
        rowDatos[0].fechaHoraVenta = moment(rowDatos[0].fechaHoraVenta).format("LLLL");

        //Estado del pedido
        var rowEstadoPedido = await pool.query("SELECT venta.fechaHoraVenta, venta.fechaHoraEnvio, venta.fechaHoraEntrega, venta.fechaHoraEmpacado, venta.fueEnviado, venta.fueEntregado, venta.fueEmpacado FROM venta WHERE venta.pkIdVenta = ?", [idPedido]);
        rowEstadoPedido[0].fechaHoraVenta = moment(rowEstadoPedido[0].fechaHoraVenta).format("LLLL");
        rowEstadoPedido[0].fechaHoraEnvio = moment(rowEstadoPedido[0].fechaHoraEnvio).format("LLLL");
        rowEstadoPedido[0].fechaHoraEntrega = moment(rowEstadoPedido[0].fechaHoraEntrega).format("LLLL");
        rowEstadoPedido[0].fechaHoraEmpacado = moment(rowEstadoPedido[0].fechaHoraEmpacado).format("LLLL");

        //Buzon
        var rowsBuzon = await pool.query("SELECT venta.pkIdVenta,buzon.pkIdBuzon,buzon.buzonLeido FROM buzon INNER JOIN venta ON venta.pkIdVenta=buzon.fkIdVenta WHERE buzon.fkIdVenta=?", [idPedido]);
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
        //Renderizar vista
        res.render("cliente/pedidos/detallesPedido", { rowsItemVenta, rowDatos: rowDatos[0], rowEstadoPedido: rowEstadoPedido[0], rowsBuzon });
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/pedidos/historial");
    }
});

router.get('/crearBuzon/:idPedido', esCliente, async (req, res) => {
    try {
        const { idPedido } = req.params;
        const rowsBuzon = await pool.query("SELECT buzon.pkIdBuzon FROM buzon INNER JOIN venta ON venta.pkIdVenta=buzon.fkIdVenta WHERE buzon.fkIdVenta=?", [idPedido]);
        if (rowsBuzon.length != 0) {
            throw "Error, ya existe un buzon para esta venta";
        }
        const newBuzon = {
            buzonLeido: 1,
            fkIdVenta: idPedido
        };
        await pool.query("INSERT INTO buzon SET ?", [newBuzon]);
        res.redirect("/cliente/pedidos/detallesPedido/" + idPedido);
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/pedidos/historial");
    }
});

router.post('/detallesPedido/enviarMensaje', esCliente, async (req, res) => {
    try {
        const { idVenta, idBuzon, mensaje } = req.body;
        console.log("mi mensajito es *" + mensaje.trim() + "*");
        if (mensaje.trim() === "") {
            throw new Error("01-" + idVenta + "-Mensaje en blanco");
        }
        var moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const newMensajeBuzon = {
            mensajeBuzon: mensaje,
            fechaHoraMensajeBuzon: moment,
            esCliente: 1,
            fkIdBuzon: idBuzon
        };
        await pool.query("INSERT INTO mensajebuzon SET ?", [newMensajeBuzon]);
        res.redirect("/cliente/pedidos/detallesPedido/" + idVenta);
    } catch (error) {
        console.log(error);
        var codError = error.message.toString().split("-");

        switch (codError[0]) {
            case "01":
                req.flash("message", "Mensaje en blanco");
                res.redirect("/cliente/pedidos/historial/" + codError[1]);
                break;
            default:
                req.flash("message", "Seleccione un local de nuevo")
                res.redirect("/cliente/pedidos/historial");
                break;
        }
    }
});


module.exports = router;
