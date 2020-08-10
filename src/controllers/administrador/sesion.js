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

module.exports = router;