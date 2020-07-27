const express = require('express');
const router = express.Router();
const { esComerciante, esComercianteAprobado } = require('../../lib/auth');
const pool = require("../../database");

router.get('/local/:id', esComercianteAprobado, async (req, res) => {
    try {
        const { id } = req.params;
        const rowsLocalComercial = await pool.query("SELECT pkIdLocalComercial,nombreLocal FROM localcomercial WHERE pkIdLocalComercial=? AND fkIdComerciantePropietario=?", [id, req.session.idComerciante]);
        if (rowsLocalComercial.length != 1) {
            throw "El local no le pertenece a este propietario"
        }
        req.session.idLocalActual = rowsLocalComercial[0].pkIdLocalComercial;
        req.session.nombreLocalActual=rowsLocalComercial[0].nombreLocal;
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
        const { name, descripcion, tipoLocal, productos, idlocal, domicilio } = req.body;
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
            estaAbierto: 0
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

router.get('/agregarProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
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
    }
});

router.post('/agregarProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
        var { productosAAgregar } = req.body;
        if (!Array.isArray(productosAAgregar)) {
            productosAAgregar = [productosAAgregar];
        }
        if (productosAAgregar.length==0) {
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
        res.redirect("/comerciante/locales/pedidos");
    }
});

router.get('/pedidos', esComercianteAprobado, async (req, res) => {
    try {
        const idLocal=req.session.idLocalActual;
        const rowsNuevosPedidos = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [0, 0, 0, idLocal]);
        const totalRowsNuevosPedidos = rowsNuevosPedidos.length;

        const rowsPedidosEmpacados = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [0, 0, 1, idLocal]);
        const totalRowsPedidosEmpacados = rowsPedidosEmpacados.length;

        const rowsPedidosEnviados = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [1, 0, 1, idLocal]);
        const totalRowsPedidosEnviados = rowsPedidosEnviados.length;

        const rowsPedidosEntregados = await pool.query("SELECT venta.pkIdVenta, venta.montoTotal, personaNatural.nombresPersonaNatural, personaNatural.apellidosPersonaNatural FROM venta INNER JOIN cliente ON cliente.pkIdCliente = venta.fkIdCliente INNER JOIN personanatural ON personanatural.pkIdPersonaNatural = cliente.fkIdPersonaNatural WHERE venta.fueEnviado = ? AND venta.fueEntregado = ? AND venta.fueEmpacado = ? AND venta.fkIdLocalComercial = ?", [1, 1, 1, idLocal]);
        const totalRowsPedidosEntregados = rowsPedidosEntregados.length;

        res.render("comerciante/locales/pedidos", {nombreLocalActual:req.session.nombreLocalActual, rowsNuevosPedidos, totalRowsNuevosPedidos,  rowsPedidosEmpacados, totalRowsPedidosEmpacados, rowsPedidosEnviados, totalRowsPedidosEnviados, rowsPedidosEntregados, totalRowsPedidosEntregados});
    } catch (error) {
        console.log(error);
    }
});

router.get('/pedidos/moverAEmpacado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        const idLocal=req.session.idLocalActual;
        const { idPedido }=  req.params;
        const fueEmpacado = {
            fueEmpacado: 1
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?",[fueEmpacado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
    }
});

router.get('/pedidos/moverANuevos/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        const idLocal=req.session.idLocalActual;
        const { idPedido }=  req.params;
        const fueEmpacado = {
            fueEmpacado: 0
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEmpacado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
    }
});

router.get('/pedidos/moverAEnviados/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        const idLocal=req.session.idLocalActual;
        const { idPedido }=  req.params;
        const fueEnviado = {
            fueEnviado: 1
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEnviado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
    }
});

router.get('/pedidos/devolverAEmpacado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        const idLocal=req.session.idLocalActual;
        const { idPedido }=  req.params;
        const fueEnviado = {
            fueEnviado: 0
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEnviado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
    }
});

router.get('/pedidos/moverAEntregado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        const idLocal=req.session.idLocalActual;
        const { idPedido }=  req.params;
        const fueEntregado = {
            fueEntregado: 1
        };
        await pool.query("UPDATE venta SET  ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEntregado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
    }
});

router.get('/pedidos/devolerAEnviado/:idPedido', esComercianteAprobado, async (req, res) => {
    try {
        const idLocal=req.session.idLocalActual;
        const { idPedido }=  req.params;
        const fueEntregado = {
            fueEntregado: 0
        };
        await pool.query("UPDATE venta SET ? WHERE pkIdVenta = ? AND fkIdLocalComercial = ?", [fueEntregado, idPedido, idLocal]);
        res.redirect("/comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
    }
});

router.get('/buzon', esComercianteAprobado, async (req, res) => {
    try {
        res.render("comerciante/locales/buzon",{nombreLocalActual:req.session.nombreLocalActual});
    } catch (error) {
        console.log(error);
    }
});

router.get('/ajustes', esComercianteAprobado, async (req, res) => {
    try {
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
        res.render("comerciante/locales/ajustes", {nombreLocalActual:req.session.nombreLocalActual, rowsDatosLocal, rowsProductosLocal, cantProductos });
    } catch (error) {
        console.log(error);
    }
});

router.post('/actualizarProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
        const { idProductoLocal, detallesProductoLocal } = req.body;

        //Recolectar y actualizar los datos en la BD
        const newProductoLocal = {
            detallesProductoLocal: detallesProductoLocal
        };
        await pool.query("UPDATE productolocal SET ? WHERE pkIdProductoLocal = ?", [newProductoLocal, idProductoLocal]);

        res.redirect('/comerciante/locales/ajustes');
    } catch (error) {
        console.log(error);
        res.redirect('/comerciante/locales/ajustes');
    }
});

router.post('/actualizarPresentacionProducto', esComercianteAprobado, async (req, res) => {
    try {
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
        res.redirect('/comerciante/locales/ajustes');
    }
});

//pendiente
router.get('/actualizarProductos', esComercianteAprobado, async (req, res) => {
    try {
        res.render("comerciante/locales/actualizarProductos");
    } catch (error) {
        console.log(error);
    }
});


router.get('/local/borrarProducto/:id', esComercianteAprobado, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE pp FROM presentacionproducto pp INNER JOIN productolocal ON productolocal.pkIdProductoLocal = pp.fkIdProductoLocal INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = productolocal.fkIdLocalComercial WHERE pp.fkIdProductoLocal = ? AND localcomercial.fkIdComerciantePropietario = ?", [id, req.session.idComerciante]);
        await pool.query("DELETE pl FROM productolocal pl INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = pl.fkIdLocalComercial WHERE pl.pkIdProductoLocal = ? AND localcomercial.fkIdComerciantePropietario", [id, req.session.idComerciante]);
        res.redirect("/comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
        res.redirect("/comerciante/locales/ajustes");
    }
});

router.get('/local/borrarPresentacionProducto/:id', esComercianteAprobado, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE pp FROM presentacionproducto pp INNER JOIN productolocal ON productolocal.pkIdProductoLocal = pp.fkIdProductoLocal INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = productolocal.fkIdLocalComercial WHERE pp.pkIdPresentacionProducto = ? AND localcomercial.fkIdComerciantePropietario = ?", [id, req.session.idComerciante]);
        res.redirect("/comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
        res.redirect("/comerciante/locales/ajustes");
    }
});

router.post('/actualizarDatos', esComercianteAprobado, async (req, res) => {
    try {
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
        req.session.nombreLocalActual=newLocalComercial.nombreLocal;
        res.redirect('/comerciante/locales/ajustes');
    } catch (error) {
        console.log(error);
        res.redirect('/comerciante/locales/ajustes');
    }
});

router.get('/agregarPresentacionProductoLocal/:id', esComercianteAprobado, async (req, res) => {
    try {
        const { id } = req.params;
        res.render("comerciante/locales/agregarPresentacionProductoLocal", { id });
    } catch (error) {
        console.log(error);
        res.redirect("/comerciante/locales/ajustes");
    }
});

router.post('/agregarPresentacionProductoLocal', esComercianteAprobado, async (req, res) => {
    try {
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
        res.redirect("/comerciante/locales/ajustes");
    }
});

module.exports = router;

