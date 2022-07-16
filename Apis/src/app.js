const express = require('express');
require('express-async-errors');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const pkg = require('../package.json');

const usersRoutes = require('./routes/user.routes');
const authsRoutes = require('./routes/auth.routes');
const queryRoutes = require('./routes/query.routes');
const errors = require('./middlewares/errors');

//const { createRoles, createAdmin } = require('./libs/initialSetup');
const app = express();
//createRoles();
//createAdmin();

// Settings
app.set('pkg', pkg);
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 4);

// Middlewares
const corsOptions = {
  //origin: 'http://localhost:3000'
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Welcome Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to my Products API',
    version: app.get('pkg').version,
    description: app.get('pkg').description,
    author: app.get('pkg').author,
    name: process.env.NAME || app.get('pkg').name,
    alias: process.env.ALIAS || 'imv',
    society: process.env.SOCIETY || 'S.A.S',
    nit: process.env.NIT || '000000',
    logo:
      process.env.LOGO ||
      'https://grupoelitefincaraiz.com/img/avatars/avatar.svg',
    category: process.env.CATEGORY || 'Lotes',
    contact: {
      address: process.env.ADRESS || 'Indefinido',
      websites: process.env.WEB || 'Indefinido',
      phones: process.env.PHONES || 'Indefinido',
      emails: process.env.MAIL || 'Indefinido'
    },
    login:
      process.env.LOGIN ||
      `Con el poder de inmovili, ahora puedes concentrarte solo en
       funcionarios para sus productos digitales, dejando
      ¡el diseño de la interfaz de usuario por nuestra cuenta!`
  });
});

app.post('/webhook', (req, res) => {
  console.log(req.body);
});

// Routes exchangeRoutes
app.use('/api/users', usersRoutes);
app.use('/api/auth', authsRoutes);
app.use('/api/query', queryRoutes);
app.use(errors);

module.exports = app;
