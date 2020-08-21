const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const multer = require('multer')
const uuid = require('uuid/v4');


const { database } = require('./keys');

// Intializations
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));
commitapp.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'cenabastosmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());


const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/img/uploads'),
  filename: (req, file, cb, filename) => {
    console.log(file);
    cb(null, uuid() + path.extname(file.originalname));
  }
})
app.use(multer({
  storage,
  fileFilter: function (req, file, cb) {

    try {
      var filetypes = /jpg|jpeg|png|webp/;
      var mimetype = filetypes.test(file.mimetype);
      var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb("Error: Solo se permiten archivos con extensión: - " + filetypes);
    } catch (error) {
      console.log(error);
    }
  },
  limits: { fileSize: 10000000 }
}).single('image'));

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.info = req.flash('info');
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require('./controllers/index'));
//administrador
app.use('/administrador/sesion', require('./controllers/administrador/sesion'));
app.use('/administrador/index', require('./controllers/administrador/index'));
app.use('/administrador/comerciante', require('./controllers/administrador/comerciante'));
app.use('/administrador/estadisticas', require('./controllers/administrador/estadisticas'));
app.use('/administrador/productos', require('./controllers/administrador/productos'));
//comerciante
app.use('/comerciante', require('./controllers/comerciante/index'));
app.use('/comerciante/locales', require('./controllers/comerciante/locales'));
app.use('/comerciante/sesion', require('./controllers/comerciante/sesion'));
app.use('/comerciante/notificacion', require('./controllers/comerciante/notificacion'));
//cliente
app.use('/cliente/explorar', require('./controllers/cliente/explorar'));
app.use('/cliente/sesion', require('./controllers/cliente/sesion'));
app.use('/cliente/pedidos', require('./controllers/cliente/pedidos'));
app.use('/cliente/buzon', require('./controllers/cliente/buzon'));
app.use('/cliente/perfil', require('./controllers/cliente/perfil'));
app.use('/cliente/notificacion', require('./controllers/cliente/notificacion'));
// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
});
