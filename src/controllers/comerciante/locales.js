const express = require('express');
const router = express.Router();
const { esComerciante, esComercianteAprobado } = require('../../lib/auth');
const pool = require("../../database");

function localCargado(req) {
    var estaCargado = true;
    if (req.session.idLocalActual == undefined) {
        estaCargado = false;
    }
    return estaCargado;
}

router.get('/local/:id', esComercianteAprobado, async (req, res) => {
    try {
        const { id } = req.params;
        const rowsLocalComercial = await pool.query("SELECT pkIdLocalComercial,nombreLocal FROM localcomercial WHERE pkIdLocalComercial=? AND fkIdComerciantePropietario=?", [id, req.session.idComerciante]);
        if (rowsLocalComercial.length != 1) {
            throw "El local no le pertenece a este propietario"
        }
        req.session.idLocalActual = rowsLocalComercial[0].pkIdLocalComercial;
        req.session.nombreLocalActual = rowsLocalComercial[0].nombreLocal;
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/listadoLocales', esComercianteAprobado, async (req, res) => {
    try {
        //Obtener locales de la base de datos
        var rowsLocales = await pool.query("SELECT pkIdLocalComercial,nombreLocal,esMayorista,precioDomicilio,descripcionLocal,calificacionPromedio,calificacionContadorCliente,idLocalEnCenabastos,totalVendido,parcialVendido,estaAbierto FROM localcomercial WHERE fkIdComerciantePropietario =?", [req.session.idComerciante]);
        //Agregar mensaje de "mayorista" o "minorista" segun el boolean de la base de datos
        const rowsLocalesImprimibles = rowsLocales.map(function (local) {
            const mayomino = local.esMayorista;
            if (mayomino == 0) {
                local.mayoMino = "Minorista";
            } else if (mayomino == 1) {
                local.mayoMino = "Mayorista";
            }
            return local;
        });
        //Enviar el primer local
        const primerLocal = [rowsLocalesImprimibles[0]];
        res.render("comerciante/locales/listadoLocales", { rowsLocalesImprimibles, primerLocal });
    } catch (error) {
        console.log(error);
    }
});

router.get('/listadoLocales/:id', esComercianteAprobado, async (req, res) => {
    try {
        const { id } = req.params;
        //Obtener locales de la base de datos
        var rowsLocales = await pool.query("SELECT pkIdLocalComercial,nombreLocal,esMayorista,precioDomicilio,descripcionLocal,calificacionPromedio,calificacionContadorCliente,idLocalEnCenabastos,totalVendido,parcialVendido,estaAbierto FROM localcomercial WHERE fkIdComerciantePropietario =?", [req.session.idComerciante]);
        //Agregar mensaje de "mayorista" o "minorista" segun el boolean de la base de datos
        const rowsLocalesImprimibles = rowsLocales.map(function (local) {
            const mayomino = local.esMayorista;
            if (mayomino == 0) {
                local.mayoMino = "Minorista";
            } else if (mayomino == 1) {
                local.mayoMino = "Mayorista";
            }
            return local;
        });
        //Enviar el primer local
        var primerLocal = await pool.query("SELECT pkIdLocalComercial,nombreLocal,esMayorista,precioDomicilio,descripcionLocal,calificacionPromedio,calificacionContadorCliente,idLocalEnCenabastos,totalVendido,parcialVendido,estaAbierto FROM localcomercial WHERE pkIdLocalComercial=? AND fkIdComerciantePropietario=?", [id, req.session.idComerciante]);
        var tempLocal = primerLocal[0];
        const mayomino = primerLocal.esMayorista;
        if (mayomino == 0) {
            primerLocal.mayoMino = "Minorista";
        } else if (mayomino == 1) {
            primerLocal.mayoMino = "Mayorista";
        }
        primeroLocal = [tempLocal];
        res.render("comerciante/locales/listadoLocales", { rowsLocalesImprimibles, primerLocal });
    } catch (error) {
        console.log(error);
    }
});

router.get('/crearLocal', esComercianteAprobado, async (req, res) => {
    try {
        const rowsProductos = await pool.query("SELECT pkIdProducto, nombreProducto FROM producto ORDER BY nombreProducto ASC");
        res.render("comerciante/locales/crearLocal", { rowsProductos });
    } catch (error) {
        console.log(error);
    }
});

router.post('/crearLocal', esComercianteAprobado, async (req, res) => {
    try {
        var { name, descripcion, tipoLocal, productos, idlocal, domicilio } = req.body;
        if (!Array.isArray(productos)) {
            productos = [productos];
        }
        //Insertar en la BD una Nueva Persona Juridica
        const resultPersonaJuridica = await pool.query("INSERT INTO personaJuridica VALUES ()");
        const idPersonaJuridica = resultPersonaJuridica.insertId;

        //Crear e Insertar en la BD un Nuevo Local Comercial
        const newLocalComercial = {
            nombreLocal: name,
            precioDomicilio: domicilio,
            descripcionLocal: descripcion,
            fkIdComerciantePropietario: req.session.idComerciante,
            fkIdPersonaJuridica: idPersonaJuridica,
            calificacionPromedio: 0,
            calificacionContadorCliente: 0,
            esMayorista: tipoLocal,
            idLocalEnCenabastos: idlocal,
            totalVendido: 0,
            parcialVendido: 0,
            parcialVendidoAdmin: 0,
            estaAbierto: 1,
            fkIdBanner: 12
        };
        const resultLocalComercial = await pool.query("INSERT INTO localComercial SET ? ", [newLocalComercial]);
        const idLocalComercial = resultLocalComercial.insertId;

        //Algoritmo para Insertar en la BD los productoLocal de un localComercial
        let i = 0;
        while (i < productos.length) {
            await pool.query("INSERT INTO productoLocal (fkIdLocalComercial, fkIdProducto) VALUES (?,?)", [idLocalComercial, productos[i]]);
            i++;
        }
        res.redirect('/comerciante/locales/listadoLocales');
    } catch (error) {
        console.log(error);
        res.redirect('/comerciante/locales/pedidos');
    }
});

// De aquí en adelante es necesario que haya un local cargado en sesión
router.get('/agregarProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const rowsProductos = await pool.query("SELECT pkIdProducto, nombreProducto FROM producto ORDER BY nombreProducto ASC");
        const rowsProductosLocal = await pool.query("SELECT productolocal.fkIdProducto FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial=localcomercial.pkIdLocalComercial WHERE localcomercial.pkIdLocalComercial=? AND localcomercial.fkIdComerciantePropietario=?", [req.session.idLocalActual, req.session.idComerciante]);
        //checked
        const productosImprimibles = rowsProductos.map(function (producto) {
            var esProductoLocal = false;
            producto.checked = "";
            for (let index = 0; index < rowsProductosLocal.length; index++) {
                if (rowsProductosLocal[index].fkIdProducto == producto.pkIdProducto) {
                    esProductoLocal = true;
                    break;
                }
            }
            if (esProductoLocal) {
                producto.checked = "checked";
            }
            return producto;
        });
        res.render("comerciante/locales/agregarProductoLocal", { productosImprimibles });
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.post('/agregarProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        var { productosAAgregar } = req.body;
        if (!Array.isArray(productosAAgregar)) {
            productosAAgregar = [productosAAgregar];
        }
        if (productosAAgregar.length == 0) {
            throw "No se han seleccionado productos";
        }
        console.log(productosAAgregar);
        const rowsProductosLocal = await pool.query("SELECT productolocal.fkIdProducto FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial=localcomercial.pkIdLocalComercial WHERE localcomercial.pkIdLocalComercial=? AND localcomercial.fkIdComerciantePropietario=?", [req.session.idLocalActual, req.session.idComerciante]); let i = 0;
        //filtrar
        const productosAgregables = productosAAgregar.filter(function (productoAAgregar) {
            var esAgregable = true;
            for (let index = 0; index < rowsProductosLocal.length; index++) {
                if (rowsProductosLocal[index].fkIdProducto == productoAAgregar) {
                    esAgregable = false;
                    break;
                }
            }
            return esAgregable;
        });

        var index = 0;
        while (index < productosAgregables.length) {
            await pool.query("INSERT INTO productoLocal (fkIdLocalComercial, fkIdProducto) VALUES (?,?)", [req.session.idLocalActual, productosAgregables[index]]);
            index++;
        }
        res.redirect("/comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidos', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const rowsNuevosPedidos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [0, 0, 0, idLocal]);
        const totalRowsNuevosPedidos = rowsNuevosPedidos.length;

        const rowsPedidosEmpacados = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [0, 0, 1, idLocal]);
        const totalRowsPedidosEmpacados = rowsPedidosEmpacados.length;

        const rowsPedidosEnviados = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [1, 0, 1, idLocal]);
        const totalRowsPedidosEnviados = rowsPedidosEnviados.length;

        const rowsPedidosEntregados = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [1, 1, 1, idLocal]);
        const totalRowsPedidosEntregados = rowsPedidosEntregados.length;

        res.render("comerciante/locales/pedidos", { nombreLocalActual: req.session.nombreLocalActual, rowsNuevosPedidos, totalRowsNuevosPedidos, rowsPedidosEmpacados, totalRowsPedidosEmpacados, rowsPedidosEnviados, totalRowsPedidosEnviados, rowsPedidosEntregados, totalRowsPedidosEntregados });
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedido/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;

        //Informacion de la venta
        var rowsItemVenta = await pool.query("SELECT itemventa.nombrePresentacionItemVenta, itemventa.precioUnitarioItem, itemventa.cantidadItem, producto.nombreProducto, imagen.rutaImagen FROM venta INNER JOIN itemventa ON itemventa.fkIdVenta = venta.pkIdVenta INNER JOIN producto ON producto.pkIdProducto = itemventa.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen WHERE itemventa.fkIdVenta = ? AND venta.fkIdLocalComercial = ?", [idPedido, idLocal]);
        const tamanioRowsItemVenta = rowsItemVenta.length;

        for (let index = 0; index < tamanioRowsItemVenta; index++) {
            var totalItemVenta = 0;
            totalItemVenta = rowsItemVenta[index].precioUnitarioItem * rowsItemVenta[index].cantidadItem;
            rowsItemVenta[index].totalItemVenta = totalItemVenta;
        }

        const rowDatos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.precioDomicilioVenta, venta.fechaHoraVenta, venta.telefonoCliente, venta.direccionCliente, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural, usuario.correoUsuario FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personaNatural ON personaNatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personaNatural.fkIdUsuario WHERE venta.pkIdVenta = ? AND venta.fkIdLocalComercial = ?", [idPedido, idLocal]);

        //Estado del pedido
        var rowEstadoPedido = await pool.query("SELECT venta.fechaHoraVenta, venta.fechaHoraEnvio, venta.fechaHoraEntrega, venta.fechaHoraEmpacado, venta.fueEnviado, venta.fueEntregado, venta.fueEmpacado FROM venta WHERE venta.pkIdVenta = ? AND venta.fkIdLocalComercial = ?", [idPedido, idLocal]);
        if (rowEstadoPedido[0].fueEnviado == 0 && rowEstadoPedido[0].fueEntregado == 0 && rowEstadoPedido[0].fueEmpacado == 0) {
            const htmlBotonMover = '<a href="/comerciante/locales/pedidos/moverAEmpacado/' + idPedido + '" class="btn btn-danger p-0 pr-2 pl-2" style="font-size: 20px;">' +
                '<i class="fas fa-chevron-circle-down" data-toggle="tooltip" title="Mover a Empacados"></i> </a>';
            rowEstadoPedido[0].nuevoEmpacadoHtml = htmlBotonMover;
        } else if (rowEstadoPedido[0].fueEnviado == 0 && rowEstadoPedido[0].fueEntregado == 0 && rowEstadoPedido[0].fueEmpacado == 1) {
            const htmlBotonDevolver = "<a href='/comerciante/locales/pedidos/moverANuevos/" + idPedido + "' class='btn btn-primary p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-up' data-toggle='tooltip' title='Mover a Nuevos'></i></a>";
            rowEstadoPedido[0].devolverNuevoHtml = htmlBotonDevolver;

            const htmlBotonMover = "<a href='/comerciante/locales/pedidos/moverAEnviados/" + idPedido + "' class='btn btn-warning p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-down' data-toggle='tooltip' title='Mover a Enviado'></i></a>";
            rowEstadoPedido[0].nuevoEnviadoHtml = htmlBotonMover;
        } else if (rowEstadoPedido[0].fueEnviado == 1 && rowEstadoPedido[0].fueEntregado == 0 && rowEstadoPedido[0].fueEmpacado == 1) {
            const htmlBotonDevolver = "<a href='/comerciante/locales/pedidos/devolverAEmpacado/" + idPedido + "' class='btn btn-danger p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-up' data-toggle='tooltip' title='Mover a Empacado'></i></a>";
            rowEstadoPedido[0].devolverEmpacadoHtml = htmlBotonDevolver;

            const htmlBotonMover = "<a href='/comerciante/locales/pedidos/moverAEntregado/" + idPedido + "' class='btn btn-success p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-down' data-toggle='tooltip' title='Mover a Recibidos'></i></a>";
            rowEstadoPedido[0].nuevoEntregadoHtml = htmlBotonMover;
        } else if (rowEstadoPedido[0].fueEnviado == 1 && rowEstadoPedido[0].fueEntregado == 1 && rowEstadoPedido[0].fueEmpacado == 1) {
            const htmlBotonDevolver = "<a href='/comerciante/locales/pedidos/devolerAEnviado/" + idPedido + "' class='btn btn-warning p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-up' data-toggle='tooltip' title='Mover a Enviados'></i></a>";
            rowEstadoPedido[0].devolverEnviadoHtml = htmlBotonDevolver;
        }

        //Buzon
        var rowsBuzon = await pool.query("SELECT venta.pkIdVenta,buzon.pkIdBuzon,buzon.buzonLeido FROM buzon INNER JOIN venta ON venta.pkIdVenta=buzon.fkIdVenta WHERE buzon.fkIdVenta=? AND venta.fkIdLocalComercial=? ", [idPedido, idLocal]);
        if (rowsBuzon.length == 1) {
            var rowsMensajesBuzon = await pool.query("SELECT mensajebuzon.fechaHoraMensajeBuzon,mensajebuzon.esCliente,mensajebuzon.mensajeBuzon FROM mensajebuzon WHERE fkIdBuzon=?", [rowsBuzon[0].pkIdBuzon]);
            for (let index = 0; index < rowsMensajesBuzon.length; index++) {
                var leftRight = true;
                if (rowsMensajesBuzon[index].esCliente == 1) {
                    leftRight = false;
                }
                const buzon = require("../../lib/buzon.component");
                const msg = buzon.getMessageBubble(rowsMensajesBuzon[index].mensajeBuzon, rowsMensajesBuzon[index].fechaHoraMensajeBuzon, leftRight);
                rowsMensajesBuzon[index].htmlMsg = msg;
            }
            rowsBuzon[0].mensajes = rowsMensajesBuzon;
        }
        //Renderizar vista
        res.render("comerciante/locales/informacionPedido", { nombreLocalActual: req.session.nombreLocalActual, rowsItemVenta, rowDatos: rowDatos[0], rowEstadoPedido: rowEstadoPedido[0], rowsBuzon });
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidos/crearBuzon/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const { idPedido } = req.params;
        const rowsBuzon = await pool.query("SELECT buzon.pkIdBuzon FROM buzon INNER JOIN venta ON venta.pkIdVenta=buzon.fkIdVenta WHERE buzon.fkIdVenta=? AND venta.fkIdLocalComercial=?", [idPedido, req.session.idLocalActual]);
        if (rowsBuzon.length != 0) {
            throw "Error, ya existe un buzon para esta venta";
        }
        const newBuzon = {
            buzonLeido: 1,
            fkIdVenta: idPedido
        };
        await pool.query("INSERT INTO buzon SET ?", [newBuzon]);
        res.redirect("/comerciante/locales/pedido/" + idPedido);
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.post('/pedidos/enviarMensaje', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw new Error("02-Local no cargado");
        }
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
            esCliente: 0,
            fkIdBuzon: idBuzon
        };
        await pool.query("INSERT INTO mensajebuzon SET ?", [newMensajeBuzon]);
        res.redirect("/comerciante/locales/pedido/" + idVenta);
    } catch (error) {
        console.log(error);
        var codError = error.message.toString().split("-");

        switch (codError[0]) {
            case "01":
                req.flash("message", "Mensaje en blanco");
                res.redirect("/comerciante/locales/pedido/" + codError[1]);
                break;
            case "02":
                req.flash("message", "Seleccione un local de nuevo");
                res.redirect("/comerciante/locales/listadoLocales");
                break;
            default:
                req.flash("message", "Seleccione un local de nuevo")
                res.redirect("/comerciante/locales/listadoLocales");
                break;
        }
    }
});

router.get('/pedidos/moverAEmpacado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEmpacado = {
            fueEmpacado: 1
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEmpacado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidos/moverANuevos/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEmpacado = {
            fueEmpacado: 0
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEmpacado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidos/moverAEnviados/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEnviado = {
            fueEnviado: 1
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEnviado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidos/devolverAEmpacado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEnviado = {
            fueEnviado: 0
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEnviado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidos/moverAEntregado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEntregado = {
            fueEntregado: 1
        };
        await pool.query("UPDATE venta SET  ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEntregado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidos/devolerAEnviado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEntregado = {
            fueEntregado: 0
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEntregado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/buzon', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const buzon = require("../../lib/buzon.component");
        const msg = buzon.getMessageBubble("ole perro hpta, el tomate llegó picho", "2020-07-30 21:14:00", true);
        const msg2 = buzon.getMessageBubble("Y qué quiere que haga", "2020-07-30 21:16:00", false);
        const msg3 = buzon.getMessageBubble("Vieja lerda", "2020-07-30 21:16:10", false);
        const msg4 = buzon.getMessageBubble("hágame la hpta devolución", "2020-07-30 21:20:00", true);
        const msg5 = buzon.getMessageBubble("Esta le voy a devolver", "2020-07-31 13:02:10", false);
        res.render("comerciante/locales/buzon", { nombreLocalActual: req.session.nombreLocalActual, msg, msg2, msg3, msg4, msg5 });
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/ajustes', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const pkIdLocalComercial = req.session.idLocalActual;
        //ajuste de los productos
        var rowsProductosLocal = await pool.query("SELECT productolocal.pkIdProductoLocal, productolocal.detallesProductoLocal, producto.pkIdProducto, producto.nombreProducto, imagen.rutaImagen FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial = localcomercial.pkIdLocalComercial INNER JOIN producto ON producto.pkIdProducto = productolocal.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen WHERE localcomercial.pkIdLocalComercial = ? ORDER BY producto.nombreProducto ASC", [pkIdLocalComercial]);
        for (let index = 0; index < rowsProductosLocal.length; index++) {
            const idProductoLocal = rowsProductosLocal[index].pkIdProductoLocal;
            const rowsPresentaciones = await pool.query("SELECT presentacionproducto.pkIdPresentacionProducto, presentacionproducto.nombrePresentacion, presentacionproducto.precioUnitarioPresentacion, presentacionproducto.detallesPresentacionProducto FROM productolocal INNER JOIN presentacionproducto ON presentacionproducto.fkIdProductoLocal = productoLocal.pkIdProductoLocal WHERE pkIdProductoLocal = ?", [idProductoLocal]);
            rowsProductosLocal[index].presentaciones = rowsPresentaciones;
            rowsProductosLocal[index].cantPresentaciones = rowsPresentaciones.length;

        }
        const cantProductos = rowsProductosLocal.length;

        //ajuste de actualizar datos del local
        const rowsDatosLocal = await pool.query("SELECT idLocalEnCenabastos, nombreLocal, descripcionLocal, precioDomicilio FROM localcomercial WHERE pkIdLocalComercial = ?", [pkIdLocalComercial]);
        res.render("comerciante/locales/ajustes", { nombreLocalActual: req.session.nombreLocalActual, rowsDatosLocal, rowsProductosLocal, cantProductos });
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.post('/actualizarProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const { idProductoLocal, detallesProductoLocal } = req.body;
        console.log("el texto es", detallesProductoLocal," y el id es ", idProductoLocal);

        //Recolectar y actualizar los datos en la BD
        const newProductoLocal = {
            detallesProductoLocal: detallesProductoLocal
        };

        console.log("aqui el producto local", newProductoLocal);
        await pool.query("UPDATE productolocal SET ? WHERE pkIdProductoLocal = ?", [newProductoLocal, idProductoLocal]);

        res.redirect('/comerciante/locales/ajustes');
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.post('/actualizarPresentacionProducto', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const { idPresentacionProducto, nombrePresentacion, precioUnitario, detallesPresentacion } = req.body;

        //Recolectar y actualizar los datos en la BD
        const newPresentacionProducto = {
            nombrePresentacion: nombrePresentacion,
            precioUnitarioPresentacion: precioUnitario,
            detallesPresentacionProducto: detallesPresentacion
        };
        await pool.query("UPDATE presentacionproducto SET ? WHERE pkIdPresentacionProducto = ?", [newPresentacionProducto, idPresentacionProducto]);

        res.redirect('/comerciante/locales/ajustes');
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

//pendiente
router.get('/actualizarProductos', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        res.render("comerciante/locales/actualizarProductos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});


router.get('/local/borrarProducto/:id', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const { id } = req.params;
        await pool.query("DELETE pp FROM presentacionproducto pp INNER JOIN productolocal ON productolocal.pkIdProductoLocal = pp.fkIdProductoLocal INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = productolocal.fkIdLocalComercial WHERE pp.fkIdProductoLocal = ? AND localcomercial.fkIdComerciantePropietario = ?", [id, req.session.idComerciante]);
        await pool.query("DELETE pl FROM productolocal pl INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = pl.fkIdLocalComercial WHERE pl.pkIdProductoLocal = ? AND localcomercial.fkIdComerciantePropietario", [id, req.session.idComerciante]);
        res.redirect("/comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/local/borrarPresentacionProducto/:id', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const { id } = req.params;
        await pool.query("DELETE pp FROM presentacionproducto pp INNER JOIN productolocal ON productolocal.pkIdProductoLocal = pp.fkIdProductoLocal INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = productolocal.fkIdLocalComercial WHERE pp.pkIdPresentacionProducto = ? AND localcomercial.fkIdComerciantePropietario = ?", [id, req.session.idComerciante]);
        res.redirect("/comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.post('/actualizarDatos', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const pkIdLocalComercial = req.session.idLocalActual;
        const { idlocal, name, descripcion, domicilio } = req.body;

        //Recolectar y actualizar los datos en la BD
        const newLocalComercial = {
            nombreLocal: name,
            precioDomicilio: domicilio,
            descripcionLocal: descripcion,
            idLocalEnCenabastos: idlocal
        };
        await pool.query("UPDATE localComercial SET ? WHERE pkIdLocalComercial = ?", [newLocalComercial, pkIdLocalComercial]);
        req.session.nombreLocalActual = newLocalComercial.nombreLocal;
        res.redirect('/comerciante/locales/ajustes');
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/agregarPresentacionProductoLocal/:id', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const { id } = req.params;
        res.render("comerciante/locales/agregarPresentacionProductoLocal", { id });
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.post('/agregarPresentacionProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const { idProductoLocal, nombrePresentacion, precioUnitario, detallesPresentacion } = req.body;
        //Verificar si el id del producto-local es válido
        const rowsProductoLocal = await pool.query("SELECT localcomercial.pkIdLocalComercial FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial=localcomercial.pkIdLocalComercial WHERE localcomercial.fkIdComerciantePropietario=? AND productolocal.pkIdProductoLocal=?", [req.session.idComerciante, idProductoLocal]);
        if (rowsProductoLocal.length != 1) {
            throw "El id del producto-local no es valido";
        }
        //Agregar presentación
        const newPresentacionProductoLocal = {
            nombrePresentacion,
            precioUnitarioPresentacion: precioUnitario,
            fkIdProductoLocal: idProductoLocal,
            detallesPresentacionProducto: detallesPresentacion
        };
        await pool.query("INSERT INTO presentacionproducto SET ?", [newPresentacionProductoLocal]);
        res.redirect("/comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

module.exports = router;

