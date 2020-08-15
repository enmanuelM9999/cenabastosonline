const auth = {};

auth.esAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.session.tipoUsuario == 1) {
        return next();
    }
    return res.redirect('/administrador/sesion/login');
};

auth.esComercianteAprobado = (req, res, next) => {
    if (req.isAuthenticated() && req.session.tipoUsuario == 2) {
        if (req.session.estaAprobado == 1) {
            return next();
        } else {
            return res.redirect('/comerciante/noAprobado');
        }
    }
    return res.redirect('/comerciante/sesion/login');
};

auth.esComerciante = (req, res, next) => {
    if (req.isAuthenticated() && req.session.tipoUsuario == 2) {
        return next();
    }
    return res.redirect('/comerciante/sesion/login');
};

/*auth.esClienteAprobado = (req, res, next) => {
    if (req.isAuthenticated() && req.session.tipoUsuario == 3) {
        if (req.session.estaAprobado == 1) {
            return next();
        } else {
            return res.redirect('/cliente/noAprobado');
        }
    }
    return res.redirect('/cliente/sesion/login');
};
*/

auth.esCliente = (req, res, next) => {
    if (req.isAuthenticated() && req.session.tipoUsuario == 3) {
        return next();
    }
    return res.redirect('/cliente/sesion/login');
};

module.exports = auth;