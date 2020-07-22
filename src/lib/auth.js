const auth = {};


auth.esComercianteAprobado = (req, res, next) => {
    if (req.isAuthenticated() && req.session.tipoUsuario == 2) {
        if (req.session.estaAprobado == 1) {
            return next();
        } else {
            return res.redirect('/comerciante/noAprobado');
        }
    }
    return res.redirect('/comerciante/login');
};

auth.esComerciante = (req, res, next) => {
    if (req.isAuthenticated() && req.session.tipoUsuario == 2) {
        return next();
    }
    return res.redirect('/comerciante/login');
};

module.exports = auth;