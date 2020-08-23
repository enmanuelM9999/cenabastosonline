const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");
const carrito = require("../../lib/carrito.manager");


router.get('/carrito', esCliente, async (req, res) => {
    try {
        const { local, cantItems, rowsItemCarrito, montoTotal } = await carrito.getCarritoCarrito(req.session.idCliente);
        res.render('cliente/pedidos/carrito', { rowsItemCarrito, cantItemsCarrito: cantItems, montoTotal, local });
    } catch (error) {
        console.log(error);
        var arrayError = error.message.toString().split("-");
        var _imp = arrayError[0];
        var _do = arrayError[1];
        var _msg = arrayError[2];
        if (_imp == "impUsr") {
            req.flash("message", _msg);
        }
        if (_do == "reForm") {

        }
        if (_do == "doDefault") {

        }
        res.redirect('/cliente/pedidos/carrito');
    }
});

router.post('/agregarAlCarrito', esCliente, async (req, res) => {
    try {
        const { idLocal, idPresentacion, cantidadItem, detallesCliente } = req.body;
        const resultAdd = await carrito.agregarItemCarrito(req.session.idCliente, idLocal, idPresentacion, detallesCliente, cantidadItem);
        if (resultAdd.error) {
            req.flash("info", resultAdd._msg);
        }
        res.redirect("/cliente/pedidos/carrito");
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/explorar/listadoLocalesMinoristas");
    }
});

router.get('/carrito/borrarItemCarrito/:idItem', esCliente, async (req, res) => {
    try {
        const { idItem } = req.params;
        carrito.borrarItemCarrito(req.session.idCliente, idItem, req, res);
        res.redirect("/cliente/pedidos/carrito");
    } catch (error) {
        console.log(error);
        var arrayError = error.message.toString().split("-");
        var _imp = arrayError[0];
        var _do = arrayError[1];
        var _msg = arrayError[2];
        if (_imp == "impUsr") {
            req.flash("message", _msg);
        }
        if (_do == "reForm") {
            res.redirect('/comerciante/locales/crearLocal');
        }
        if (_do == "doDefault") {
            res.redirect('/comerciante/locales/listadoLocales');
        }
    }
});

router.get('/carrito/vaciarCarrito', esCliente, async (req, res) => {
    try {
        carrito.vaciarCarrito(req.session.idCliente);
        res.redirect("/cliente/pedidos/carrito");
    } catch (error) {
        console.log(error);
        var arrayError = error.message.toString().split("-");
        var _imp = arrayError[0];
        var _do = arrayError[1];
        var _msg = arrayError[2];
        if (_imp == "impUsr") {
            req.flash("message", _msg);
        }
        if (_do == "doDefault") {
            res.redirect('/comerciante/locales/listadoLocales');
        }
    }
});

router.post('/carrito/actualizarItemCarrito/', esCliente, async (req, res) => {
    try {
        const { item, cant, detalles } = req.body;
        carrito.editarItemCarrito(req.session.idCliente, item, detalles, cant);
        req.flash("success", "Actualizado");
        res.redirect("/cliente/pedidos/carrito");
    } catch (error) {
        console.log(error);
        var arrayError = error.message.toString().split("-");
        if (arrayError.length >= 3) {
            var _imp = arrayError[0];
            var _do = arrayError[1];
            var _msg = arrayError[2];
            if (_imp == "impUsr") {
                req.flash("message", _msg);
            }
            if (_do == "reForm") {
                res.redirect('/comerciante/locales/crearLocal');
            }
            if (_do == "doDefault") {
                res.redirect('/comerciante/locales/listadoLocales');
            }
        }
        res.redirect('/comerciante/locales/listadoLocales');
    }
});

router.get('/precomprar', esCliente, async (req, res) => {
    try {
        //dónde y quién recibe, del carrito viene el listado de los productos, el monto total, el id del local comercial
        let { datos, items } = await carrito.getCarritoPrecompra(req.session.idCliente);
        datos = datos[0];
        if (datos.subtotal < datos.montoPedidoMinimo) {
            throw new Error("impUsrI-reLocal-El monto total debe ser mínimo $" + datos.montoPedidoMinimo+" (sin domicilio)");
        }

        //datos de pago

        /**AQUI VA EL WOMPI DOMPI***/

        //cargar vista
        res.render('cliente/pedidos/precompra', { datos, items });
    } catch (error) {
        console.log(error);
        var arrayError = error.message.toString().split("-");
        var _imp = arrayError[0];
        var _do = arrayError[1];
        var _msg = arrayError[2];
        if (_imp == "impUsr") {
            req.flash("message", _msg);
        }
        if (_imp == "impUsrI") {
            req.flash("info", _msg);
        }
        if (_do == "reLocal") {
            res.redirect('/cliente/pedidos/carrito');
        }
        if (_do == "doDefault") {
            res.redirect('/cliente/explorar/listadoLocalesMinoristas');
        }
        res.redirect('/cliente/explorar/listadoLocalesMinoristas');
    }
});

router.post('/comprar', esCliente, async (req, res) => {
    try {
        //dónde y quién recibe, del carrito viene el listado de los productos, el monto total, el id del local comercial
        let { datos, items } = await carrito.getCarritoCompra(req.session.idCliente);
        if (items.length <= 0) {
            throw new Error("impUsr-hacker-El tesoro que buscas demanda esfuerzos mayores");
        }
        datos = datos[0];
        if (datos.subtotal < datos.montoPedidoMinimo) {
            throw new Error("impUsrI-doDefault-El monto del pedido debe ser mínimo $" + datos.montoPedidoMinimo+" (sin domicilio)");
        }
        //datos de pago

        /**AQUI VA EL WOMPI DOMPI***/
        console.log("los datos ", datos, " y los items ", items);

        //crear venta
        let moment = require("moment");
        let fechaHoraVenta = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const newVenta = {
            fechaHoraVenta,
            fueEmpacado: 0,
            fueEnviado: 0,
            fueEntregado: 0,
            fueCancelado: 0,
            fueReclamado: 0,
            precioDomicilioVenta: datos.precioDomicilio,
            direccionCliente: datos.direccionCliente,
            telefonoCliente: datos.telefonoPersonaNatural,
            numeroDocumentoCliente: datos.numeroDocumento,
            montoTotal: datos.total,
            fkIdLocalComercial: datos.fkIdLocalSeleccionado,
            fkIdCliente: req.session.idCliente
        };
        const resultInsert = await pool.query("INSERT INTO venta SET ?", [newVenta]);
        //crear items-venta
        for (let index = 0; index < items.length; index++) {
            const nombrePresentacionItemVenta = "" + items[index].nombrePresentacion;
            var detallesComerciante = "" + items[index].detallesProductoLocal + " | " + items[index].detallesPresentacionProducto;
            if (items[index].detallesProductoLocal == "" && items[index].detallesPresentacionProducto == "") {
                detallesComerciante = "";
            }
            const newItemVenta = {
                nombrePresentacionItemVenta,
                cantidadItem: items[index].cantidadItem,
                precioUnitarioItem: items[index].precioUnitarioPresentacion,
                detallesCliente: items[index].detallesCarrito,
                detallesComerciante,
                fkIdProducto: items[index].pkIdProducto,
                fkIdVenta: resultInsert.insertId
            };
            await pool.query("INSERT INTO itemventa SET ?", [newItemVenta]);
            carrito.vaciarCarrito(req.session.idCliente);
        }
        //cargar vista
        req.flash("success", "Pedido hecho con éxito");
        res.redirect('/cliente/pedidos/historial');
    } catch (error) {
        console.log(error);
        var arrayError = error.message.toString().split("-");
        var _imp = arrayError[0];
        var _do = arrayError[1];
        var _msg = arrayError[2];
        if (_imp == "impUsr") {
            req.flash("message", _msg);
        }
        if (_imp == "impUsrI") {
            req.flash("info", _msg);
        }
        if (_do == "reForm") {
            res.redirect('/cliente/explorar/listadoLocalesMinoristas');
        }
        if (_do == "doDefault") {
            res.redirect('/cliente/explorar/listadoLocalesMinoristas');
        }
        res.redirect('/cliente/explorar/listadoLocalesMinoristas');
    }
});


router.get('/historial', esCliente, async (req, res) => {
    try {
        const idCliente = req.session.idCliente;
        //Buscar el historial de pedidos de un cliente
        var rowsHistorialPedidos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.fueEnviado, venta.fueEntregado, venta.fueEmpacado FROM venta WHERE venta.fkIdCliente = ? ORDER BY venta.pkIdVenta DESC", [idCliente]);
        /* var moment = require("moment");
         moment.locale("es-us");
         rowsHistorialPedidos[0].fechaHoraEntrega = moment(rowsHistorialPedidos[0].fechaHoraEntrega).format("LLLL");*/

        for (let index = 0; index < rowsHistorialPedidos.length; index++) {
            if (rowsHistorialPedidos[index].fueEnviado == 0 && rowsHistorialPedidos[index].fueEntregado == 0 && rowsHistorialPedidos[index].fueEmpacado == 0) {
                rowsHistorialPedidos[index].estado = "Nuevo";
            } else if (rowsHistorialPedidos[index].fueEnviado == 0 && rowsHistorialPedidos[index].fueEntregado == 0 && rowsHistorialPedidos[index].fueEmpacado == 1) {
                rowsHistorialPedidos[index].estado = "Empacado";
            } else if (rowsHistorialPedidos[index].fueEnviado == 1 && rowsHistorialPedidos[index].fueEntregado == 0 && rowsHistorialPedidos[index].fueEmpacado == 1) {
                rowsHistorialPedidos[index].estado = "Enviado";
            } else if (rowsHistorialPedidos[index].fueEnviado == 1 && rowsHistorialPedidos[index].fueEntregado == 1 && rowsHistorialPedidos[index].fueEmpacado == 1) {
                rowsHistorialPedidos[index].estado = "Entregado";
            }

        }
        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        res.render("cliente/pedidos/historial", { rowsHistorialPedidos, cantItemsCarrito });
    } catch (error) {
        console.log(error);

    }
});

router.get('/detallesPedido/:idPedido', esCliente, async (req, res) => {
    try {
        var moment = require("moment");
        moment.locale("es-us");
        const { idPedido } = req.params;
        const idCliente = req.session.idCliente;

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
        var rowEstadoPedido = await pool.query("SELECT venta.fechaHoraVenta, venta.fechaHoraEnvio, venta.fechaHoraEntrega, venta.fechaHoraEmpacado, venta.fueEnviado, venta.fueEntregado, venta.fueEmpacado FROM venta WHERE venta.pkIdVenta = ? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        rowEstadoPedido[0].fechaHoraVenta = moment(rowEstadoPedido[0].fechaHoraVenta).format("LLLL");
        rowEstadoPedido[0].fechaHoraEnvio = moment(rowEstadoPedido[0].fechaHoraEnvio).format("LLLL");
        rowEstadoPedido[0].fechaHoraEntrega = moment(rowEstadoPedido[0].fechaHoraEntrega).format("LLLL");
        rowEstadoPedido[0].fechaHoraEmpacado = moment(rowEstadoPedido[0].fechaHoraEmpacado).format("LLLL");

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

        
        let htmlBotonReclamo = '';
        const rowFueEntregado = await pool.query("SELECT pkIdVenta, razonReclamo FROM venta WHERE fueEmpacado = ? AND fueEnviado = ? AND fueEntregado = ? AND pkIdVenta = ?",[1, 1, 1, idPedido]);

        if (rowFueEntregado.length < 1) {
            htmlBotonReclamo = '<a href="/cliente/pedidos/reclamar/'+idPedido+'" class="btn btn-success mt-2"><i class="fas fa-shopping-bag"></i> Reclamar</a>';
        } else {
            htmlBotonReclamo = '<div class="card mt-3 p-3"><div class="form-group"><label for="newReclamo">Razon Reclamo</label><textarea disabled name="newReclamo" id="newReclamo" class="form-control" form="form" cols="1">'+rowFueEntregado[0].razonReclamo+'</textarea></div></div>';
        }


        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        //Renderizar vista
        res.render("cliente/pedidos/detallesPedido", { cantItemsCarrito, rowsItemVenta, rowDatos: rowDatos[0], rowEstadoPedido: rowEstadoPedido[0], rowsBuzon, htmlBotonReclamo });
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

router.get('/msgCarritoLocalesDiferentes', esCliente, async (req, res) => {
    try {
        res.render("cliente/pedidos/msgCarritoLocalesDiferentes");
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/pedidos/historial");
    }
});

router.get('/reclamar/:idVenta', esCliente, async (req, res) => {
    try {
        const {idVenta} = req.params;

        res.render("cliente/pedidos/nuevoReclamo",{idVenta});
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/pedidos/historial");
    }
});


router.post('/reclamarPedido', esCliente, async (req, res) => {
    try {
        const { idVenta, newReclamo } = req.body;
        const nuevoReclamo = {
            razonReclamo : newReclamo,
            fueReclamado : 1
        };

        const rowFueEntregado = await pool.query("SELECT pkIdVenta FROM venta WHERE fueEmpacado = ? AND fueEnviado = ? AND fueEntregado = ? AND pkIdVenta = ?",[1, 1, 1, idVenta]);

        if (rowFueEntregado.length < 0) {
            req.flash("message", "No puede realizar un reclamo hasta que el pedido haya sido entregado");
            res.redirect("/cliente/pedidos/historial");
        }

        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ?",[nuevoReclamo, idVenta]);
        req.flash("success", "Reclamo realizado correctamente");
        res.redirect("/cliente/pedidos/historial");
    } catch (error) {
        console.log(error);
        res.redirect('/cliente/pedidos/historial');
    }
});

module.exports = router;
