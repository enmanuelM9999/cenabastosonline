const express = require('express');
const router = express.Router();
const { esComerciante, esComercianteAprobado } = require('../../lib/auth');
const pool = require("../../database");

function localCargado(req) {
    let estaCargado = true;
    if (req.session.idLocalActual == undefined) {
        estaCargado = false;
    }
    return estaCargado;
}

async function  actualizarTagsLocal  (idLocal) {
    let categorias = [];
    const rowsProductos = await pool.query("SELECT producto.fkIdCategoriaProducto FROM productolocal INNER JOIN producto ON producto.pkIdProducto=productolocal.fkIdProducto WHERE productolocal.fkIdLocalComercial=?", [idLocal]);
    for (let index = 0; index < rowsProductos.length; index++) {
        if (!existeCategoria(categorias, rowsProductos[index].fkIdCategoriaProducto)) {
            categorias.push("" + rowsProductos[index].fkIdCategoriaProducto);
        }

    }
    let stringCategorias = "";
    for (let index = 0; index < categorias.length; index++) {
        stringCategorias += categorias[index];
        if ((index + 1) < (categorias.length)) {
            stringCategorias += "-";
        }
    }
    const newLocal={tagsCategorias:stringCategorias};
    await pool.query("UPDATE localcomercial SET ? WHERE pkIdLocalComercial=?",[newLocal,idLocal]);
}

function existeCategoria(arrayCategorias, idCategoria) {
    let existe = false;
    for (let index = 0; index < arrayCategorias.length; index++) {
        if (arrayCategorias[index].id == idCategoria) {
            existe = true;
            break;
        }
    }
    return existe;
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
        let rowsLocales = await pool.query("SELECT localcomercial.pkIdLocalComercial,localcomercial.nombreLocal,localcomercial.esMayorista,localcomercial.precioDomicilio,localcomercial.descripcionLocal,localcomercial.calificacionPromedio,localcomercial.calificacionContadorCliente,localcomercial.idLocalEnCenabastos,localcomercial.totalVendido,localcomercial.estaAbierto,imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON localcomercial.fkIdBanner=imagen.pkIdImagen WHERE localcomercial.fkIdComerciantePropietario =?", [req.session.idComerciante]);
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
        let rowsLocales = await pool.query("SELECT localcomercial.pkIdLocalComercial,localcomercial.nombreLocal,localcomercial.esMayorista,localcomercial.precioDomicilio,localcomercial.descripcionLocal,localcomercial.calificacionPromedio,localcomercial.calificacionContadorCliente,localcomercial.idLocalEnCenabastos,localcomercial.totalVendido,localcomercial.estaAbierto, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON localcomercial.fkIdBanner=imagen.pkIdImagen WHERE fkIdComerciantePropietario =?", [req.session.idComerciante]);
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
        let primerLocal = await pool.query("SELECT localcomercial.pkIdLocalComercial,localcomercial.nombreLocal,localcomercial.esMayorista,localcomercial.precioDomicilio,localcomercial.descripcionLocal,localcomercial.calificacionPromedio,localcomercial.calificacionContadorCliente,localcomercial.idLocalEnCenabastos,localcomercial.totalVendido,localcomercial.estaAbierto, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON localcomercial.fkIdBanner=imagen.pkIdImagen WHERE pkIdLocalComercial=? AND fkIdComerciantePropietario=?", [id, req.session.idComerciante]);
        let tempLocal = primerLocal[0];
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
        const rowsProductos = await pool.query("SELECT producto.pkIdProducto, producto.nombreProducto, imagen.rutaImagen FROM producto  INNER JOIN imagen ON producto.fkIdImagen=imagen.pkIdImagen ORDER BY nombreProducto ASC");
        let rowHorasLocales = await pool.query("SELECT horaAperturaMayorista, horaAperturaMinorista, horaCierreMayorista, horaCierreMinorista FROM admin WHERE pkIdAdmin = ?", [1]);

        let moment = require("moment");
        let tempHora = moment(rowHorasLocales[0].horaAperturaMayorista, "HH:mm").format("LT").toString();
        rowHorasLocales[0].horaAperturaMayorista = tempHora;

        tempHora = moment(rowHorasLocales[0].horaAperturaMinorista, "HH:mm").format("LT").toString();
        rowHorasLocales[0].horaAperturaMinorista = tempHora;

        tempHora = moment(rowHorasLocales[0].horaCierreMayorista, "HH:mm").format("LT").toString();
        rowHorasLocales[0].horaCierreMayorista = tempHora;

        tempHora = moment(rowHorasLocales[0].horaCierreMinorista, "HH:mm").format("LT").toString();
        rowHorasLocales[0].horaCierreMinorista = tempHora;


        res.render("comerciante/locales/crearLocal", { rowsProductos, rowHorasLocales: rowHorasLocales[0] });
    } catch (error) {
        console.log(error);
    }
});

router.post('/crearLocal', esComercianteAprobado, async (req, res) => {
    try {
        let { name, descripcion, tipoLocal, productos, idlocal, domicilio, horaA, horaC } = req.body;
        req.check("idlocal", "Ingrese el id que identifica su local en Cenabastos P.H.").notEmpty();
        req.check("name", "Ingrese el nombre de su local comercial").notEmpty();
        req.check("tipoLocal", "Seleccione un tipo de local").notEmpty();
        req.check("domicilio", "Ingrese un precio base de su cobro de domicilios").notEmpty();
        req.check("horaA", "Ingrese la hora de apertura de su local").notEmpty();
        req.check("horaC", "Ingrese la hora de cierre de su local").notEmpty();

        if (tipoLocal == 0) {
            const rowHorasLocales = await pool.query("SELECT horaAperturaMinorista FROM admin WHERE ? BETWEEN horaAperturaMinorista AND horaCierreMinorista AND ? BETWEEN horaAperturaMinorista AND horaCierreMinorista", [horaA, horaC]);
            if (rowHorasLocales.length == 0) {
                throw new Error("impUsr-doDefault-No se puede crear local porque no se encuentra entre la hora de apertura u hora de cierre adecuado");
            }
        }

        if (tipoLocal == 1) {
            const rowHorasLocales = await pool.query("SELECT horaAperturaMayorista FROM admin WHERE ? BETWEEN horaAperturaMayorista AND horaCierreMayorista AND ? BETWEEN horaAperturaMayorista AND horaCierreMayorista", [horaA, horaC]);
            if (rowHorasLocales.length == 0) {
                throw new Error("impUsr-doDefault-No se puede crear local porque no se encuentra entre la hora de apertura u hora de cierre adecuado");
            }
        }

        const errors = req.validationErrors();
        if (errors.length > 0) {
            throw new Error("impUsr-reForm-" + errors[0].msg);
        }
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
            estaAbierto: 1,
            fkIdBanner: 12,
            montoPedidoMinimo: 0,
            horaApertura: horaA,
            horaCierre: horaC
        };
        const resultLocalComercial = await pool.query("INSERT INTO localComercial SET ? ", [newLocalComercial]);
        const idLocalComercial = resultLocalComercial.insertId;

        //Algoritmo para Insertar en la BD los productoLocal de un localComercial
        let i = 0;
        while (i < productos.length && productos[i] != null) {
            await pool.query("INSERT INTO productoLocal (fkIdLocalComercial, fkIdProducto) VALUES (?,?)", [idLocalComercial, productos[i]]);
            i++;
        }
        actualizarTagsLocal(req.session.idLocalActual);
        res.redirect('/comerciante/locales/listadoLocales');
    } catch (error) {
        console.log(error);
        let arrayError = error.message.toString().split("-");
        if (arrayError.length >= 3) {
            let _imp = arrayError[0];
            let _do = arrayError[1];
            let _msg = arrayError[2];
            if (_imp === "impUsr") {
                req.flash("message", _msg);
            }
            if (_do === "reForm") {
                res.redirect('/comerciante/locales/crearLocal');
            }

        }
        res.redirect('/comerciante/locales/listadoLocales');
    }
});

// De aquí en adelante es necesario que haya un local cargado en sesión
router.get('/agregarProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const rowsProductos = await pool.query("SELECT producto.pkIdProducto, producto.nombreProducto, imagen.rutaImagen FROM producto INNER JOIN imagen ON producto.fkIdImagen=imagen.pkIdImagen ORDER BY nombreProducto ASC");
        const rowsProductosLocal = await pool.query("SELECT productolocal.fkIdProducto FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial=localcomercial.pkIdLocalComercial WHERE localcomercial.pkIdLocalComercial=? AND localcomercial.fkIdComerciantePropietario=?", [req.session.idLocalActual, req.session.idComerciante]);
        //checked
        const productosImprimibles = rowsProductos.map(function (producto) {
            let esProductoLocal = false;
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
        let { productosAAgregar } = req.body;
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
            let esAgregable = true;
            for (let index = 0; index < rowsProductosLocal.length; index++) {
                if (rowsProductosLocal[index].fkIdProducto == productoAAgregar) {
                    esAgregable = false;
                    break;
                }
            }
            return esAgregable;
        });

        let index = 0;
        while (index < productosAgregables.length) {
            await pool.query("INSERT INTO productoLocal (fkIdLocalComercial, fkIdProducto) VALUES (?,?)", [req.session.idLocalActual, productosAgregables[index]]);
            index++;
        }
        actualizarTagsLocal(req.session.idLocalActual);
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

        const rowsPedidosEntregados = await pool.query("SELECT venta.pkIdVenta FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [1, 1, 1, idLocal]);
        const totalRowsPedidosEntregados = rowsPedidosEntregados.length;

        res.render("comerciante/locales/pedidos", { nombreLocalActual: req.session.nombreLocalActual, rowsNuevosPedidos, totalRowsNuevosPedidos, rowsPedidosEmpacados, totalRowsPedidosEmpacados, rowsPedidosEnviados, totalRowsPedidosEnviados, rowsPedidosEntregados, totalRowsPedidosEntregados });
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.get('/pedidosEntregados', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const rowsPedidosEntregados = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [1, 1, 1, idLocal]);
        res.render("comerciante/locales/pedidosEntregados", { nombreLocalActual: req.session.nombreLocalActual, rowsPedidosEntregados});
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
        let rowsItemVenta = await pool.query("SELECT itemventa.nombrePresentacionItemVenta, itemventa.precioUnitarioItem, itemventa.cantidadItem, producto.nombreProducto, imagen.rutaImagen FROM venta INNER JOIN itemventa ON itemventa.fkIdVenta = venta.pkIdVenta INNER JOIN producto ON producto.pkIdProducto = itemventa.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen WHERE itemventa.fkIdVenta = ? AND venta.fkIdLocalComercial = ?", [idPedido, idLocal]);
        const tamanioRowsItemVenta = rowsItemVenta.length;

        for (let index = 0; index < tamanioRowsItemVenta; index++) {
            let totalItemVenta = 0;
            totalItemVenta = rowsItemVenta[index].precioUnitarioItem * rowsItemVenta[index].cantidadItem;
            rowsItemVenta[index].totalItemVenta = totalItemVenta;
        }

        const rowDatos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, venta.precioDomicilioVenta, venta.fechaHoraVenta, venta.telefonoCliente, venta.direccionCliente, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural, usuario.correoUsuario FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personaNatural ON personaNatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personaNatural.fkIdUsuario WHERE venta.pkIdVenta = ? AND venta.fkIdLocalComercial = ?", [idPedido, idLocal]);

        //Estado del pedido
        let componentEstado = require("../../lib/estadoPedido.component");
        const htmlEstado = await componentEstado.getHtmlCard(idPedido);

        /*
        let rowEstadoPedido = await pool.query("SELECT venta.fechaHoraVenta, venta.fechaHoraEnvio, venta.fechaHoraEntrega, venta.fechaHoraEmpacado, venta.fueEnviado, venta.fueEntregado, venta.fueEmpacado FROM venta WHERE venta.pkIdVenta = ? AND venta.fkIdLocalComercial = ?", [idPedido, idLocal]);
        if (rowEstadoPedido[0].fueEnviado == 0 && rowEstadoPedido[0].fueEntregado == 0 && rowEstadoPedido[0].fueEmpacado == 0) {
            const htmlBotonMover = '<a href="/comerciante/locales/pedidos/moverAEmpacado/' + idPedido + '" class="btn btn-danger p-0 pr-2 pl-2" style="font-size: 20px;">' +
                '<i class="fas fa-chevron-circle-down" data-toggle="tooltip" title="Mover a Empacados"></i> </a>';
            rowEstadoPedido[0].nuevoEmpacadoHtml = htmlBotonMover;
        } else if (rowEstadoPedido[0].fueEnviado == 0 && rowEstadoPedido[0].fueEntregado == 0 && rowEstadoPedido[0].fueEmpacado == 1) {
            /*const htmlBotonDevolver = "<a href='/comerciante/locales/pedidos/moverANuevos/" + idPedido + "' class='btn btn-primary p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-up' data-toggle='tooltip' title='Mover a Nuevos'></i></a>";
            rowEstadoPedido[0].devolverNuevoHtml = htmlBotonDevolver;

            const htmlBotonMover = "<a href='/comerciante/locales/pedidos/moverAEnviados/" + idPedido + "' class='btn btn-warning p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-down' data-toggle='tooltip' title='Mover a Enviado'></i></a>";
            rowEstadoPedido[0].nuevoEnviadoHtml = htmlBotonMover;
        } else if (rowEstadoPedido[0].fueEnviado == 1 && rowEstadoPedido[0].fueEntregado == 0 && rowEstadoPedido[0].fueEmpacado == 1) {
            /*const htmlBotonDevolver = "<a href='/comerciante/locales/pedidos/devolverAEmpacado/" + idPedido + "' class='btn btn-danger p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-up' data-toggle='tooltip' title='Mover a Empacado'></i></a>";
            rowEstadoPedido[0].devolverEmpacadoHtml = htmlBotonDevolver;

            const htmlBotonMover = "<a href='/comerciante/locales/pedidos/moverAEntregado/" + idPedido + "' class='btn btn-success p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-down' data-toggle='tooltip' title='Mover a Recibidos'></i></a>";
            rowEstadoPedido[0].nuevoEntregadoHtml = htmlBotonMover;
        } else if (rowEstadoPedido[0].fueEnviado == 1 && rowEstadoPedido[0].fueEntregado == 1 && rowEstadoPedido[0].fueEmpacado == 1) {
            /*const htmlBotonDevolver = "<a href='/comerciante/locales/pedidos/devolerAEnviado/" + idPedido + "' class='btn btn-warning p-0 pr-2 pl-2'" +
                "style='font-size: 20px;'> <i class='fas fa-chevron-circle-up' data-toggle='tooltip' title='Mover a Enviados'></i></a>";
            rowEstadoPedido[0].devolverEnviadoHtml = htmlBotonDevolver;
        } */

        //Buzon
        let rowsBuzon = await pool.query("SELECT venta.pkIdVenta,buzon.pkIdBuzon,buzon.buzonLeido FROM buzon INNER JOIN venta ON venta.pkIdVenta=buzon.fkIdVenta WHERE buzon.fkIdVenta=? AND venta.fkIdLocalComercial=? ", [idPedido, idLocal]);
        if (rowsBuzon.length == 1) {
            let rowsMensajesBuzon = await pool.query("SELECT mensajebuzon.fechaHoraMensajeBuzon,mensajebuzon.esCliente,mensajebuzon.mensajeBuzon FROM mensajebuzon WHERE fkIdBuzon=?", [rowsBuzon[0].pkIdBuzon]);
            for (let index = 0; index < rowsMensajesBuzon.length; index++) {
                let leftRight = true;
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
        res.render("comerciante/locales/informacionPedido", { nombreLocalActual: req.session.nombreLocalActual, rowsItemVenta, rowDatos: rowDatos[0], htmlEstado, rowsBuzon });
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
        let moment = require("moment");
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
        let codError = error.message.toString().split("-");

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
        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        
        const rowDatosNoti = await pool.query("SELECT venta.fkIdCliente, usuario.correoUsuario FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE pkIdVenta = ?",[idPedido]);

        let notificaciones = require("../../lib/notificaciones.manager");
        notificaciones.notificarCliente(rowDatosNoti[0].fkIdCliente,"Nuevo Pedido Empacado","Su pedido a sido empacado y esta listo para el envio",97,"cliente/pedidos/detallesPedido/"+idPedido,moment,rowDatosNoti[0].correoUsuario, true);
    /*    const fueEmpacado = {
            fueEmpacado: 1,
            fechaHoraEmpacado: moment
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEmpacado, idPedido, idLocal]);    */


        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

/* router.get('/pedidos/moverANuevos/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEmpacado = {
            fueEmpacado: 0,
            fechaHoraEmpacado: null
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEmpacado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
}); */

router.get('/pedidos/moverAEnviados/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        
        const rowDatosNoti = await pool.query("SELECT venta.fkIdCliente, usuario.correoUsuario FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE pkIdVenta = ?",[idPedido]);

        let notificaciones = require("../../lib/notificaciones.manager");
        notificaciones.notificarCliente(rowDatosNoti[0].fkIdCliente,"Nuevo Pedido Enviado","Su pedido a sido enviado",97,"cliente/pedidos/detallesPedido/"+idPedido,moment,rowDatosNoti[0].correoUsuario, true);
        /*const fueEnviado = {
            fueEnviado: 1,
            fechaHoraEnvio: moment
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEnviado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");*/

    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

/* router.get('/pedidos/devolverAEmpacado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEnviado = {
            fueEnviado: 0,
            fechaHoraEnvio: null
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEnviado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});*/

router.get('/pedidos/moverAEntregado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        let moment = require("moment");
        moment = moment.utc().subtract(4, "hours").format("YYYY-MM-DD HH:mm:ss").toString();
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        
        const rowDatosNoti = await pool.query("SELECT venta.fkIdCliente, usuario.correoUsuario FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural INNER JOIN usuario ON usuario.pkIdUsuario = personanatural.fkIdUsuario WHERE pkIdVenta = ?",[idPedido]);

        let notificaciones = require("../../lib/notificaciones.manager");
        notificaciones.notificarCliente(rowDatosNoti[0].fkIdCliente,"Nuevo Pedido Entregado","Su pedido a sido entregado",97,"cliente/pedidos/detallesPedido/"+idPedido,moment,rowDatosNoti[0].correoUsuario, true);
        /*const fueEntregado = {
            fueEntregado: 1,
            fechaHoraEntrega: moment
        };
        await pool.query("UPDATE venta SET  ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEntregado, idPedido, idLocal]);*/
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

/* router.get('/pedidos/devolerAEnviado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const idLocal = req.session.idLocalActual;
        const { idPedido } = req.params;
        const fueEntregado = {
            fueEntregado: 0,
            fechaHoraEntrega: null
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEntregado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
}); */


router.get('/ajustes', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const pkIdLocalComercial = req.session.idLocalActual;
        //ajuste de los productos
        let rowsProductosLocal = await pool.query("SELECT productolocal.pkIdProductoLocal, productolocal.detallesProductoLocal, producto.pkIdProducto, producto.nombreProducto, imagen.rutaImagen FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial = localcomercial.pkIdLocalComercial INNER JOIN producto ON producto.pkIdProducto = productolocal.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen WHERE localcomercial.pkIdLocalComercial = ? ORDER BY producto.nombreProducto ASC", [pkIdLocalComercial]);
        for (let index = 0; index < rowsProductosLocal.length; index++) {
            const idProductoLocal = rowsProductosLocal[index].pkIdProductoLocal;
            const rowsPresentaciones = await pool.query("SELECT presentacionproducto.pkIdPresentacionProducto, presentacionproducto.nombrePresentacion, presentacionproducto.precioUnitarioPresentacion, presentacionproducto.detallesPresentacionProducto FROM productolocal INNER JOIN presentacionproducto ON presentacionproducto.fkIdProductoLocal = productoLocal.pkIdProductoLocal WHERE pkIdProductoLocal = ?", [idProductoLocal]);
            rowsProductosLocal[index].presentaciones = rowsPresentaciones;
            rowsProductosLocal[index].cantPresentaciones = rowsPresentaciones.length;

        }
        const cantProductos = rowsProductosLocal.length;

        //hora de apertura y cierre 
        let rowHorasLocales = await pool.query("SELECT horaAperturaMayorista, horaAperturaMinorista, horaCierreMayorista, horaCierreMinorista FROM admin WHERE pkIdAdmin = ?", [1]);

        //ajuste de actualizar datos del local
        let rowsDatosLocal = await pool.query("SELECT localcomercial.esMayorista, localcomercial.horaApertura, localcomercial.horaCierre, localcomercial.precioDomicilioLejos ,localcomercial.montoPedidoMinimo, localcomercial.nombreLocal, localcomercial.descripcionLocal, localcomercial.precioDomicilio,imagen.rutaImagen,imagen.publicId FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen=localcomercial.fkIdBanner WHERE localcomercial.pkIdLocalComercial = ?", [pkIdLocalComercial]);

        let moment = require("moment");
        let tempHora = moment(rowHorasLocales[0].horaAperturaMayorista, "HH:mm").format("LT").toString();
        rowsDatosLocal[0].horaAperturaMayorista = tempHora;

        tempHora = moment(rowHorasLocales[0].horaAperturaMinorista, "HH:mm").format("LT").toString();
        rowsDatosLocal[0].horaAperturaMinorista = tempHora;

        tempHora = moment(rowHorasLocales[0].horaCierreMayorista, "HH:mm").format("LT").toString();
        rowsDatosLocal[0].horaCierreMayorista = tempHora;

        tempHora = moment(rowHorasLocales[0].horaCierreMinorista, "HH:mm").format("LT").toString();
        rowsDatosLocal[0].horaCierreMinorista = tempHora;


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
        console.log("el texto es", detallesProductoLocal, " y el id es ", idProductoLocal);

        //Recolectar y actualizar los datos en la BD
        const newProductoLocal = {
            detallesProductoLocal: detallesProductoLocal
        };

        console.log("aqui el producto local", newProductoLocal);
        await pool.query("UPDATE productolocal SET ? WHERE pkIdProductoLocal = ?", [newProductoLocal, idProductoLocal]);

        res.redirect('/comerciante/locales/ajustes');
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
                res.redirect('/comerciante/locales/agregarPresentacionProductoLocal/' + idProductoLocal);
            }
            if (_do == "doDefault") {
                res.redirect('/comerciante/locales/listadoLocales');
            }
        }
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});

router.post('/actualizarPresentacionProducto', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        let { idPresentacionProducto, nombrePresentacion, precioUnitario, detallesPresentacion } = req.body;
        if (nombrePresentacion.trim() === "") {
            throw new Error("impUsr-reForm-Escriba un nombre para la presentación");
        }
        if (precioUnitario < 0) {
            throw new Error("impUsr-reForm-El precio debe ser mayor o igual a cero");
        }
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
        let arrayError = error.message.toString().split("-");
        if (arrayError.length >= 3) {
            let _imp = arrayError[0];
            let _do = arrayError[1];
            let _msg = arrayError[2];

            if (_imp === "impUsr") {
                req.flash("message", _msg);
            }

            if (_do === "reForm") {
                res.redirect("/comerciante/locales/ajustes");
            }

            if (_do === "doDefault") {
                res.redirect("/comerciante/locales/listadoLocales");
            }
        }
        req.flash("message", "Seleccione un local de nuevo")
        res.redirect("/comerciante/locales/listadoLocales");
    }
});


router.get('/buscarFechas', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const id = req.session.idLocalActual;
        const totalMostar = 0;
        res.render("comerciante/locales/buscarPorFechas", { id, nombreLocalActual: req.session.nombreLocalActual, totalMostar });
    } catch (error) {
        console.log(error);
        res.redirect("/comerciante/locales/ajustes");
    }
});

router.post('/buscarVendidoPorFechas', esComercianteAprobado, async (req, res) => {
    try {
        const { idLocal, dateInicio, dateFin } = req.body;
        req.check("dateInicio", "Ingrese Fecha Inicio de Busqueda").notEmpty();
        req.check("dateFin", "Ingrese Fecha Fin de Busqueda").notEmpty();
        const id = idLocal;

        const newDateInicio = dateInicio + ' 00:00:00';
        const newDateFin = dateFin + ' 23:59:59';

        let totalMostar = 0;
        const rowsVendidios = await pool.query("SELECT montoTotal FROM venta WHERE fkIdLocalComercial = ? AND fueEntregado = ? AND fueEmpacado = ? AND fueEnviado = ? AND fechaHoraEntrega BETWEEN ? AND ?", [idLocal, 1, 1, 1, newDateInicio, newDateFin]);
        for (let j = 0; j < rowsVendidios.length; j++) {
            totalMostar += rowsVendidios[j].montoTotal;
        }
        //const rowNombreLocal = await pool.query("SELECT idLocalEnCenabastos, nombreLocal FROM localcomercial WHERE pkIdLocalComercial = ?",[idLocal]);

        const rangoBuscado = '<div class="mt-3"> El rango de fechas a buscar fue entre <i class="fas fa-calendar-day"></i> ' + newDateInicio + ' - <i class="fas fa-calendar-day"></i> ' + newDateFin + ' </div>';


        res.render("comerciante/locales/buscarPorFechas", { totalMostar, nombreLocalActual: req.session.nombreLocalActual, rangoBuscado, id });
    } catch (error) {
        console.log(error);
        res.redirect("/comerciante/locales/ajustes");
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
        actualizarTagsLocal(req.session.idLocalActual);
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
        const resultDelete = await pool.query("DELETE pp FROM presentacionproducto pp INNER JOIN productolocal ON productolocal.pkIdProductoLocal = pp.fkIdProductoLocal INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = productolocal.fkIdLocalComercial WHERE pp.pkIdPresentacionProducto = ? AND localcomercial.fkIdComerciantePropietario = ?", [id, req.session.idComerciante]);
        console.log("el resultado de borrar algo es ", resultDelete);
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
        const { name, descripcion, domicilio, domicilioLejos, minimo, horaA, horaC, tipoLocal } = req.body;

        if (tipoLocal == 0) {
            const rowHorasLocales = await pool.query("SELECT horaAperturaMinorista FROM admin WHERE ? BETWEEN horaAperturaMinorista AND horaCierreMinorista AND ? BETWEEN horaAperturaMinorista AND horaCierreMinorista", [horaA, horaC]);
            if (rowHorasLocales.length == 0) {
                throw new Error("impUsr-doDefault-No se puede actualizar horas porque no se encuentra entre la hora de apertura u hora de cierre adecuado");
            }
        }

        if (tipoLocal == 1) {
            const rowHorasLocales = await pool.query("SELECT horaAperturaMayorista FROM admin WHERE ? BETWEEN horaAperturaMayorista AND horaCierreMayorista AND ? BETWEEN horaAperturaMayorista AND horaCierreMayorista", [horaA, horaC]);
            if (rowHorasLocales.length == 0) {
                throw new Error("impUsr-doDefault-No se puede actualizar horas porque no se encuentra entre la hora de apertura u hora de cierre adecuado");
            }
        }

        //Recolectar y actualizar los datos en la BD
        const newLocalComercial = {
            nombreLocal: name,
            precioDomicilio: domicilio,
            precioDomicilioLejos: domicilioLejos,
            descripcionLocal: descripcion,
            montoPedidoMinimo: minimo,
            horaApertura: horaA,
            horaCierre: horaC
        };
        await pool.query("UPDATE localComercial SET ? WHERE pkIdLocalComercial = ?", [newLocalComercial, pkIdLocalComercial]);
        req.session.nombreLocalActual = newLocalComercial.nombreLocal;
        res.redirect('/comerciante/locales/ajustes');
    } catch (error) {
        console.log(error);

        let arrayError = error.message.toString().split("-");
        if (arrayError.length >= 3) {
            let _imp = arrayError[0];
            let _do = arrayError[1];
            let _msg = arrayError[2];
            if (_imp === "impUsr") {
                req.flash("message", _msg);
            }
        }
        res.redirect('/comerciante/locales/ajustes');
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
        if (nombrePresentacion.trim() == "") {
            throw new Error("impUsr-reForm-Ingrese un nombre válido");
        }
        //Verificar si el id del producto-local es válido
        const rowsProductoLocal = await pool.query("SELECT localcomercial.pkIdLocalComercial FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial=localcomercial.pkIdLocalComercial WHERE localcomercial.fkIdComerciantePropietario=? AND productolocal.pkIdProductoLocal=?", [req.session.idComerciante, idProductoLocal]);
        if (rowsProductoLocal.length != 1) {
            throw "impDev-doDefault-El id del producto local no es valido";
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
        let arrayError = error.message.toString().split("-");
        let _imp = arrayError[0];
        let _do = arrayError[1];
        let _msg = arrayError[2];

        if (_imp === "impUsr") {
            req.flash("message", _msg);
        }

        if (_do === "reForm") {
            res.redirect("/comerciante/locales/agregarPresentacionProductoLocal/" + idProductoLocal + "");
        }

        if (_do === "doDefault") {
            res.redirect("/comerciante/locales/listadoLocales");
        }
    }
});


router.post('/actualizarBanner', esComercianteAprobado, async (req, res) => {
    try {
        if (!localCargado(req)) {
            throw "Local no cargado";
        }
        const cloudinary = require("cloudinary");
        const { cloud_name, api_key, api_secret } = require("../../environmentlets");
        cloudinary.config({
            cloud_name,
            api_key,
            api_secret
        });
        const size = req.file.size;
        const extension = req.file.mimetype.split("/")[1].toString();
        if (extension.trim() != "png" && extension.trim() != "jpg" && extension.trim() != "jpeg" && extension.trim() != "webp") {
            throw new Error("impUsr-doDefault-Debes subir una imagen con extensión png, jpg, jpeg o webp");
        }
        if (size > 5242880) {
            throw new Error("impUsr-doDefault-Tu imagen no puede pesar más de 5 MB");
        }

        const rowLatestImage = await pool.query("SELECT imagen.publicId, imagen.pkIdImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen=localcomercial.fkIdBanner WHERE localcomercial.pkIdLocalComercial=?", [req.session.idLocalActual]);
        if (rowLatestImage.length != 1) {
            throw new Error("impUsr-doDefafult-No existe un banner asociado al local o existe más de un banner asociado al local");
        }

        const resultCloud = await cloudinary.v2.uploader.upload(req.file.path);
        let newImagen = {
            publicId: resultCloud.public_id,
            rutaImagen: resultCloud.secure_url
        };
        const resultDb = await pool.query("INSERT INTO imagen SET ?", [newImagen]);
        const newLocal = {
            fkIdBanner: resultDb.insertId
        };

        await pool.query("UPDATE localcomercial SET ? WHERE pkIdLocalComercial=?", [newLocal, req.session.idLocalActual]);

        //Limpiar
        await cloudinary.v2.uploader.destroy(rowLatestImage[0].publicId);
        await pool.query("DELETE FROM imagen WHERE pkIdImagen=?", [rowLatestImage[0].pkIdImagen]);
        res.redirect("/comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
        let arrayError = error.message.toString().split("-");
        let _imp = arrayError[0];
        let _do = arrayError[1];
        let _msg = arrayError[2];

        if (_imp === "impUsr") {
            req.flash("message", _msg);
        }

        if (_do === "reForm") {
            res.redirect("/comerciante/locales/agregarPresentacionProductoLocal/" + idProductoLocal + "");
        }

        res.redirect("/comerciante/locales/ajustes");
    }
    finally {
        const fs = require("fs-extra");
        await fs.unlink(req.file.path);
    }
});


router.get('/informacionPresentacion', esComercianteAprobado, async (req, res) => {
    try {
        res.render("comerciante/locales/informacionPresentacion");
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;

