const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");
const carrito = require("../../lib/carrito.manager");
const notificaciones = require("../../lib/notificaciones.manager");


router.get('/carrito', esCliente, async (req, res) => {
    try {
        const { local, cantItems, rowsItemCarrito, montoTotal } = await carrito.getCarritoCarrito(req.session.idCliente);
        res.render('cliente/pedidos/carrito', { rowsItemCarrito, cantItemsCarrito: cantItems, montoTotal, local });
    } catch (error) {
        console.log(error);
        let arrayError = error.message.toString().split("-");
        let _imp = arrayError[0];
        let _do = arrayError[1];
        let _msg = arrayError[2];
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
        let arrayError = error.message.toString().split("-");
        let _imp = arrayError[0];
        let _do = arrayError[1];
        let _msg = arrayError[2];
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
        let arrayError = error.message.toString().split("-");
        let _imp = arrayError[0];
        let _do = arrayError[1];
        let _msg = arrayError[2];
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
        let arrayError = error.message.toString().split("-");
        if (arrayError.length >= 3) {
            let _imp = arrayError[0];
            let _do = arrayError[1];
            let _msg = arrayError[2];
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
            throw new Error("impUsrI-reLocal-El monto total debe ser mínimo $" + datos.montoPedidoMinimo + " (sin domicilio)");
        }

        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("HH:mm").toString();

        const validacion = await carrito.validarHoraYEstaAbierto(moment, datos.fkIdLocalSeleccionado);

        /*
        if (!validacion) {
            throw new Error("impUsr-doDefault-El local se encuentra cerrado o se encuentra realizando una compra fuera del horario de atencion");
        }
        */
        //datos de pago

        /**AQUI VA EL WOMPI DOMPI***/

        //cargar vista
        res.render('cliente/pedidos/precompra', { datos, items });
    } catch (error) {
        console.log(error);
        let arrayError = error.message.toString().split("-");
        let _imp = arrayError[0];
        let _do = arrayError[1];
        let _msg = arrayError[2];
        if (_imp == "impUsr") {
            req.flash("message", _msg);
        }
        if (_imp == "impUsrI") {
            req.flash("info", _msg);
        }
        if (_do == "reLocal") {
            res.redirect('/cliente/pedidos/carrito');
        }
        res.redirect('/cliente/pedidos/carrito');
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
            throw new Error("impUsrI-doDefault-El monto del pedido debe ser mínimo $" + datos.montoPedidoMinimo + " (sin domicilio)");
        }

        let moment2 = require("moment");
        moment2 = moment2.utc().subtract(4, "hours").format("HH:mm").toString();

        const validacion = await carrito.validarHoraYEstaAbierto(moment2, datos.fkIdLocalSeleccionado);

        /*
        if (!validacion) {
            throw new Error("impUsr-doDefault-El local se encuentra cerrado o se encuentra realizando una compra fuera del horario de atencion");
        }
        */

        //datos de pago

        /**AQUI VA EL WOMPI DOMPI***/
        console.log("los datos ", datos, " y los items ", items);

        //crear venta
        let moment = require("moment");
        let fechaHoraVenta = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const newVenta = {
            fechaHoraVenta,
            fueNoPago: 1,
            fueNuevo: 1,
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
            let detallesComerciante = "" + items[index].detallesProductoLocal + " | " + items[index].detallesPresentacionProducto;
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
        let arrayError = error.message.toString().split("-");
        let _imp = arrayError[0];
        let _do = arrayError[1];
        let _msg = arrayError[2];
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
        let rowsHistorialPedidos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal FROM venta WHERE venta.fkIdCliente = ? ORDER BY venta.pkIdVenta DESC", [idCliente]);
        /* let moment = require("moment");
         moment.locale("es-us");
         rowsHistorialPedidos[0].fechaHoraEntrega = moment(rowsHistorialPedidos[0].fechaHoraEntrega).format("LLLL");*/

        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        res.render("cliente/pedidos/historial", { rowsHistorialPedidos, cantItemsCarrito });
    } catch (error) {
        console.log(error);

    }
});

router.get('/detallesPedido/:idPedido', esCliente, async (req, res) => {
    try {
        let moment = require("moment");
        moment.locale("es-us");
        const { idPedido } = req.params;
        const idCliente = req.session.idCliente;

        //Informacion de la venta
        let rowsItemVenta = await pool.query("SELECT itemventa.nombrePresentacionItemVenta, itemventa.precioUnitarioItem, itemventa.cantidadItem, producto.nombreProducto, imagen.rutaImagen FROM venta INNER JOIN itemventa ON itemventa.fkIdVenta = venta.pkIdVenta INNER JOIN producto ON producto.pkIdProducto = itemventa.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen WHERE itemventa.fkIdVenta = ? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        const tamanioRowsItemVenta = rowsItemVenta.length;

        for (let index = 0; index < tamanioRowsItemVenta; index++) {
            let totalItemVenta = 0;
            totalItemVenta = rowsItemVenta[index].precioUnitarioItem * rowsItemVenta[index].cantidadItem;
            rowsItemVenta[index].totalItemVenta = totalItemVenta;
        }

        //Datos adicionales
        let rowDatos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.precioDomicilioVenta, venta.fechaHoraVenta, venta.telefonoCliente, venta.direccionCliente, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural, usuario.correoUsuario, localcomercial.pkIdLocalComercial, localcomercial.nombreLocal FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personaNatural ON personaNatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personaNatural.fkIdUsuario INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial WHERE venta.pkIdVenta = ? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        rowDatos[0].fechaHoraVenta = moment(rowDatos[0].fechaHoraVenta).format("LLLL");

        //Estado del pedido
        let componentEstado = require("../../lib/estadoPedido.component");
        const htmlEstado = await componentEstado.getHtmlCard(idPedido);

        //Buzon
        let rowsBuzon = await pool.query("SELECT venta.pkIdVenta,buzon.pkIdBuzon,buzon.buzonLeido FROM buzon INNER JOIN venta ON venta.pkIdVenta=buzon.fkIdVenta WHERE buzon.fkIdVenta=? AND venta.fkIdCliente = ?", [idPedido, idCliente]);
        if (rowsBuzon.length == 1) {
            let rowsMensajesBuzon = await pool.query("SELECT mensajebuzon.fechaHoraMensajeBuzon,mensajebuzon.esCliente,mensajebuzon.mensajeBuzon FROM mensajebuzon WHERE fkIdBuzon=?", [rowsBuzon[0].pkIdBuzon]);
            for (let index = 0; index < rowsMensajesBuzon.length; index++) {
                let leftRight = false;
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
        
        

        //Validar si la venta fue entregada para realizar un reclamo

        let htmlCancelado = '';
        

        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        //Renderizar vista
        res.render("cliente/pedidos/detallesPedido", { componentEstado, cantItemsCarrito, rowsItemVenta, rowDatos: rowDatos[0], rowsBuzon, htmlBotonReclamo, htmlCancelado, htmlEstado });
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
        let moment = require("moment");
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
        let codError = error.message.toString().split("-");

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
        const { idVenta } = req.params;

        res.render("cliente/pedidos/nuevoReclamo", { idVenta });
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/pedidos/historial");
    }
});


router.post('/reclamarPedido', esCliente, async (req, res) => {
    try {
        const { idVenta, newReclamo } = req.body;
        const nuevoReclamo = {
            razonReclamo: newReclamo,
            fueReclamado: 1
        };

        const rowFueEntregado = await pool.query("SELECT pkIdVenta FROM venta WHERE fueEmpacado = ? AND fueEnviado = ? AND fueEntregado = ? AND pkIdVenta = ?", [1, 1, 1, idVenta]);

        if (rowFueEntregado.length < 0) {
            req.flash("message", "No puede realizar un reclamo hasta que el pedido haya sido entregado");
            res.redirect("/cliente/pedidos/historial");
        }

        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ?", [nuevoReclamo, idVenta]);

        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();

        const rowDatosAdmin = await pool.query("SELECT usuario.correoUsuario FROM admin INNER JOIN usuario ON usuario.pkIdUsuario = admin.fkIdUsuario WHERE admin.pkIdAdmin = ?", [1]);
        notificaciones.notificarAdmin("Reclamo Nuevo", "Tiene un nuevo reclamo, por favor revisar el apartado de notificaciones", rowDatosAdmin[0].correoUsuario);
        const rowDatosComerciante = await pool.query("SELECT localcomercial.fkIdComerciantePropietario, usuario.correoUsuario FROM venta INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial INNER JOIN comerciante ON comerciante.pkIdComerciante = localcomercial.fkIdComerciantePropietario INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = comerciante.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE venta.pkIdVenta = ?", [idVenta]);
        notificaciones.notificarComerciante(rowDatosComerciante[0].fkIdComerciantePropietario, "Reclamo Nuevo", "Tiene un nuevo reclamo", 97, "comerciante/locales/informacionPedido/" + idVenta, moment, rowDatosComerciante[0].correoUsuario, 1);

        req.flash("success", "Reclamo realizado correctamente");
        res.redirect("/cliente/pedidos/historial");
    } catch (error) {
        console.log(error);
        res.redirect('/cliente/pedidos/historial');
    }
});

module.exports = router;
