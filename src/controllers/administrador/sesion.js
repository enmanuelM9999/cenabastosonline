const express = require('express');
const router = express.Router();
const pool = require("../../database");
const passport = require("passport");

//---- login

router.get('/login', async (req, res) => {
  res.render('administrador/sesion/login');
});

router.post("/login", (req, res, next) => {
  req.check("email", "Campo vacío").notEmpty();
  req.check("password", "Campo vacío").notEmpty();

  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash("message", errors[0].msg);
    res.redirect("/administrador/sesion/login");
  }
  passport.authenticate("administrador.login", {
    successRedirect: "/administrador/index",
    failureRedirect: "/administrador/sesion/login",
    failureFlash: true
  })(req, res, next);
});

//---- logout

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/administrador/sesion/login");
});

//---- recuperar Contraseña

router.get('/recuperarClave', async (req, res) => {
  try {
    res.render('administrador/sesion/recuperarClave');
  } catch (error) {
    console.log(error);
    res.redirect('/administrador/sesion/login');
  }
  
});

router.post('/recuperarClave', async (req, res) => {
  try {
    const claveManager = require("../../lib/recuperarClave.manager");
    const { email } = req.body;
    const result=claveManager.recuperarClave(email);
    if (result.error) {
      throw new Error(result.msg);
    }
    req.flash('success', 'Datos enviados, por favor revise su correo electrónico');
    res.redirect('/administrador/sesion/login');
  } catch (error) {
    console.log(error)
    req.flash("message",error.message);
    res.redirect("/administrador/session/login");
  }

});

module.exports = router;