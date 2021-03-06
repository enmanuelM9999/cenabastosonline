const express = require('express');
const router = express.Router();
const { esAdmin } = require('../../lib/auth');
const pool = require("../../database");
const { body } = require('express-validator/check');


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

        const cloudinary = require("cloudinary");
        const { cloud_name, api_key, api_secret } = require("../../environmentVars");
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
            fkIdImagen: resultDb.insertId
        }

        await pool.query("INSERT INTO producto SET ?", [newProd]);

        res.redirect("/administrador/productos/listadoProductos");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});


router.post('/actualizarImagenProducto', esAdmin, async (req, res) => {
    try {
        const { producto } = req.body;
        const cloudinary = require("cloudinary");
        const { cloud_name, api_key, api_secret } = require("../../environmentVars");
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
        const rowLatestImage = await pool.query("SELECT imagen.publicId, imagen.pkIdImagen FROM producto INNER JOIN imagen ON imagen.pkIdImagen=producto.fkIdImagen WHERE producto.pkIdProducto=?", [producto]);
        if (rowLatestImage.length != 1) {
            throw new Error("impUsr-doDefafult-No existe una imagen asociada al producto o existe más de una imagen asociada al producto");
        }

        const resultCloud = await cloudinary.v2.uploader.upload(req.file.path);
        let newImagen = {
            publicId: resultCloud.public_id,
            rutaImagen: resultCloud.secure_url
        };
        const resultDb = await pool.query("INSERT INTO imagen SET ?", [newImagen]);
        const newProducto = {
            fkIdImagen: resultDb.insertId
        };

        await pool.query("UPDATE producto SET ? WHERE pkIdProducto=?", [newProducto, producto]);

        //Limpiar
        const deleteC=await cloudinary.v2.uploader.destroy(rowLatestImage[0].publicId);
        await pool.query("DELETE FROM imagen WHERE pkIdImagen=?", [rowLatestImage[0].pkIdImagen]);

        req.flash("success","Actualizado con éxito");
        res.redirect("/administrador/productos/listadoProductos");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
    finally {
        const fs = require("fs-extra");
        await fs.unlink(req.file.path);
    }
});

router.get('/listadoCategorias', esAdmin, async (req, res) => {
    try {
        const rowsListado = await pool.query("SELECT categoriaproducto.pkIdCategoriaProducto, categoriaproducto.descripcionCategoriaProducto, imagen.rutaImagen FROM categoriaproducto INNER JOIN imagen ON imagen.pkIdImagen = categoriaproducto.fkIdImagen ORDER BY descripcionCategoriaProducto ASC");
        res.render("administrador/productos/listadoCategorias", { rowsListado });

    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.get('/actualizarCategoriaProducto/:id', esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const rowCategoria = await pool.query("SELECT categoriaproducto.pkIdCategoriaProducto, categoriaproducto.descripcionCategoriaProducto, imagen.rutaImagen FROM categoriaproducto INNER JOIN imagen ON imagen.pkIdImagen = categoriaproducto.fkIdImagen WHERE categoriaproducto.pkIdCategoriaProducto = ?", [id]);
        res.render("administrador/productos/actualizarCategoria", { rowCategoria: rowCategoria[0] });

    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/editarCategoria', esAdmin, async (req, res) => {
    try {
        const { id, nameCatProd } = req.body;
        const editProd = {
            descripcionCategoriaProducto: nameCatProd
        }

        await pool.query("UPDATE categoriaproducto SET ? WHERE pkIdCategoriaProducto = ?", [editProd, id]);

        res.redirect("/administrador/productos/listadoCategorias");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/actualizarImagenCategoriaProducto', esAdmin, async (req, res) => {
    try {
        const { producto } = req.body;
        const cloudinary = require("cloudinary");
        const { cloud_name, api_key, api_secret } = require("../../environmentVars");
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
        const rowLatestImage = await pool.query("SELECT imagen.publicId, imagen.pkIdImagen FROM categoriaproducto INNER JOIN imagen ON imagen.pkIdImagen=categoriaproducto.fkIdImagen WHERE categoriaproducto.pkIdCategoriaProducto=?", [producto]);
        if (rowLatestImage.length != 1) {
            throw new Error("impUsr-doDefafult-No existe una imagen asociada al producto o existe más de una imagen asociada al producto");
        }

        const resultCloud = await cloudinary.v2.uploader.upload(req.file.path);
        let newImagen = {
            publicId: resultCloud.public_id,
            rutaImagen: resultCloud.secure_url
        };
        const resultDb = await pool.query("INSERT INTO imagen SET ?", [newImagen]);
        const newProducto = {
            fkIdImagen: resultDb.insertId
        };

        await pool.query("UPDATE categoriaproducto SET ? WHERE pkIdCategoriaProducto=?", [newProducto, producto]);

        //Limpiar
        const deleteC=await cloudinary.v2.uploader.destroy(rowLatestImage[0].publicId);
        await pool.query("DELETE FROM imagen WHERE pkIdImagen=?", [rowLatestImage[0].pkIdImagen]);

        req.flash("success","Actualizado con éxito");
        res.redirect("/administrador/productos/listadoCategorias");
    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
    finally {
        const fs = require("fs-extra");
        await fs.unlink(req.file.path);
    }
});


router.get('/crearCategoria', esAdmin, async (req, res) => {
    try {
        res.render("administrador/productos/crearCategoria");

    } catch (error) {
        console.log(error);
        res.redirect("/administrador/index");
    }
});

router.post('/crearCategoria', esAdmin, async (req, res) => {
    try {
        const { nameCatProd } = req.body;

        const cloudinary = require("cloudinary");
        const { cloud_name, api_key, api_secret } = require("../../environmentVars");
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
        
        const resultCloud = await cloudinary.v2.uploader.upload(req.file.path);
        let newImagen = {
            publicId: resultCloud.public_id,
            rutaImagen: resultCloud.secure_url
        };
        
        const resultDb = await pool.query("INSERT INTO imagen SET ?", [newImagen]);
        const newCatProd = {
            descripcionCategoriaProducto: nameCatProd,
            fkIdImagen: resultDb.insertId
        }
        
        await pool.query("INSERT INTO categoriaproducto SET ?", [newCatProd]);
        req.flash("success","Se ha creado la nueva categoria producto");
        res.redirect("/administrador/productos/listadoCategorias");
    } catch (error) {
        console.log(error);
        req.flash("messagge","Se ha producido un error, vuelva a intentar");
        res.redirect("/administrador/index");
    }
});

module.exports = router;
