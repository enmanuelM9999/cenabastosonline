const express = require('express');
const router = express.Router();
const pool = require("../../database");
const passport = require("passport");


//---- logup

router.get('/logup', async (req, res) => {
  //Buscar los tipos de docs para la vista
  const rowsTipoDoc = await pool.query("SELECT pkIdTipoDocumento,descripcionTipoDocumento FROM tipodocumento");
  res.render('cliente/sesion/logup', { rowsTipoDoc });
});


router.post("/logup", (req, res, next) => {
  req.check("email", "Ingrese un correo").notEmpty();
  req.check("password", "Ingrese una contraseña").notEmpty();
  req.check("name", " Ingrese su nombre").notEmpty();
  req.check("lastname", "Ingrese su apellido").notEmpty();
  req.check("phone", "Ingrese su teléfono").notEmpty();
  req.check("doc", "Ingrese su documento").notEmpty();
  req.check("direccion", "Ingrese su dirección").notEmpty();

  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash("message", errors[0].msg);
    res.redirect("/cliente/sesion/logup");
  }
  passport.authenticate("cliente.logup", {
    successRedirect: "/cliente/explorar/listadoLocalesMinoristas",
    failureRedirect: "/cliente/sesion/logup",
    failureFlash: true
  })(req, res, next);
});

//---- login

router.get('/login', async (req, res) => {
  res.render('cliente/sesion/login');
});

router.post("/login", (req, res, next) => {
  req.check("email", "Ingrese su correo").notEmpty();
  req.check("password", "Ingrese su contraseña").notEmpty();

  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash("message", errors[0].msg);
    res.redirect("/cliente/sesion/login");
  }
  passport.authenticate("cliente.login", {
    successRedirect: "/cliente/explorar/listadoLocalesMinoristas",
    failureRedirect: "/cliente/sesion/login",
    failureFlash: true
  })(req, res, next);
});

//---- logout

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

router.get("/updatelogout", (req, res) => {
  req.logOut();
  res.redirect("/cliente/sesion/login");
});

//---- recuperar Contraseña

router.get('/recuperarClave', async (req, res) => {
  try {
    res.render('cliente/sesion/recuperarClave');
  } catch (error) {
    console.log(error);
    res.redirect('/cliente/sesion/login');
  }
  
});

router.post('/recuperarClave', async (req, res) => {
  try {
    const claveManager = require("../../lib/recuperarClave.manager");
    const { email } = req.body;
    const result=await claveManager.recuperarClave(email);
    console.log("el result chido ", result);
    if (result.error) {
      throw new Error(result.msg);
    }
    req.flash('success', 'Datos enviados, por favor revise su correo electrónico');
    res.redirect('/cliente/sesion/login');
  } catch (error) {
    console.log(error)
    req.flash("message",error.message);
    res.redirect("/cliente/sesion/login");
  }

});

module.exports = router;