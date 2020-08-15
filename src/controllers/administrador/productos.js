const express = require('express');
const router = express.Router();
//const { esCliente } = require('../../lib/auth');
const pool = require("../../database");

router.get('/listadoProductos', async (req, res) => {
    try {
        const rowsListado = await pool.query("SELECT producto.pkIdProducto, producto.nombreProducto, imagen.rutaImagen, categoriaproducto.descripcionCategoriaProducto FROM producto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN categoriaproducto ON categoriaproducto.pkIdCategoriaProducto = producto.fkIdCategoriaProducto ORDER BY nombreProducto ASC");
        res.render("administrador/productos/listadoProductos", {rowsListado});
        
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/actualizarProducto/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const rowProducto = await pool.query("SELECT producto.pkIdProducto, producto.nombreProducto, producto.cssPropertiesBg, imagen.rutaImagen, categoriaproducto.pkIdCategoriaProducto FROM producto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN categoriaproducto ON categoriaproducto.pkIdCategoriaProducto = producto.fkIdCategoriaProducto WHERE producto.pkIdProducto = ?",[id]);
        var rowsCategorias = await pool.query("SELECT categoriaproducto.pkIdCategoriaProducto, categoriaproducto.descripcionCategoriaProducto FROM categoriaproducto");

        for (let index = 0; index < rowsCategorias.length; index++) {
            if (rowProducto[0].pkIdCategoriaProducto == rowsCategorias[index].pkIdCategoriaProducto) {
                rowsCategorias[index].selected = 'selected';
            }
            
        }
        res.render("administrador/productos/actualizarProducto", {rowProducto:rowProducto[0], rowsCategorias});
        
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/editarProducto', async (req, res) => {
    try {
        const {id, nameProd, descProd, cssProp} = req.body;
        const editProd = {
            nombreProducto: nameProd,
            cssPropertiesBg: cssProp,
            fkIdCategoriaProducto: descProd
        }

        await pool.query("UPDATE producto SET ? WHERE pkIdProducto = ?",[editProd,id]);

        res.redirect("/administrador/productos/listadoProductos");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

module.exports = router;
