const express = require('express');
const router = express.Router();
const { esAdmin } = require('../../lib/auth');
const pool = require("../../database");

const cloudinary = require("cloudinary");
const { cloud_name, api_key, api_secret } = require("../../environmentVars");
cloudinary.config({
    cloud_name,
    api_key,
    api_secret
});

router.get('/listadoProductos', esAdmin, async (req, res) => {
    try {
        const rowsListado = await pool.query("SELECT producto.pkIdProducto, producto.nombreProducto, imagen.rutaImagen, categoriaproducto.descripcionCategoriaProducto FROM producto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN categoriaproducto ON categoriaproducto.pkIdCategoriaProducto = producto.fkIdCategoriaProducto ORDER BY nombreProducto ASC");
        res.render("administrador/productos/listadoProductos", { rowsListado });

    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/actualizarProducto/:id', esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const rowProducto = await pool.query("SELECT producto.pkIdProducto, producto.nombreProducto, producto.cssPropertiesBg, imagen.rutaImagen, categoriaproducto.pkIdCategoriaProducto FROM producto INNER JOIN imagen ON imagen.pkIdImagen = producto.fkIdImagen INNER JOIN categoriaproducto ON categoriaproducto.pkIdCategoriaProducto = producto.fkIdCategoriaProducto WHERE producto.pkIdProducto = ?", [id]);
        var rowsCategorias = await pool.query("SELECT categoriaproducto.pkIdCategoriaProducto, categoriaproducto.descripcionCategoriaProducto FROM categoriaproducto");

        for (let index = 0; index < rowsCategorias.length; index++) {
            if (rowProducto[0].pkIdCategoriaProducto == rowsCategorias[index].pkIdCategoriaProducto) {
                rowsCategorias[index].selected = 'selected';
            }

        }
        res.render("administrador/productos/actualizarProducto", { rowProducto: rowProducto[0], rowsCategorias });

    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/editarProducto', esAdmin, async (req, res) => {
    try {
        const { id, nameProd, descProd, cssProp } = req.body;
        const editProd = {
            nombreProducto: nameProd,
            cssPropertiesBg: cssProp,
            fkIdCategoriaProducto: descProd
        }

        await pool.query("UPDATE producto SET ? WHERE pkIdProducto = ?", [editProd, id]);

        res.redirect("/administrador/productos/listadoProductos");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/crearProducto', esAdmin, async (req, res) => {
    try {
        const rowsCategorias = await pool.query("SELECT categoriaproducto.pkIdCategoriaProducto, categoriaproducto.descripcionCategoriaProducto FROM categoriaproducto ORDER BY descripcionCategoriaProducto ASC");
        res.render("administrador/productos/crearProducto", { rowsCategorias });

    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/crearProducto', esAdmin, async (req, res) => {
    try {
        const { nameProd, descProd, cssProp } = req.body;

        const size = req.file.size;
        const extension = req.file.mimetype.split("/")[1].toString();
        if (extension.trim() != "png" && extension.trim() != "jpg" && extension.trim() != "jpeg" && extension.trim() != "webp") {
            throw new Error("impUsr-doDefault-Debes subir una imagen con extensión png, jpg, jpeg o webp");
        }
        if (size > 5242880) {
            throw new Error("impUsr-doDefault-Tu imagen no puede pesar más de 5 MB");
        }

        const resultCloud = await cloudinary.v2.uploader.upload(req.file.path);
        let newImagen = {
            publicId: resultCloud.public_id,
            rutaImagen: resultCloud.secure_url
        };
        const resultDb = await pool.query("INSERT INTO imagen SET ?", [newImagen]);
        const newProd = {
            nombreProducto: nameProd,
            cssPropertiesBg: cssProp,
            fkIdCategoriaProducto: descProd,
            fkIdImagen:resultDb.insertId
        }

        await pool.query("INSERT INTO producto SET ?", [newProd]);

        res.redirect("/administrador/productos/listadoProductos");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

module.exports = router;
