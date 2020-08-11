const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');


//---- Administrador ----//

passport.use('administrador.login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {

    //Verificar si existe y no esta aceptado
    const rowsUsuario = await pool.query("SELECT usuario.pkIdUsuario, usuario.correoUsuario, CAST(aes_decrypt(claveUsuario," + password + ")AS CHAR(200))claveUsuario, admin.pkIdAdmin FROM usuario INNER JOIN admin ON admin.fkIdUsuario = usuario.pkIdUsuario WHERE usuario.correoUsuario=?", [email]);
    if (rowsUsuario.length == 0) {
      throw "1-No existe un usuario para el correo " + email;
    }

    //Comprobar si las contraseña es correcta
    if (rowsUsuario[0].claveUsuario != password) {
      throw "1-Las contraseñas no coinciden";
    }

    //Guardar variables en sesion
    req.session.idUser = rowsUsuario[0].pkIdUsuario;
    req.session.idAdmin = rowsUsuario[0].pkIdAdmin;
    req.session.tipoUsuario = 1;

    //Terminar inicio sesion
    const usuario = { id: rowsUsuario[0].pkIdUsuario };
    done(null, usuario);

  } catch (error) {
    console.log(error);
    return done(null, null, req.flash('message', "Error procesando datos"));
  }
}));

//---- Comerciante ----//

passport.use('comerciante.logup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const { name, lastname, tipoDoc, doc, phone } = req.body;

    //Verificar si existe y no esta aceptado
    const rowsUsuariosNoAceptados = await pool.query("SELECT usuario.pkIdUsuario FROM usuario INNER JOIN personanatural ON personanatural.fkIdUsuario=usuario.pkIdUsuario INNER JOIN comerciante ON personanatural.pkIdPersonaNatural=comerciante.fkIdPersonaNatural WHERE comerciante.estaAprobado=0 AND usuario.correoUsuario=?", [email]);
    if (rowsUsuariosNoAceptados.length > 0) {
      throw "1-Ya existe un usuario pendiente para ser aceptado, por favor inicie sesión";
    }
    //Verificar si existe y esta aceptado
    const rowsUsuariosAceptados = await pool.query("SELECT usuario.pkIdUsuario FROM usuario INNER JOIN personanatural ON personanatural.fkIdUsuario=usuario.pkIdUsuario INNER JOIN comerciante ON personanatural.pkIdPersonaNatural=comerciante.fkIdPersonaNatural WHERE comerciante.estaAprobado=1 AND usuario.correoUsuario=?", [email]);
    if (rowsUsuariosAceptados.length > 0) {
      throw "1-Ya existe un usuario activo, por favor inicie sesión";
    }
    //Crear y Registrar en BD el nuevo Usuario
    let newUser = {
      correoUsuario: email,
      claveUsuario: password
    };

    const resultNewUser = await pool.query('INSERT INTO usuario (correoUsuario,claveUsuario) VALUES ( ? ,aes_encrypt("' + newUser.claveUsuario + '","' + newUser.claveUsuario + '"))', [newUser.correoUsuario]);
    const idUser = resultNewUser.insertId;

    //Crear y Registrar en BD la nueva Persona Natural
    let newPersonaNatural = {
      nombresPersonaNatural: name,
      apellidosPersonaNatural: lastname,
      fkIdTipoDocumento: tipoDoc,
      numeroDocumento: doc,
      telefonoPersonaNatural: phone,
      fkIdUsuario: idUser
    };
    const resultNewPersonaNatural = await pool.query("INSERT INTO personaNatural SET ?", [newPersonaNatural]);
    const idPersonaNatural = resultNewPersonaNatural.insertId;

    //Crear y Registrar en BD el nuevo Comerciante
    let newComerciante = {
      fkIdPersonaNatural: idPersonaNatural,
      estaAprobado: 0
    };
    const resultNewComerciante = await pool.query("INSERT INTO comerciante SET ?", [newComerciante]);
    const idComerciante = resultNewComerciante.insertId;

    //Guardar variables en sesion
    req.session.idUser = idUser;
    req.session.idPersonaNatural = idPersonaNatural;
    req.session.idComerciante = idComerciante;
    req.session.estaAprobado = newComerciante.estaAprobado;
    req.session.tipoUsuario = 2;


    //Terminar regitro
    const usuario = { id: idUser };
    done(null, usuario);

  } catch (error) {
    console.log(error);
    return done(null, null, req.flash('message', "Error procesando datos"));
  }
}));


passport.use('comerciante.login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {

    //Verificar si existe y no esta aceptado
    const rowsUsuario = await pool.query("SELECT usuario.pkIdUsuario, usuario.correoUsuario, CAST(aes_decrypt(claveUsuario," + password + ")AS CHAR(200))claveUsuario, personaNatural.pkIdPersonaNatural, personaNatural.nombresPersonaNatural, comerciante.pkIdComerciante, comerciante.estaAprobado FROM usuario INNER JOIN personanatural ON personanatural.fkIdUsuario=usuario.pkIdUsuario INNER JOIN comerciante ON personanatural.pkIdPersonaNatural=comerciante.fkIdPersonaNatural WHERE usuario.correoUsuario=?", [email]);
    if (rowsUsuario.length == 0) {
      throw "1-No existe un usuario para el correo " + email;
    }

    //Comprobar si las contraseña es correcta
    if (rowsUsuario[0].claveUsuario != password) {
      throw "1-Las contraseñas no coinciden";
    }

    //Guardar variables en sesion
    req.session.idUser = rowsUsuario[0].pkIdUsuario;
    req.session.idPersonaNatural = rowsUsuario[0].pkIdPersonaNatural;
    req.session.idComerciante = rowsUsuario[0].pkIdComerciante;
    req.session.estaAprobado = rowsUsuario[0].estaAprobado;
    req.session.tipoUsuario = 2;

    //Terminar inicio sesion
    const usuario = { id: rowsUsuario[0].pkIdUsuario };
    done(null, usuario);

  } catch (error) {
    console.log(error);
    return done(null, null, req.flash('message', "Error procesando datos"));
  }
}));


//---- Cliente ----//

passport.use('cliente.logup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const { name, lastname, tipoDoc, doc, phone, direccion } = req.body;

    //Verificar si existe
    const rowsUsuariosAceptados = await pool.query("SELECT usuario.pkIdUsuario FROM usuario WHERE usuario.correoUsuario=?", [email]);
    if (rowsUsuariosAceptados.length > 0) {
      throw "1-Ya existe un usuario, por favor inicie sesión";
    }
    //Crear y Registrar en BD el nuevo Usuario
    let newUser = {
      correoUsuario: email,
      claveUsuario: password
    };

    const resultNewUser = await pool.query('INSERT INTO usuario (correoUsuario,claveUsuario) VALUES ( ? ,aes_encrypt("' + newUser.claveUsuario + '","' + newUser.claveUsuario + '"))', [newUser.correoUsuario]);
    const idUser = resultNewUser.insertId;

    //Crear y Registrar en BD la nueva Persona Natural
    let newPersonaNatural = {
      nombresPersonaNatural: name,
      apellidosPersonaNatural: lastname,
      fkIdTipoDocumento: tipoDoc,
      numeroDocumento: doc,
      telefonoPersonaNatural: phone,
      fkIdUsuario: idUser
    };
    const resultNewPersonaNatural = await pool.query("INSERT INTO personaNatural SET ?", [newPersonaNatural]);
    const idPersonaNatural = resultNewPersonaNatural.insertId;

    //Crear y Registrar en BD el nuevo Cliente
    let newCliente = {
      fkIdPersonaNatural: idPersonaNatural,
      direccionCliente: direccion
    };
    const resultNewCliente = await pool.query("INSERT INTO cliente SET ?", [newCliente]);
    const idCliente = resultNewCliente.insertId;

    //Guardar variables en sesion
    req.session.idUser = idUser;
    req.session.idPersonaNatural = idPersonaNatural;
    req.session.idCliente = idCliente;
    req.session.tipoUsuario = 3;

    //Carrito

    //Terminar regitro
    const usuario = { id: idUser };
    done(null, usuario);

  } catch (error) {
    console.log(error);
    return done(null, null, req.flash('message', "Error procesando datos"));
  }
}));


passport.use('cliente.login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {

    //Verificar si existe y no esta aceptado
    const rowsUsuario = await pool.query("SELECT usuario.pkIdUsuario, usuario.correoUsuario, CAST(aes_decrypt(claveUsuario," + password + ")AS CHAR(200))claveUsuario, personaNatural.pkIdPersonaNatural, personaNatural.nombresPersonaNatural, cliente.pkIdCliente FROM usuario INNER JOIN personanatural ON personanatural.fkIdUsuario=usuario.pkIdUsuario INNER JOIN cliente ON personanatural.pkIdPersonaNatural=cliente.fkIdPersonaNatural WHERE usuario.correoUsuario=?", [email]);
    if (rowsUsuario.length == 0) {
      throw "1-No existe un usuario para el correo " + email;
    }

    //Comprobar si las contraseña es correcta
    if (rowsUsuario[0].claveUsuario != password) {
      throw "1-Las contraseñas no coinciden";
    }

    //Guardar variables en sesion
    req.session.idUser = rowsUsuario[0].pkIdUsuario;
    req.session.idPersonaNatural = rowsUsuario[0].pkIdPersonaNatural;
    req.session.idCliente = rowsUsuario[0].pkIdCliente;
    req.session.tipoUsuario = 3;

    //Carrito

    //Terminar inicio sesion
    const usuario = { id: rowsUsuario[0].pkIdUsuario };
    done(null, usuario);

  } catch (error) {
    console.log(error);
    return done(null, null, req.flash('message', "Error procesando datos"));
  }
}));


// ---- Comun ----
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM usuario WHERE pkIdUsuario  = ?', [id]);
  done(null, rows[0]);
});

