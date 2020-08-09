const express = require('express');
const router = express.Router();
const { esCliente } = require('../../lib/auth');
const pool = require("../../database");


router.get('/listadoLocalesMayoristas', esCliente, async (req, res) => {
    try {
        //Buscar todos los locales mayoristas
        const rowsLocalesMayoristas = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.esMayorista = 1");

        res.render("cliente/explorar/listadoLocalesMayoristas", { rowsLocalesMayoristas });
    } catch (error) {
        console.log(error);

    }
});

router.get('/listadoLocalesMinoristas', esCliente, async (req, res) => {
    try {
        //Buscar todos los locales minoristas
        const rowsLocalesMinoristas = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.esMayorista = 0");

        res.render("cliente/explorar/listadoLocalesMinoristas", { rowsLocalesMinoristas, carrito:req.session.carrito});
    } catch (error) {
        console.log(error);

    }
});

router.get('/local/:idLocal', esCliente, async (req, res) => {
    try {
        const { idLocal } = req.params;
        //Buscar todos los locales mayoristas
        var rowsLocalesMayoristas = await pool.query("SELECT localcomercial.pkIdLocalComercial, localcomercial.nombreLocal, localcomercial.precioDomicilio, localcomercial.calificacionPromedio, localcomercial.descripcionLocal, localcomercial.estaAbierto, imagen.rutaImagen FROM localcomercial INNER JOIN imagen ON imagen.pkIdImagen = localcomercial.fkIdBanner WHERE localcomercial.pkIdLocalComercial = ?", [idLocal]);
        if (rowsLocalesMayoristas[0].estaAbierto == 1) {
            rowsLocalesMayoristas[0].textoEstaAbierto = '<div class="text-success" style="font-size: 1.5em;"><i class="fas fa-door-open"></i> Abierto </div>';
        } else {
            rowsLocalesMayoristas[0].textoEstaAbierto = '<div class="text-danger" style="font-size: 1.5em;"><i class="fas fa-door-closed"></i> Cerrado </div>';
        }
        console.log("el carrito ",req.session.carrito);
        const rowsProductoLocal = await pool.query("SELECT presentacionproducto.pkIdPresentacionProducto, presentacionproducto.nombrePresentacion,presentacionproducto.precioUnitarioPresentacion,productolocal.pkIdProductoLocal, producto.nombreProducto, producto.cssPropertiesBg, imagen.rutaImagen FROM localcomercial INNER JOIN productolocal ON productolocal.fkIdLocalComercial = localcomercial.pkIdLocalComercial INNER JOIN producto ON producto.pkIdProducto = productolocal.fkIdProducto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN presentacionproducto ON presentacionproducto.fkIdProductoLocal = productolocal.pkIdProductoLocal WHERE localcomercial.pkIdLocalComercial = ? ORDER BY  producto.nombreProducto ASC", [idLocal]);
        res.render("cliente/explorar/local", { rowsLocalesMayoristas: rowsLocalesMayoristas[0], rowsProductoLocal, carrito:req.session.carrito });
    } catch (error) {
        console.log(error);
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
        //Actualizar carrito
        
        //Preparar datos del producto para enviar al carrito
        var productoLocal = {
            idLocal: rowProductoLocal[0].pkIdLocalComercial,
            idPresentacionSeleccionada,
            detallesProductoLocal:rowProductoLocal[0].detallesProductoLocal,
            cantidadItem: 0,
            detallesCliente: "",
            precioUnitarioSeleccionado: rowsPresentacionProducto[0].precioUnitarioPresentacion,
            presentaciones: rowsPresentacionProducto,
            htmlJSON: ''
        }

        var html = '[';
        for (let index = 0; index < rowsPresentacionProducto.length; index++) {
            //Seleccionar presentación
            rowsPresentacionProducto[index].inputSelected = "";
            if (rowsPresentacionProducto[index].pkIdPresentacionProducto == idPresentacionSeleccionada) {
                rowsPresentacionProducto[index].inputSelected = "selected";
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

        res.render("cliente/explorar/productoLocal", { productoLocal, rowProductoLocal: rowProductoLocal[0] });
    } catch (error) {
        console.log(error);

    }
});

router.post('/agregarAlCarrito', esCliente, async (req, res) => {
    try {
        const { idLocal, idPresentacion, cantidadItem, detallesCliente } = req.body;
        
        res.redirect("/cliente/explorar/local/" + idLocal);
    } catch (error) {
        console.log(error);
        res.redirect("/cliente/explorar/listadoLocalesMinoristas");
    }
});

module.exports = router;