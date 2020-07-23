const express = require('express');
const router = express.Router();
const { esComerciante, esComercianteAprobado } = require('../../lib/auth');
const pool = require("../../database");

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
        const tempLocal = rowsLocalesImprimibles[0];
        const primerLocal = [tempLocal];
        console.log(primerLocal);
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
        var primerLocal = await pool.query("SELECT pkIdLocalComercial,nombreLocal,esMayorista,precioDomicilio,descripcionLocal,calificacionPromedio,calificacionContadorCliente,idLocalEnCenabastos,totalVendido,parcialVendido,estaAbierto FROM localcomercial WHERE pkIdLocalComercial=?", [id]);
        var tempLocal = primerLocal[0];
        const mayomino = primerLocal.esMayorista;
        if (mayomino == 0) {
            primerLocal.mayoMino = "Minorista";
        } else if (mayomino == 1) {
            primerLocal.mayoMino = "Mayorista";
        }
        primeroLocal=[tempLocal];
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
        //console.log(req.body);

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
        const tamanio = productos.length;
        while (i < tamanio) {
            await pool.query("INSERT INTO productoLocal (fkIdLocalComercial, fkIdProducto) VALUES (?,?)", [idLocalComercial, productos[i]]);
            i++;
        }

        res.redirect('/comerciante/listadoLocales');
    } catch (error) {
        console.log(error);
        res.redirect('/comerciante/listadoLocales');
    }
});

router.get('/pedidos', esComercianteAprobado, async (req, res) => {
    try {
     res.render("comerciante/locales/pedidos");
    } catch (error) {
        console.log(error);
    }
});

router.get('/buzon', esComercianteAprobado, async (req, res) => {
    try {
     res.render("comerciante/locales/buzon");
    } catch (error) {
        console.log(error);
    }
});

router.get('/ajustes', esComercianteAprobado, async (req, res) => {
    try {
     res.render("comerciante/locales/ajustes");
    } catch (error) {
        console.log(error);
    }
});

router.get('/actualizarProductos', esComercianteAprobado, async (req, res) => {
    try {
     res.render("comerciante/locales/actualizarProductos");
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;

