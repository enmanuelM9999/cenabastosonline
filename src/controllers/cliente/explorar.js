const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const carrito = require("../../lib/carrito.manager");
const pool = require("../../database");


router.get('/listadoLocalesMayoristas', esCliente, async (req, res) => {
    try {
        //Buscar todos los locales mayoristas
        const rowsLocalesMayoristas = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.esMayorista = 1");

        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        res.render("cliente/explorar/listadoLocalesMayoristas", { rowsLocalesMayoristas, cantItemsCarrito });
    } catch (error) {
        console.log(error);

    }
});

router.get('/listadoLocalesMinoristas', esCliente, async (req, res) => {
    try {
        //Buscar todos los locales minoristas
        const rowsLocalesMinoristas = await pool.query("SELECT localcomercial.calificacionContadorCliente,localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.esMayorista = 0");
        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        res.render("cliente/explorar/listadoLocalesMinoristas", { rowsLocalesMinoristas, cantItemsCarrito });
    } catch (error) {
        console.log(error);

    }
});

function existeCategoria(arrayCategorias,idCategoria){
    var existe=false;
    for (let index = 0; index < arrayCategorias.length; index++) {
        if (arrayCategorias[index].id==idCategoria) {
            existe=true;
            break;
        } 
    }
    return existe;
}

router.get('/local/:idLocal', esCliente, async (req, res) => {
    try {
        const { idLocal } = req.params;
        //Buscar todos los locales mayoristas
        var rowsLocalesMayoristas = await pool.query("SELECT localcomercial.calificacionContadorCliente,localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, localcomercial.estaAbierto, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.pkIdLocalComercial = ?", [idLocal]);
        if (rowsLocalesMayoristas[0].estaAbierto == 1) {
            rowsLocalesMayoristas[0].textoEstaAbierto = '<div class="text-success" style="font-size: 1.5em;"><i class="fas fa-door-open"></i> Abierto </div>';
        } else {
            rowsLocalesMayoristas[0].textoEstaAbierto = '<div class="text-danger" style="font-size: 1.5em;"><i class="fas fa-door-closed"></i> Cerrado </div>';
        }

        const rowsProductoLocal = await pool.query("SELECT presentacionproducto.pkIdPresentacionProducto, presentacionproducto.nombrePresentacion,presentacionproducto.precioUnitarioPresentacion,productolocal.pkIdProductoLocal, producto.nombreProducto, producto.cssPropertiesBg, imagen.rutaImagen, categoriaproducto.pkIdCategoriaProducto,categoriaproducto.descripcionCategoriaProducto FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial = localcomercial.pkIdLocalComercial INNER JOIN producto ON producto.pkIdProducto = productolocal.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN categoriaproducto ON producto.fkIdCategoriaProducto=categoriaproducto.pkIdCategoriaProducto INNER JOIN presentacionproducto ON presentacionproducto.fkIdProductoLocal = productolocal.pkIdProductoLocal WHERE localcomercial.pkIdLocalComercial = ? ORDER BY  producto.nombreProducto ASC", [idLocal]);

        //htmlProductos
        var categorias = [];
        var productos=[];
        for (let index = 0; index < rowsProductoLocal.length; index++) {
            if (!existeCategoria(categorias,rowsProductoLocal[index].pkIdCategoriaProducto)) {
                categorias.push({ id: rowsProductoLocal[index].pkIdCategoriaProducto, name: rowsProductoLocal[index].descripcionCategoriaProducto });
            }
            var producto={
                id_presentacion: rowsProductoLocal[index].pkIdPresentacionProducto,
                nombre_presentacion:rowsProductoLocal[index].nombrePresentacion,
                precio:rowsProductoLocal[index].precioUnitarioPresentacion,
                id_pl:rowsProductoLocal[index].pkIdProductoLocal,
                nombre_producto:rowsProductoLocal[index].nombreProducto,
                css:rowsProductoLocal[index].cssPropertiesBg,
                img_path:rowsProductoLocal[index].rutaImagen,
                categoria:rowsProductoLocal[index].pkIdCategoriaProducto
            }
            productos.push(producto);
            
        }
        var htmlProductos= JSON.stringify(productos);
        var htmlCategorias = JSON.stringify(categorias);
        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        res.render("cliente/explorar/local", { rowsLocalesMayoristas: rowsLocalesMayoristas[0], rowsProductoLocal, htmlProductos, htmlCategorias, categorias, cantItemsCarrito , idLocal});
    } catch (error) {
        console.log(error);
        req.flash("info", "Acceso no permitido");
        res.redirect("/cliente/explorar/listadoLocalesminoristas");
    }
});

router.get('/productoLocal/:productoYPresentacion', esCliente, async (req, res) => {
    try {
        const { productoYPresentacion } = req.params;
        const array = productoYPresentacion.toString().split("-");
        const idProducto = array[0];
        const idPresentacionSeleccionada = array[1];

        const rowProductoLocal = await pool.query("SELECT productolocal.detallesProductoLocal,producto.nombreProducto, producto.cssPropertiesBg, imagen.rutaImagen, localcomercial.pkIdLocalComercial FROM productolocal INNER JOIN producto ON producto.pkIdProducto = productolocal.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = productolocal.fkIdLocalComercial WHERE productolocal.pkIdProductoLocal = ?", [idProducto]);
        var rowsPresentacionProducto = await pool.query("SELECT presentacionproducto.pkIdPresentacionProducto, presentacionproducto.nombrePresentacion, presentacionproducto.precioUnitarioPresentacion,presentacionproducto.detallesPresentacionProducto FROM productolocal INNER JOIN presentacionproducto ON presentacionproducto.fkIdProductoLocal = productolocal.pkIdProductoLocal WHERE productolocal.pkIdProductoLocal = ?", [idProducto]);

        //Preparar datos del producto
        var productoLocal = {
            idLocal: rowProductoLocal[0].pkIdLocalComercial,
            rutaImagen: rowProductoLocal[0].rutaImagen,
            nombreProducto: rowProductoLocal[0].nombreProducto,
            detallesProductoLocal: rowProductoLocal[0].detallesProductoLocal,
            precioUnitarioSeleccionado: rowsPresentacionProducto[0].precioUnitarioPresentacion,
            presentaciones: rowsPresentacionProducto,
            cssPropertiesBg: rowProductoLocal[0].cssPropertiesBg,
            htmlJSON: ''
        }

        var html = '[';
        for (let index = 0; index < rowsPresentacionProducto.length; index++) {
            //Seleccionar presentación
            rowsPresentacionProducto[index].inputSelected = "";
            if (rowsPresentacionProducto[index].pkIdPresentacionProducto == idPresentacionSeleccionada) {
                rowsPresentacionProducto[index].inputSelected = "selected";
                productoLocal.precioUnitarioSeleccionado = rowsPresentacionProducto[index].precioUnitarioPresentacion;
            }
            //Guardarlo en html
            html += '{';
            html += 'idPresentacion:' + rowsPresentacionProducto[index].pkIdPresentacionProducto + ',';
            html += 'nombrePresentacion:"' + rowsPresentacionProducto[index].nombrePresentacion + '",';
            html += 'precioUnitario:' + rowsPresentacionProducto[index].precioUnitarioPresentacion + ',';
            html += 'detallesVendedor:"' + rowsPresentacionProducto[index].detallesPresentacionProducto + '"';
            html += '},';
        }
        html += ']';
        productoLocal.htmlJSON = html;
        //carrito
        const cantItemsCarrito = await carrito.getLengthCarrito(req.session.idCliente);
        res.render("cliente/explorar/productoLocal", { productoLocal, cantItemsCarrito });
    } catch (error) {
        console.log(error);
    }
});

router.post('/calificarLocal', esCliente, async (req, res) => {
    try {
        const { valorEstrella, idLocal} = req.body;

        const rowsVenta = await pool.query("SELECT venta.pkIdVenta, calificacionclientelocal.calificacion FROM venta INNER JOIN localcomercial ON localcomercial.pkIdLocalComercial = venta.fkIdLocalComercial INNER JOIN calificacionclientelocal ON calificacionclientelocal.fkIdLocalComercial = localcomercial.pkIdLocalComercial WHERE venta.fkIdCliente = ? AND venta.fkIdLocalComercial = ? AND venta.fueEntregado = ? AND venta.fueEnviado = ? AND venta.fueEmpacado = ?", [req.session.idCliente, idLocal, 0, 0, 0]);

        if (rowsVenta.length < 1) {
            throw new Error("No se puede calificar el local si no ha realizado una compra satisfactoria");
        } 

        if (rowsVenta[0].calificacion < 1) {
            await pool.query("INSERT INTO calificacionclientelocal");
        } else {
            await pool.query("INSERT INTO calificacionclientelocal");
        }

        


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

module.exports = router;