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
  req.check("email", "Campo vacío").notEmpty();
  req.check("password", "Campo vacío").notEmpty();
  req.check("name", "Campo vacío").notEmpty();
  req.check("lastname", "Campo vacío").notEmpty();
  req.check("phone", "Campo vacío").notEmpty();
  req.check("doc", "Campo vacío").notEmpty();
  req.check("direccion", "Campo vacío").notEmpty();

  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash("message", errors[0].msg);
    res.redirect("/cliente/sesion/logup");
  }
  passport.authenticate("cliente.logup", {
    successRedirect: "/cliente/explorar/listadoLocalesMayoristas",
    failureRedirect: "/cliente/sesion/logup",
    failureFlash: true
  })(req, res, next);
});

//---- login

router.get('/login', async (req, res) => {
  res.render('cliente/sesion/login');
});

router.post("/login", (req, res, next) => {
  req.check("email", "Campo vacío").notEmpty();
  req.check("password", "Campo vacío").notEmpty();

  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash("message", errors[0].msg);
    res.redirect("/cliente/sesion/login");
  }
  passport.authenticate("cliente.login", {
    successRedirect: "/cliente/explorar/listadoLocalesMayoristas",
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

module.exports = router;