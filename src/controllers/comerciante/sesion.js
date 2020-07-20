const express = require('express');
const router = express.Router();
const pool = require("../../database");
const passport = require("passport");

router.get('/signup', async (req, res) => {
  //Buscar los tipos de docs para la vista
  const rowsTipoDoc = await pool.query("SELECT pkIdTipoDocumento,descripcionTipoDocumento FROM tipodocumento");
  res.render('comerciante/sesion/signup', { rowsTipoDoc });
});

router.post("/signup",
  passport.authenticate("comerciante.signup", {
    successRedirect: "/comerciante/index",
    failureRedirect: "/comerciante/signup",
    failureFlash: true
  })
);

router.post("/signup", (req, res, next) => {
  req.check("email", "Campo vacío").notEmpty();
  req.check("password", "Campo vacío").notEmpty();
  req.check("name", "Campo vacío").notEmpty();
  req.check("lastname", "Campo vacío").notEmpty();
  req.check("phone", "Campo vacío").notEmpty();
  req.check("doc", "Campo vacío").notEmpty();

  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash("message", errors[0].msg);
    res.redirect("/comerciante/signup");
  }
  passport.authenticate("comerciante.signup", {
    successRedirect: "/comerciante/index",
    failureRedirect: "/comerciante/signup",
    failureFlash: true
  })(req, res, next);
});

router.get('/signin', async (req, res) => {
  res.render('comerciante/sesion/signin');
});

/*router.post(
  "/signin",
  passport.authenticate("comerciante.signin", {
    successRedirect: "/comerciante/index",
    failureRedirect: "/comerciante/signin",
    failureFlash: true
  })
);
*/

router.post("/signin", (req, res, next) => {
  req.check("email", "Campo vacío").notEmpty();
  req.check("password", "Campo vacío").notEmpty();

  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash("message", errors[0].msg);
    res.redirect("/comerciante/signin");
  }
  passport.authenticate("comerciante.signin", {
    successRedirect: "/comerciante/index",
    failureRedirect: "/comerciante/signin",
    failureFlash: true
  })(req, res, next);
});

module.exports = router;