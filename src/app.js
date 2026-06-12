require('dotenv').config();
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const pkg = require('../package.json');

const queryRoutes = require('./routes/query.routes');
const errors = require('./middlewares/errors');

const app = express();

// Settings
app.set('pkg', pkg);
app.set('port', process.env.PORT || 9000);
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
    message: 'Document and usury query API',
    version: app.get('pkg').version,
    description: app.get('pkg').description,
    endpoints: {
      document: 'POST /api/query/document',
      usury: 'POST /api/query/usury'
    }
  });
});

// Query routes
app.use('/api/query', queryRoutes);
app.use(errors);

module.exports = app;
